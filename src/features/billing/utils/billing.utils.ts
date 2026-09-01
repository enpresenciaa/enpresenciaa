export type BrowserCompletion = "cancelled" | "returned";

export function isStripeTestCheckoutVisible(isDevelopment: boolean, flagEnabled: boolean): boolean {
  return isDevelopment && flagEnabled;
}

export function parseCheckoutUrl(payload: unknown): string {
  if (!payload || typeof payload !== "object" || !("url" in payload) || typeof payload.url !== "string") {
    throw new Error("CHECKOUT_RESPONSE_INVALID");
  }

  let url: URL;

  try {
    url = new URL(payload.url);
  } catch {
    throw new Error("CHECKOUT_RESPONSE_INVALID");
  }

  if (url.protocol !== "https:") {
    throw new Error("CHECKOUT_URL_NOT_HTTPS");
  }

  return url.toString();
}

export function classifyBrowserCompletion(type: string): BrowserCompletion {
  return type === "cancel" || type === "dismiss" ? "cancelled" : "returned";
}

export async function runOnce<T>(lock: { current: boolean }, operation: () => Promise<T>): Promise<T | undefined> {
  if (lock.current) {
    return undefined;
  }

  lock.current = true;

  try {
    return await operation();
  } finally {
    lock.current = false;
  }
}
