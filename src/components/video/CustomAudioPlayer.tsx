import type { VideoSource } from "expo-video";
import { useVideoPlayer } from "expo-video";
import { StyleSheet, View } from "react-native";

import { AudioWaveform } from "@/components/video/AudioWaveform";
import { CustomVideoControls, useVideoControls } from "@/components/video/CustomVideoControls";

type Props = {
  onComplete: () => void;
  source: VideoSource;
};

export function CustomAudioPlayer({ onComplete, source }: Props) {
  const player = useVideoPlayer(source, mediaPlayer => {
    mediaPlayer.loop = false;
    mediaPlayer.muted = false;
    mediaPlayer.timeUpdateEventInterval = 0.25;
  });
  const controls = useVideoControls(player, onComplete);

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        <AudioWaveform active={controls.showPause} />
      </View>
      <CustomVideoControls controls={controls} mediaLabel="audio" showProgress title="" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#FFFFFF", borderRadius: 18, elevation: 4, overflow: "hidden", shadowColor: "#000000", shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.16, shadowRadius: 8, width: "100%" },
  waveform: { paddingHorizontal: 22, paddingTop: 18 },
});
