import type { Database } from "@/types/database";

export type BillingSubscription = Database["public"]["Tables"]["billing_subscriptions"]["Row"];

export type CheckoutUiStatus = "idle" | "opening" | "browser_open" | "cancelled" | "pending" | "confirmed" | "error";
