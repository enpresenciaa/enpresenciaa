import type { VideoSource } from "expo-video";
import { useVideoPlayer } from "expo-video";
import { StyleSheet, Text, View } from "react-native";

import { CustomAudioPlayer } from "@/components/video/CustomAudioPlayer";
import { CustomVideoPlayer } from "@/components/video/CustomVideoPlayer";
import { colors, fonts } from "@/config/onboarding-theme";
import type { ExerciseFlowContent } from "@/features/exercise-flow/exercise-flow.types";

function ExerciseVideo({ onComplete, source, title }: { onComplete: () => void; source: VideoSource; title: string }) {
  const player = useVideoPlayer(source, videoPlayer => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.timeUpdateEventInterval = 0.25;
  });

  return (
    <View style={styles.playerCard}>
      <CustomVideoPlayer accessibilityLabel={title} height={220} onComplete={onComplete} player={player} title="" />
    </View>
  );
}

export function ExerciseContentRenderer({ content, onComplete }: { content: ExerciseFlowContent; onComplete: () => void }) {
  if (content.modality === "video") {
    return <ExerciseVideo onComplete={onComplete} source={content.source} title={content.title} />;
  }

  if (content.modality === "audio") {
    return <CustomAudioPlayer onComplete={onComplete} source={content.source} title="" />;
  }

  return (
    <View style={styles.textSurface}>
      <Text style={styles.publishedText}>{content.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  playerCard: { backgroundColor: "#FFFFFF", borderRadius: 18, elevation: 4, overflow: "hidden", shadowColor: "#000000", shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.16, shadowRadius: 8, width: "100%" },
  publishedText: { color: colors.text, fontFamily: fonts.body, fontSize: 16, lineHeight: 27 },
  textSurface: { backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 18, padding: 22 },
});
