import { describe, expect, test } from "bun:test";

import { classifyBrowserCompletion, isStripeTestCheckoutVisible, parseCheckoutUrl, runOnce } from "./billing.utils.ts";

describe("billing mobile helpers", () => {
  test("requires development and the explicit flag", () => {
    expect(isStripeTestCheckoutVisible(true, true)).toBe(true);
    expect(isStripeTestCheckoutVisible(true, false)).toBe(false);
    expect(isStripeTestCheckoutVisible(false, true)).toBe(false);
  });

  test("accepts only a valid HTTPS URL", () => {
    expect(parseCheckoutUrl({ url: "https://checkout.stripe.com/c/pay/test" })).toStartWith("https://");
    expect(() => parseCheckoutUrl({ url: "http://example.com" })).toThrow("CHECKOUT_URL_NOT_HTTPS");
    expect(() => parseCheckoutUrl({})).toThrow("CHECKOUT_RESPONSE_INVALID");
  });

  test("classifies browser cancellation separately", () => {
    expect(classifyBrowserCompletion("cancel")).toBe("cancelled");
    expect(classifyBrowserCompletion("dismiss")).toBe("cancelled");
    expect(classifyBrowserCompletion("opened")).toBe("returned");
  });

  test("blocks concurrent submissions", async () => {
    const lock = { current: false };
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const first = runOnce(lock, () => pending);
    const second = await runOnce(lock, async () => "duplicate");

    expect(second).toBeUndefined();
    release("completed");
    expect(await first).toBe("completed");
  });
});
