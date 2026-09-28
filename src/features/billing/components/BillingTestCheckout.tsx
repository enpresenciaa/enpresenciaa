import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { createUuid } from "@/lib/uuid";
import { useBillingSubscription, useCreateStripeCheckout, useInvalidateBillingSubscription } from "@/features/billing/hooks/useBilling";
import type { CheckoutUiStatus } from "@/features/billing/types";
import { classifyBrowserCompletion, isBillingSubscriptionActive, parseCheckoutReturnResult, runOnce } from "@/features/billing/utils/billing.utils";

export function BillingTestCheckout() {
  const router = useRouter();
  const checkoutLockRef = useRef(false);
  const [uiStatus, setUiStatus] = useState<CheckoutUiStatus>("idle");
  const checkout = useCreateStripeCheckout();
  const invalidateBilling = useInvalidateBillingSubscription();
  const subscription = useBillingSubscription(uiStatus === "pending");
  const confirmed = isBillingSubscriptionActive(subscription.data?.status);

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
        const checkoutUrl = await checkout.mutateAsync(createUuid());
        setUiStatus("browser_open");
        const redirectUrl = Linking.createURL("billing/return");
        const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);
        const completion = classifyBrowserCompletion(result.type);

        if (completion === "cancelled") {
          setUiStatus("cancelled");
          return;
        }

        if (result.type === "success") {
          const returnResult = parseCheckoutReturnResult(result.url);

          if (returnResult) {
            router.push({ pathname: "/billing/return", params: { result: returnResult } } as Href);
            return;
          }
        }

        setUiStatus("pending");
        await invalidateBilling();
      } catch {
        setUiStatus("error");
      }
    });
  }

  const busy = uiStatus === "opening" || uiStatus === "browser_open" || uiStatus === "pending";
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
