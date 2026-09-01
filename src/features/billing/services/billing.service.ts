import { supabase } from "@/lib/supabase";
import type { BillingSubscription } from "@/features/billing/types";
import { parseCheckoutUrl } from "@/features/billing/utils/billing.utils";

export async function createStripeCheckout(attemptId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
    body: { attemptId },
  });

  if (error) {
    throw new Error("CHECKOUT_REQUEST_FAILED");
  }

  return parseCheckoutUrl(data);
}

export async function getLatestBillingSubscription(userId: string): Promise<BillingSubscription | null> {
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
