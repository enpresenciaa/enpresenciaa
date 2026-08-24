import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/onboarding/BackButton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const profileDisplay = getProfileDisplayData(user, profile);
  const metadata = user?.user_metadata ?? {};
  const plan = typeof metadata.subscription_type === "string" ? metadata.subscription_type : "Plan sin configurar";
  const card = typeof metadata.card_last4 === "string" ? `Tarjeta terminada en ${metadata.card_last4}` : "No hay tarjeta registrada";
  const expiration = typeof metadata.subscription_expires_at === "string" ? metadata.subscription_expires_at : "Sin vencimiento disponible";

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
          <SubscriptionRow icon="card-outline" label={card} />
          <SubscriptionRow icon="calendar-outline" label={expiration} />

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
