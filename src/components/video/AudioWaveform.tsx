import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const BAR_COUNT = 36;
// Deterministic resting profile so the idle shape still reads as a waveform.
const BARS = Array.from({ length: BAR_COUNT }, (_, index) => ({
  id: `bar-${index}`,
  rest: 0.22 + 0.22 * Math.abs(Math.sin(index * 1.7)) + 0.14 * Math.abs(Math.sin(index * 0.45)),
}));

type Props = {
  /** Animates while true; rests on the idle profile otherwise. */
  active: boolean;
  color?: string;
  height?: number;
};

/**
 * Decorative waveform tied to playback state. It does not read real audio amplitude:
 * expo-video exposes no sample data.
 */
export function AudioWaveform({ active, color = "#000000", height = 40 }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.container, { height }]}>
      {BARS.map((bar, index) => (
        <WaveBar active={active && !reduceMotion} color={color} height={height} index={index} key={bar.id} rest={bar.rest} />
      ))}
    </View>
  );
}

function WaveBar({ active, color, height, index, rest }: { active: boolean; color: string; height: number; index: number; rest: number }) {
  const level = useSharedValue(rest);

  useEffect(() => {
    cancelAnimation(level);
    if (!active) {
      level.value = withTiming(rest, { duration: 250 });
      return;
    }

    const peak = Math.min(1, rest + 0.3 + 0.3 * Math.abs(Math.sin(index * 2.3)));
    const duration = 240 + ((index * 53) % 260);
    const easing = Easing.inOut(Easing.quad);
    level.value = withDelay(
      (index * 37) % 220,
      withRepeat(withSequence(withTiming(peak, { duration, easing }), withTiming(rest * 0.6, { duration, easing })), -1, true),
    );

    return () => cancelAnimation(level);
  }, [active, index, level, rest]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: level.value }] }));

  return <Animated.View style={[styles.bar, { backgroundColor: color, height }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  bar: { borderRadius: 2, flex: 1, maxWidth: 4 },
  container: { alignItems: "center", flexDirection: "row", gap: 3, justifyContent: "center", width: "100%" },
});
