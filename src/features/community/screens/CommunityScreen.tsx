import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeHeader, MotivationRow } from "@/components/home/HomeHeader";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import { ConsultationCard } from "@/features/community/components/ConsultationCard";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { getProfileDisplayData } from "@/features/profile/utils/profile-display";
import { communityPostsMock, consultationInfoMock } from "@/mocks/community";

export function CommunityScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const { data: profile } = useProfile();
  const displayName = status === "anonymous" ? "Invitado" : getProfileDisplayData(user, profile).displayName;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <HomeHeader name={displayName} />
          <MotivationRow motivation="Un espacio para encontrarnos y compartir." onNotificationsPress={() => router.push("/(tabs)/notificaciones")} />
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.title}>Noticias</Text>
          <View style={styles.cards}>{communityPostsMock.map(post => <CommunityPostCard key={post.id} post={post} />)}</View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.title}>Consultas</Text>
          <View style={styles.cards}>{consultationInfoMock.map(consultation => <ConsultationCard key={consultation.id} consultation={consultation} />)}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 20, marginTop: 20 },
  content: { alignSelf: "center", maxWidth: 600, paddingBottom: 32, paddingHorizontal: 22, paddingTop: 20, width: "100%" },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 23, marginTop: 6 },
  eyebrow: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1 },
  preview: { alignSelf: "flex-start", backgroundColor: "#E9EBDD", borderRadius: 12, color: colors.primary, fontFamily: fonts.body, fontSize: 11, marginTop: 12, paddingHorizontal: 12, paddingVertical: 5 },
  screen: { backgroundColor: colors.background, flex: 1 },
  section: { marginTop: 34 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 34, marginTop: 6 },
});
