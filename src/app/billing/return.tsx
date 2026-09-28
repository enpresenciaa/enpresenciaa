import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { useBillingSubscription, useInvalidateBillingSubscription } from "@/features/billing/hooks/useBilling";
import { isBillingSubscriptionActive } from "@/features/billing/utils/billing.utils";

const CONFIRMATION_TIMEOUT_MS = 60_000;

export default function BillingReturnRoute() {
  const router = useRouter();
  const { result } = useLocalSearchParams<{ result?: string }>();
  const invalidateBilling = useInvalidateBillingSubscription();
  const cancelled = result === "cancelled";
  const [timedOut, setTimedOut] = useState(false);
  const subscription = useBillingSubscription(!cancelled && !timedOut);
  const confirmed = isBillingSubscriptionActive(subscription.data?.status);

  useEffect(() => {
    if (!cancelled) {
      void invalidateBilling();
    }
  }, [cancelled, invalidateBilling]);

  useEffect(() => {
    if (cancelled || confirmed) {
      return;
    }

    const timeout = setTimeout(() => setTimedOut(true), CONFIRMATION_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [cancelled, confirmed]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        {!confirmed && !cancelled && !timedOut ? <ActivityIndicator color={colors.primary} size="large" /> : null}
        <Text accessibilityRole="header" style={styles.title}>
          {cancelled ? "Pago de prueba cancelado" : confirmed ? "Suscripción de prueba confirmada" : timedOut ? "La confirmación está tardando" : "Estamos confirmando tu suscripción"}
        </Text>
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {cancelled ?
            "No se realizó ningún cambio en tu acceso." : confirmed ?
              "Stripe confirmó el estado mediante webhook." : timedOut ?
                "Puedes revisar el estado desde Tu suscripción. Si el pago fue aprobado, aparecerá cuando llegue la confirmación de Stripe." :
                "El regreso a la app no confirma el pago. Esperaremos el estado seguro enviado por Stripe."}
        </Text>
        {subscription.isError ? <Text accessibilityRole="alert" style={styles.error}>No pudimos consultar el estado en este momento.</Text> : null}
        <AppButton accessibilityLabel="Ver mi suscripción" onPress={() => router.replace("/(tabs)/yo/suscripcion" as Href)}>Ver mi suscripción</AppButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", gap: 18, maxWidth: 520, paddingHorizontal: 24, width: "100%" },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 14, textAlign: "center" },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, textAlign: "center" },
  screen: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 28, textAlign: "center" },
});
