import { createClient } from "npm:@supabase/supabase-js@2.112.3";
import Stripe from "npm:stripe@22.0.0";

import { isBillingSubscriptionStatus, isUuid, unixSecondsToIso } from "../_shared/billing.ts";
import { errorResponse, jsonResponse } from "../_shared/http.ts";

const SUPPORTED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

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

function getSubscriptionId(session: Stripe.Checkout.Session): string | null {
  return typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
}

Deno.serve(async request => {
  if (request.method !== "POST") {
    return errorResponse("METHOD_NOT_ALLOWED", 405);
  }

  const signature = request.headers.get("Stripe-Signature");

  if (!signature) {
    return errorResponse("SIGNATURE_REQUIRED", 400);
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(requireServerEnv("STRIPE_SECRET_KEY"));
    const rawBody = await request.text();
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      requireServerEnv("STRIPE_WEBHOOK_SECRET"),
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return errorResponse("SIGNATURE_INVALID", 400);
  }

  const supabaseUrl = requireServerEnv("SUPABASE_URL");
  const admin = createClient(supabaseUrl, getServerKey(), { auth: { persistSession: false } });
  const { data: claimed, error: claimError } = await admin.rpc("claim_stripe_webhook_event", {
    p_event_type: event.type,
    p_stripe_created_at: event.created,
    p_stripe_event_id: event.id,
  });

  if (claimError) {
    return errorResponse("EVENT_CLAIM_FAILED", 500);
  }

  if (!claimed) {
    return jsonResponse({ duplicate: true, received: true });
  }

  if (!SUPPORTED_EVENTS.has(event.type)) {
    await admin.from("stripe_webhook_events").update({
      processed_at: new Date().toISOString(),
      processing_status: "ignored",
    }).eq("stripe_event_id", event.id);
    return jsonResponse({ received: true });
  }

  try {
    const stripe = new Stripe(requireServerEnv("STRIPE_SECRET_KEY"));
    let subscription: Stripe.Subscription;
    let checkoutAttemptId: string | undefined;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = getSubscriptionId(session);

      if (!subscriptionId) {
        throw new Error("SUBSCRIPTION_ID_MISSING");
      }

      subscription = await stripe.subscriptions.retrieve(subscriptionId);

      checkoutAttemptId = isUuid(session.metadata?.attempt_id) ? session.metadata.attempt_id : undefined;
    } else {
      subscription = event.data.object as Stripe.Subscription;
    }

    const userId = subscription.metadata.supabase_user_id;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const priceId = subscription.items.data[0]?.price.id;

    if (!isUuid(userId) || !priceId || !isBillingSubscriptionStatus(subscription.status)) {
      throw new Error("SUBSCRIPTION_DATA_INVALID");
    }

    const { data: customer, error: customerError } = await admin.from("billing_customers")
      .select("user_id")
      .eq("user_id", userId)
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (customerError || !customer) {
      throw new Error("CUSTOMER_MAPPING_MISSING");
    }

    const { error: syncError } = await admin.rpc("sync_stripe_subscription", {
      p_cancel_at_period_end: subscription.cancel_at_period_end,
      p_canceled_at: unixSecondsToIso(subscription.canceled_at),
      p_current_period_end: unixSecondsToIso(subscription.items.data[0]?.current_period_end ?? null),
      p_current_period_start: unixSecondsToIso(subscription.items.data[0]?.current_period_start ?? null),
      p_ended_at: unixSecondsToIso(subscription.ended_at),
      p_status: subscription.status,
      p_stripe_event_created_at: event.created,
      p_stripe_price_id: priceId,
      p_stripe_subscription_id: subscription.id,
      p_user_id: userId,
    });

    if (syncError) {
      throw syncError;
    }

    const { error: eventUpdateError } = await admin.from("stripe_webhook_events").update({
      processed_at: new Date().toISOString(),
      processing_status: "processed",
    }).eq("stripe_event_id", event.id);

    if (eventUpdateError) {
      throw eventUpdateError;
    }

    if (checkoutAttemptId) {
      await admin.from("billing_checkout_attempts").update({ status: "completed" }).eq("attempt_id", checkoutAttemptId);
    }

    console.log(JSON.stringify({ action: "stripe_event_processed", eventId: event.id, eventType: event.type }));
    return jsonResponse({ received: true });
  } catch {
    await admin.from("stripe_webhook_events").update({
      error_code: "PROCESSING_FAILED",
      processing_status: "failed",
    }).eq("stripe_event_id", event.id);
    console.error(JSON.stringify({ action: "stripe_event_failed", eventId: event.id, eventType: event.type }));
    return errorResponse("EVENT_PROCESSING_FAILED", 500);
  }
});
