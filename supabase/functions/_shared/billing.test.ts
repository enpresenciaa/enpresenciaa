import { describe, expect, test } from "bun:test";

import { isBillingSubscriptionStatus, isHttpsUrl, isUuid, unixSecondsToIso } from "./billing";

describe("billing edge helpers", () => {
  test("accepts only HTTPS checkout URLs", () => {
    expect(isHttpsUrl("https://checkout.stripe.com/c/pay/test")).toBe(true);
    expect(isHttpsUrl("http://checkout.stripe.com/c/pay/test")).toBe(false);
    expect(isHttpsUrl("enpresenciaa://billing/return")).toBe(false);
  });

  test("validates attempt UUIDs", () => {
    expect(isUuid("5f40cb47-49ab-4a56-9b3a-3e7d98b1e157")).toBe(true);
    expect(isUuid("user-controlled-price")).toBe(false);
  });

  test("limits persisted subscription statuses", () => {
    expect(isBillingSubscriptionStatus("active")).toBe(true);
    expect(isBillingSubscriptionStatus("free_forever")).toBe(false);
  });

  test("maps Stripe timestamps", () => {
    expect(unixSecondsToIso(0)).toBe("1970-01-01T00:00:00.000Z");
    expect(unixSecondsToIso(null)).toBeNull();
  });
});
