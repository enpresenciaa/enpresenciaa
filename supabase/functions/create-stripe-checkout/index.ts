import { createClient } from "npm:@supabase/supabase-js@2.112.3";
import Stripe from "npm:stripe@22.0.0";

import { isHttpsUrl, isUuid } from "../_shared/billing.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/http.ts";

type CheckoutRequest = { attemptId?: unknown };

function requireServerEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`MISSING_${name}`);
  }

  return value;
}

function getServerKey(): string {
  return Deno.env.get("SUPABASE_SECRET_KEY")?.trim() ||
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function getPublishableKey(): string {
  return Deno.env.get("SUPABASE_PUBLISHABLE_KEY")?.trim() ||
    requireServerEnv("SUPABASE_ANON_KEY");
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("METHOD_NOT_ALLOWED", 405);
  }

  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("AUTH_REQUIRED", 401);
  }

  let attemptId: string;

  let attemptAdmin: ReturnType<typeof createClient> | undefined;
  let authenticatedUserId: string | undefined;

  try {
    const body = await request.json() as CheckoutRequest;

    if (!isUuid(body.attemptId)) {
      return errorResponse("INVALID_ATTEMPT", 400);
    }

    attemptId = body.attemptId;
  } catch {
    return errorResponse("INVALID_REQUEST", 400);
  }

  try {
    const supabaseUrl = requireServerEnv("SUPABASE_URL");
    const userClient = createClient(supabaseUrl, getPublishableKey(), {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const accessToken = authorization.slice("Bearer ".length);
    const { data: { user }, error: authError } = await userClient.auth.getUser(accessToken);

    if (authError || !user) {
      return errorResponse("AUTH_INVALID", 401);
    }

    const admin = createClient(supabaseUrl, getServerKey(), { auth: { persistSession: false } });
    attemptAdmin = admin;
    authenticatedUserId = user.id;
    const stripeSecretKey = requireServerEnv("STRIPE_SECRET_KEY");
    const priceId = requireServerEnv("STRIPE_TEST_PRICE_ID");
    const successUrl = requireServerEnv("STRIPE_CHECKOUT_SUCCESS_URL");
    const cancelUrl = requireServerEnv("STRIPE_CHECKOUT_CANCEL_URL");

    if (!priceId.startsWith("price_") || !isHttpsUrl(successUrl) || !isHttpsUrl(cancelUrl)) {
      throw new Error("INVALID_SERVER_CONFIGURATION");
    }

    const stripe = new Stripe(stripeSecretKey);
    const { data: activeSubscriptions, error: subscriptionError } = await admin
      .from("billing_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["incomplete", "trialing", "active", "past_due", "unpaid", "paused"])
      .limit(1);

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (activeSubscriptions.length > 0) {
      return errorResponse("SUBSCRIPTION_EXISTS", 409);
    }

    await admin
      .from("billing_checkout_attempts")
      .update({ status: "expired" })
      .eq("user_id", user.id)
      .in("status", ["creating", "open"])
      .lt("updated_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());

    const { error: attemptError } = await admin.from("billing_checkout_attempts").insert({
      attempt_id: attemptId,
      user_id: user.id,
    });

    if (attemptError && attemptError.code !== "23505") {
      throw attemptError;
    }

    if (attemptError?.code === "23505") {
      const { data: existingAttempt } = await admin
        .from("billing_checkout_attempts")
        .select("attempt_id")
        .eq("attempt_id", attemptId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingAttempt) {
        return errorResponse("CHECKOUT_IN_PROGRESS", 409);
      }
    }

    const { data: existingCustomer, error: customerReadError } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerReadError) {
      throw customerReadError;
    }

    let customerId = existingCustomer?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { supabase_user_id: user.id },
      }, { idempotencyKey: `billing-customer:${user.id}` });
      customerId = customer.id;

      const { error: customerWriteError } = await admin.from("billing_customers").upsert({
        stripe_customer_id: customerId,
        user_id: user.id,
      }, { onConflict: "user_id" });

      if (customerWriteError) {
        throw customerWriteError;
      }
    }

    const session = await stripe.checkout.sessions.create({
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { attempt_id: attemptId, supabase_user_id: user.id },
      mode: "subscription",
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: successUrl,
    }, { idempotencyKey: `checkout:${user.id}:${attemptId}` });

    if (!session.url || !isHttpsUrl(session.url)) {
      throw new Error("INVALID_CHECKOUT_URL");
    }

    const { error: attemptUpdateError } = await admin
      .from("billing_checkout_attempts")
      .update({
        expires_at: new Date(session.expires_at * 1000).toISOString(),
        status: "open",
        stripe_checkout_session_id: session.id,
      })
      .eq("attempt_id", attemptId)
      .eq("user_id", user.id);

    if (attemptUpdateError) {
      throw attemptUpdateError;
    }

    console.log(JSON.stringify({ action: "checkout_created", attemptId, userId: user.id }));
    return jsonResponse({ url: session.url });
  } catch (error) {
    if (attemptAdmin && authenticatedUserId) {
      await attemptAdmin.from("billing_checkout_attempts").update({ status: "failed" }).eq("attempt_id", attemptId).eq("user_id", authenticatedUserId);
    }

    console.error(JSON.stringify({
      action: "checkout_failed",
      code: error instanceof Error && error.message.startsWith("MISSING_") ? "SERVER_CONFIGURATION" : "CHECKOUT_FAILED",
    }));
    return errorResponse("CHECKOUT_UNAVAILABLE", 500);
  }
});
