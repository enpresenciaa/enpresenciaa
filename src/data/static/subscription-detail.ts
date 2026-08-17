import type { PaymentHistory, Subscription } from "@/types";
import { staticSubscriptions } from "./subscriptions";

/**
 * One subscription with payment history for the subscription detail screen (UI-first).
 * Uses first from staticSubscriptions with empty history; replace history when you have export data.
 */
export const staticSubscriptionDetail: Subscription & { history: PaymentHistory[] } = {
  ...staticSubscriptions[0],
  history: [],
};
