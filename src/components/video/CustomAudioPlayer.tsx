import { Ionicons } from "@expo/vector-icons";
import type { VideoSource } from "expo-video";
import { useVideoPlayer } from "expo-video";
import { StyleSheet, View } from "react-native";

import { CustomVideoControls, useVideoControls } from "@/components/video/CustomVideoControls";

type Props = {
  onComplete: () => void;
  source: VideoSource;
  title: string;
};

export function CustomAudioPlayer({ onComplete, source, title }: Props) {
  const player = useVideoPlayer(source, mediaPlayer => {
    mediaPlayer.loop = false;
    mediaPlayer.muted = false;
    mediaPlayer.timeUpdateEventInterval = 0.25;
  });
  const controls = useVideoControls(player, onComplete);

  return (
    <View style={styles.container}>
      <View style={styles.artwork}>
        <Ionicons color="#000000" name="headset-outline" size={54} />
      </View>
      <CustomVideoControls controls={controls} mediaLabel="audio" title={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: { alignItems: "center", backgroundColor: "#EEE8DC", height: 150, justifyContent: "center" },
  container: { backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", width: "100%" },
});
