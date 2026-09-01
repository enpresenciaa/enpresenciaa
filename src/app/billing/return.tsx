import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { useBillingSubscription, useInvalidateBillingSubscription } from "@/features/billing/hooks/useBilling";

const CONFIRMED_STATUSES = new Set(["active", "trialing"]);

export default function BillingReturnRoute() {
  const router = useRouter();
  const { result } = useLocalSearchParams<{ result?: string }>();
  const invalidateBilling = useInvalidateBillingSubscription();
  const cancelled = result === "cancelled";
  const subscription = useBillingSubscription(!cancelled);
  const confirmed = subscription.data ? CONFIRMED_STATUSES.has(subscription.data.status) : false;

  useEffect(() => {
    if (!cancelled) {
      void invalidateBilling();
    }
  }, [cancelled, invalidateBilling]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        {!confirmed && !cancelled ? <ActivityIndicator color={colors.primary} size="large" /> : null}
        <Text accessibilityRole="header" style={styles.title}>
          {cancelled ? "Pago de prueba cancelado" : confirmed ? "Suscripción de prueba confirmada" : "Estamos confirmando tu suscripción"}
        </Text>
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {cancelled ?
            "No se realizó ningún cambio en tu acceso." : confirmed ?
              "Stripe confirmó el estado mediante webhook. Esta prueba no desbloquea contenido." :
              "El regreso a la app no confirma el pago. Esperaremos el estado seguro enviado por Stripe."}
        </Text>
        {subscription.isError ? <Text accessibilityRole="alert" style={styles.error}>No pudimos consultar el estado. Puedes volver a Camino e intentarlo más tarde.</Text> : null}
        <AppButton accessibilityLabel="Volver al Camino" onPress={() => router.replace("/(tabs)/camino")}>Volver a Camino</AppButton>
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
