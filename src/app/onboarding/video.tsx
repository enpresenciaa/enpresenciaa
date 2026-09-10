import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useVideoPlayer } from "expo-video";

import { AppButton } from "@/components/onboarding/AppButton";
import { BackButton } from "@/components/onboarding/BackButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";
import { CustomVideoPlayer } from "@/components/video/CustomVideoPlayer";

const background = require("../../../assets/images/Imág. VIDEO INTRO.jpg");

export default function VideoRoute() {
  const router = useRouter();
  const player = useVideoPlayer(require("@/assets/videos/video_introduccion.mp4"), videoPlayer => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.timeUpdateEventInterval = 0.25;
  });

  return (
    <OnboardingBackground source={background}>
      <SafeAreaView style={styles.safeArea}>
        <BackButton />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.centerGroup}>
            <Text accessibilityRole="header" style={styles.title}>Video de{"\n"}introducción</Text>
            <View style={styles.playerCard}>
              <CustomVideoPlayer accessibilityLabel="Video genérico de introducción" height={270} player={player} />
            </View>
          </View>
          <AppButton onPress={() => router.push("/onboarding/ejercicio-inicial")}>Listo</AppButton>
        </ScrollView>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

// TODO(video): sustituir el video genérico por el contenido oficial.
const styles = StyleSheet.create({
  centerGroup: { alignItems: "center", flexGrow: 1, justifyContent: "center", paddingBottom: 24, width: "100%" },
  content: { alignItems: "center", flexGrow: 1, marginHorizontal: "auto", maxWidth: 580, paddingBottom: 32, paddingHorizontal: 12, paddingTop: 64, width: "100%" },
  safeArea: { flex: 1 },
  playerCard: { alignSelf: "center", backgroundColor: "#FFFFFF", borderColor: colors.primary, borderRadius: 18, borderWidth: 2, marginTop: -12, maxWidth: 530, overflow: "hidden", width: "100%" },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 35, lineHeight: 50, marginBottom: 24, textAlign: "center" },
});
