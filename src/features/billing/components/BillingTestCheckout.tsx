import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { useBillingSubscription, useCreateStripeCheckout, useInvalidateBillingSubscription } from "@/features/billing/hooks/useBilling";
import type { CheckoutUiStatus } from "@/features/billing/types";
import { classifyBrowserCompletion, runOnce } from "@/features/billing/utils/billing.utils";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function BillingTestCheckout() {
  const checkoutLockRef = useRef(false);
  const [uiStatus, setUiStatus] = useState<CheckoutUiStatus>("idle");
  const checkout = useCreateStripeCheckout();
  const invalidateBilling = useInvalidateBillingSubscription();
  const subscription = useBillingSubscription(uiStatus === "pending");
  const confirmed = subscription.data ? ACTIVE_STATUSES.has(subscription.data.status) : false;

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener("change", nextState => {
      if (nextState === "active" && (uiStatus === "browser_open" || uiStatus === "pending")) {
        setUiStatus("pending");
        void invalidateBilling();
      }
    });

    return () => appStateSubscription.remove();
  }, [invalidateBilling, uiStatus]);

  async function handleCheckout() {
    await runOnce(checkoutLockRef, async () => {
      setUiStatus("opening");

      try {
        const checkoutUrl = await checkout.mutateAsync(crypto.randomUUID());
        setUiStatus("browser_open");
        const result = await WebBrowser.openBrowserAsync(checkoutUrl);
        const completion = classifyBrowserCompletion(result.type);

        if (completion === "cancelled") {
          setUiStatus("cancelled");
          return;
        }

        setUiStatus("pending");
        await invalidateBilling();
      } catch {
        setUiStatus("error");
      }
    });
  }

  const busy = uiStatus === "opening" || uiStatus === "browser_open";
  const displayStatus: CheckoutUiStatus = confirmed ? "confirmed" : uiStatus;

  return (
    <View style={styles.container}>
      <AppButton accessibilityLabel="Abrir pago de suscripción de prueba" disabled={busy || confirmed} loading={uiStatus === "opening"} onPress={() => void handleCheckout()}>
        {confirmed ? "Prueba confirmada" : "Pagar prueba"}
      </AppButton>
      <Text accessibilityLiveRegion="polite" style={[styles.message, uiStatus === "error" && styles.error]}>
        {getStatusMessage(displayStatus)}
      </Text>
    </View>
  );
}

function getStatusMessage(status: CheckoutUiStatus): string {
  const messages: Record<CheckoutUiStatus, string> = {
    browser_open: "Completa o cancela la prueba en el navegador.",
    cancelled: "Pago de prueba cancelado. No se realizó ningún cambio.",
    confirmed: "Stripe confirmó la suscripción de prueba. No desbloquea contenido.",
    error: "No pudimos abrir el pago de prueba. Inténtalo nuevamente.",
    idle: "Disponible solo para validación técnica en desarrollo.",
    opening: "Preparando Checkout seguro…",
    pending: "Estamos confirmando tu suscripción con Stripe…",
  };

  return messages[status];
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 6, width: "100%" },
  error: { color: colors.error },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, maxWidth: 300, textAlign: "center" },
});
