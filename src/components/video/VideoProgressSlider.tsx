import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { formatVideoTime, getProgressSeekTarget, getVideoProgressRatio } from "@/components/video/video-controls";

const THUMB_SIZE = 14;
export const VIDEO_PROGRESS_SLIDER_HEIGHT = 32;

type Props = {
  accessibilityLabel: string;
  currentTime: number;
  disabled: boolean;
  duration: number;
  onSeek: (seconds: number) => void;
};

export function VideoProgressSlider({ accessibilityLabel, currentTime, disabled, duration, onSeek }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragTime, setDragTime] = useState<number | null>(null);
  // Drag origin in local and page coordinates; locationX alone is unreliable once the finger leaves the view.
  const dragOriginRef = useRef({ locationX: 0, pageX: 0 });
  const targetRef = useRef<number | null>(null);

  const displayedTime = dragTime ?? currentTime;
  const ratio = getVideoProgressRatio(displayedTime, duration);
  const isDisabled = disabled || duration <= 0;
  const canDrag = () => !isDisabled && trackWidth > 0;

  function updateDrag(pageX: number) {
    const x = dragOriginRef.current.locationX + pageX - dragOriginRef.current.pageX;
    targetRef.current = getProgressSeekTarget(x - THUMB_SIZE / 2, trackWidth, duration);
    setDragTime(targetRef.current);
  }

  function endDrag(shouldSeek: boolean) {
    if (shouldSeek && targetRef.current !== null) {
      onSeek(targetRef.current);
    }
    targetRef.current = null;
    setDragTime(null);
  }

  return (
    <View
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityValue={{ text: `${formatVideoTime(displayedTime)} de ${formatVideoTime(duration)}` }}
      accessible
      onAccessibilityAction={event => {
        if (isDisabled) {
          return;
        }
        onSeek(currentTime + (event.nativeEvent.actionName === "increment" ? 10 : -10));
      }}
      onMoveShouldSetResponder={canDrag}
      onResponderGrant={event => {
        dragOriginRef.current = { locationX: event.nativeEvent.locationX, pageX: event.nativeEvent.pageX };
        updateDrag(event.nativeEvent.pageX);
      }}
      onResponderMove={event => updateDrag(event.nativeEvent.pageX)}
      onResponderRelease={() => endDrag(true)}
      onResponderTerminate={() => endDrag(false)}
      onResponderTerminationRequest={() => false}
      onStartShouldSetResponder={canDrag}
      style={[styles.container, isDisabled && styles.disabled]}
    >
      <View onLayout={event => setTrackWidth(event.nativeEvent.layout.width)} pointerEvents="none" style={styles.track}>
        <View style={[styles.played, { width: ratio * trackWidth }]} />
        <View style={[styles.thumb, { left: ratio * trackWidth - THUMB_SIZE / 2 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: VIDEO_PROGRESS_SLIDER_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: THUMB_SIZE / 2,
  },
  disabled: { opacity: 0.45 },
  played: { backgroundColor: "#000000", height: "100%" },
  thumb: {
    backgroundColor: "#000000",
    borderRadius: THUMB_SIZE / 2,
    height: THUMB_SIZE,
    position: "absolute",
    top: -(THUMB_SIZE - 3) / 2,
    width: THUMB_SIZE,
  },
  track: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    height: 3,
  },
});
