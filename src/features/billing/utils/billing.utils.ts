export type BrowserCompletion = "cancelled" | "returned";
export type CheckoutReturnResult = "cancelled" | "success";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  canceled: "Cancelada",
  incomplete: "Pago pendiente",
  incomplete_expired: "Pago vencido",
  past_due: "Pago atrasado",
  paused: "Pausada",
  trialing: "Periodo de prueba",
  unpaid: "Pago pendiente",
};

export function isStripeTestCheckoutVisible(isDevelopment: boolean, flagEnabled: boolean): boolean {
  return isDevelopment && flagEnabled;
}

export function isBillingSubscriptionActive(status: string | null | undefined): boolean {
  return typeof status === "string" && ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

export function getBillingSubscriptionStatusLabel(status: string): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? "Estado desconocido";
}

export function formatBillingPeriodEnd(value: string | null): string {
  if (!value) {
    return "Sin fecha de renovación disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin fecha de renovación disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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

export function parseCheckoutReturnResult(value: string): CheckoutReturnResult | null {
  try {
    const url = new URL(value);
    const result = url.searchParams.get("result");
    const isBillingReturn = url.protocol === "enpresenciaa:" && url.hostname === "billing" && url.pathname === "/return";

    return isBillingReturn && (result === "cancelled" || result === "success") ? result : null;
  } catch {
    return null;
  }
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
