export const BILLING_SUBSCRIPTION_STATUSES = [
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
] as const;

export type BillingSubscriptionStatus = typeof BILLING_SUBSCRIPTION_STATUSES[number];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBillingSubscriptionStatus(value: string): value is BillingSubscriptionStatus {
  return BILLING_SUBSCRIPTION_STATUSES.includes(value as BillingSubscriptionStatus);
}

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function unixSecondsToIso(value: number | null): string | null {
  return value === null ? null : new Date(value * 1000).toISOString();
}
