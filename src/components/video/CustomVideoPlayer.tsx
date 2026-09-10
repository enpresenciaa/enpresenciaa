import type { VideoPlayer } from "expo-video";
import { VideoView } from "expo-video";
import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { CustomVideoControls, useVideoControls } from "@/components/video/CustomVideoControls";

type Props = {
  accessibilityLabel: string;
  height: number;
  onComplete?: () => void;
  player: VideoPlayer;
  title?: string;
};

export function CustomVideoPlayer({ accessibilityLabel, height, onComplete, player, title = "Título del video" }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // This controller stays mounted while the same player moves between views.
  const controls = useVideoControls(player, onComplete);

  function renderPlayer(fullscreen: boolean) {
    return (
      <>
        <View style={fullscreen ? styles.fullscreenVideo : { height }}>
          <VideoView
            accessibilityLabel={accessibilityLabel}
            contentFit={fullscreen ? "contain" : "cover"}
            fullscreenOptions={{ enable: false }}
            nativeControls={false}
            player={player}
            style={styles.video}
          />
        </View>
        <CustomVideoControls
          controls={controls}
          isFullscreen={fullscreen}
          onToggleFullscreen={() => setIsFullscreen(value => !value)}
          title={title}
        />
      </>
    );
  }

  return (
    <>
      {isFullscreen ? <View style={{ height: height + 88 }} /> : renderPlayer(false)}
      <Modal
        animationType="fade"
        hardwareAccelerated
        navigationBarTranslucent
        onRequestClose={() => setIsFullscreen(false)}
        presentationStyle="fullScreen"
        statusBarTranslucent
        supportedOrientations={["portrait", "landscape"]}
        visible={isFullscreen}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.fullscreen}>
            {isFullscreen ? renderPlayer(true) : null}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fullscreen: { backgroundColor: "#000000", flex: 1 },
  fullscreenVideo: { flex: 1 },
  video: { height: "100%", width: "100%" },
});
