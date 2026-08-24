import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

import { AppButton } from "@/components/onboarding/AppButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";

const background = require("../../../assets/images/Imág. VIDEO INTRO.jpg");

export default function VideoRoute() {
  const router = useRouter();
  const player = useVideoPlayer(require("@/assets/videos/video_introduccion.mp4"), videoPlayer => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
  });

  return (
    <OnboardingBackground source={background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.centerGroup}>
            <Text accessibilityRole="header" style={styles.title}>Video de{"\n"}introducción</Text>
            <View style={styles.videoFrame}>
              <VideoView
                accessibilityLabel="Video genérico de introducción"
                contentFit="cover"
                nativeControls
                player={player}
                style={styles.video}
              />
            </View>
          </View>
          <AppButton onPress={() => router.push("/onboarding/bienvenida")}>Comenzar</AppButton>
        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

// TODO(video): sustituir el video genérico por el contenido oficial.
const styles = StyleSheet.create({
  centerGroup: { alignItems: "center", flex: 1, justifyContent: "center", width: "100%" },
  content: { alignItems: "center", flex: 1, marginHorizontal: "auto", maxWidth: 580, padding: 24, paddingBottom: 80, paddingHorizontal: 12, width: "100%" },
  safeArea: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 35, lineHeight: 50, marginBottom: 24, textAlign: "center" },
  video: { height: "100%", width: "100%" },
  videoFrame: { alignSelf: "center", backgroundColor: colors.text, borderColor: colors.primary, borderRadius: 18, borderWidth: 2, height: 270, marginTop: -12, maxWidth: 530, overflow: "hidden", width: "100%" },
});
