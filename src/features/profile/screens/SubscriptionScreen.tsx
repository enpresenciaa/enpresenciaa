import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/onboarding/BackButton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { env } from "@/config/env";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BillingTestCheckout } from "@/features/billing/components/BillingTestCheckout";
import { useBillingSubscription } from "@/features/billing/hooks/useBilling";
import { formatBillingPeriodEnd, getBillingSubscriptionStatusLabel, isStripeTestCheckoutVisible } from "@/features/billing/utils/billing.utils";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { getProfileDisplayData } from "@/features/profile/utils/profile-display";

type SubscriptionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function SubscriptionRow({ icon, label }: SubscriptionRowProps) {
  return (
    <View style={styles.row}>
      <Ionicons color={colors.primary} name={icon} size={29} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );
}

export function SubscriptionScreen() {
  const { status: authStatus, user } = useAuth();
  const { data: profile } = useProfile();
  const subscription = useBillingSubscription();
  const profileDisplay = getProfileDisplayData(user, profile);
  const billing = subscription.data;
  const showStripeTestCheckout = authStatus === "permanent" && isStripeTestCheckoutVisible(__DEV__, env.enableStripeTestCheckout);
  const plan = billing ? "Plan En Presenciaa" : "Sin suscripción";
  const status = billing ? `Estado: ${getBillingSubscriptionStatusLabel(billing.status)}` : "No hay una suscripción registrada";
  const periodEnd = billing
    ? `${billing.cancel_at_period_end ? "Termina" : "Próxima renovación"}: ${formatBillingPeriodEnd(billing.current_period_end)}`
    : "Activa el pago de prueba para validar la integración";

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <BackButton fallbackHref="/(tabs)/yo" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileHeader avatarUrl={profileDisplay.avatarUrl} createdAt={profileDisplay.createdAt} displayName={profileDisplay.displayName} />

          <View style={styles.planTitle}>
            <Ionicons color={colors.text} name="diamond-outline" size={29} />
            <Text style={styles.planText}>{plan}</Text>
          </View>
          <SubscriptionRow icon="pulse-outline" label={status} />
          <SubscriptionRow icon="calendar-outline" label={periodEnd} />
          {subscription.isError ? <Text accessibilityRole="alert" style={styles.error}>No pudimos consultar tu suscripción.</Text> : null}
          {showStripeTestCheckout ? <View style={styles.checkout}><BillingTestCheckout /></View> : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert("Recomienda a tus amigos", "La función para compartir estará disponible próximamente.")}
            style={({ pressed }) => [styles.referral, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primary} name="people" size={30} />
            <Text style={styles.referralText}>¡Recomienda a amigos!</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 560, paddingBottom: 40, paddingHorizontal: 24, paddingTop: 20, width: "100%" },
  checkout: { marginTop: 18 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 4, textAlign: "center" },
  planText: { color: colors.text, fontFamily: fonts.body, fontSize: 18, marginLeft: 12 },
  planTitle: { alignItems: "center", flexDirection: "row", marginBottom: 15, paddingHorizontal: 5 },
  pressed: { opacity: 0.65 },
  referral: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E6E8E3", borderRadius: 6, borderWidth: 1, flexDirection: "row", marginTop: 28, minHeight: 58, paddingHorizontal: 12 },
  referralText: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 18, marginLeft: 12 },
  row: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E6E8E3", borderRadius: 6, borderWidth: 1, flexDirection: "row", marginBottom: 10, minHeight: 56, paddingHorizontal: 12 },
  rowText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 17, marginLeft: 12 },
  safeArea: { flex: 1 },
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
});
