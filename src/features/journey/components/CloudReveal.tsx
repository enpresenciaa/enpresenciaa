import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/config/onboarding-theme";
import { CLOUD_REVEAL_DURATION } from "@/features/journey/constants/map-layout.constants";

interface CloudRevealProps {
  onRevealComplete: () => void;
  reduceMotion: boolean;
  reveal: boolean;
}

export function CloudReveal({ onRevealComplete, reduceMotion, reveal }: CloudRevealProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!reveal) {
      return;
    }

    if (reduceMotion) {
      progress.set(1);
      onRevealComplete();
      return;
    }

    progress.set(withTiming(
      1,
      { duration: CLOUD_REVEAL_DURATION, easing: Easing.out(Easing.cubic) },
      finished => {
        if (finished) {
          runOnJS(onRevealComplete)();
        }
      },
    ));
  }, [onRevealComplete, progress, reduceMotion, reveal]);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: -progress.value * 150 },
      { translateY: progress.value * 18 },
      { scale: 1 + progress.value * 0.06 },
    ],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * 150 },
      { translateY: progress.value * 12 },
      { scale: 1 + progress.value * 0.06 },
    ],
  }));
  const topStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -progress.value * 90 }, { scale: 1 + progress.value * 0.04 }],
  }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  return (
    <Animated.View accessibilityLabel="Preparando el mapa del camino" pointerEvents="auto" style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.cloud, styles.leftCloud, leftStyle]} />
      <Animated.View style={[styles.cloud, styles.rightCloud, rightStyle]} />
      <Animated.View style={[styles.cloud, styles.topCloud, topStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cloud: { backgroundColor: "#F7F1E3", position: "absolute" },
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, overflow: "hidden", zIndex: 5 },
  leftCloud: { borderBottomRightRadius: 180, borderTopRightRadius: 180, bottom: -30, left: -90, top: 68, width: "78%" },
  rightCloud: { borderBottomLeftRadius: 180, borderTopLeftRadius: 180, bottom: 38, right: -110, top: -20, width: "78%" },
  topCloud: { borderBottomLeftRadius: 180, borderBottomRightRadius: 180, height: "42%", left: -30, right: -30, top: -120 },
});
