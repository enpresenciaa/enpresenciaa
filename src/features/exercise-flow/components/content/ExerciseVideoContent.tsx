import type { VideoSource } from "expo-video";
import { useVideoPlayer } from "expo-video";
import { StyleSheet, View } from "react-native";

import { CustomVideoPlayer } from "@/components/video/CustomVideoPlayer";
import { colors } from "@/config/onboarding-theme";
import { ExerciseContentHeading } from "@/features/exercise-flow/components/content/ExerciseContentHeading";

type Props = {
  onComplete: () => void;
  source: VideoSource;
  title: string;
};

export function ExerciseVideoContent({ onComplete, source, title }: Props) {
  const player = useVideoPlayer(source, videoPlayer => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.timeUpdateEventInterval = 0.25;
  });

  return (
    <>
      <ExerciseContentHeading label="Video" />
      <View style={styles.playerCard}>
        <CustomVideoPlayer accessibilityLabel={title} height={220} onComplete={onComplete} player={player} showProgress title={title} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Same card as the onboarding intro video.
  playerCard: { backgroundColor: "#FFFFFF", borderColor: colors.primary, borderRadius: 18, borderWidth: 2, overflow: "hidden", width: "100%" },
});
