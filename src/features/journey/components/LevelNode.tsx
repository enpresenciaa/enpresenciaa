import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { colors, fonts } from "@/config/onboarding-theme";
import { LEVEL_NODE_SIZE } from "@/features/journey/constants/map-layout.constants";
import type { MapLevel } from "@/features/journey/types";

interface LevelNodeProps {
  isCurrent: boolean;
  level: MapLevel;
  onPress: () => void;
  x: number;
  y: number;
}

export function LevelNode({ isCurrent, level, onPress, x, y }: LevelNodeProps) {
  const disabled = level.status === "locked" || level.status === "premium";
  const statusIcon = level.status === "completed" ? "checkmark" : level.status === "locked" ? "lock-closed" : level.status === "premium" ? "star" : null;
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!isCurrent || reduceMotion) {
      pulse.set(1);
      return;
    }
    pulse.set(withRepeat(withTiming(1.045, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [isCurrent, pulse, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View style={[styles.position, { left: x - LEVEL_NODE_SIZE / 2, top: y - LEVEL_NODE_SIZE / 2 }, animatedStyle]}>
      {isCurrent ? <Text style={styles.currentLabel}>Actual</Text> : null}
      <Pressable
        accessibilityHint={disabled ? "Este nivel aún no está disponible" : "Abre los ejercicios de este nivel"}
        accessibilityLabel={`Nivel ${level.number}, ${level.name}, ${getStatusLabel(level.status)}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={6}
        onPress={onPress}
        style={({ pressed }) => [
          styles.node,
          styles[level.status],
          isCurrent && styles.current,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={[styles.number, level.status === "available" && styles.lightNumber, level.status === "completed" && styles.lightNumber]}>{level.number}</Text>
        {statusIcon ? <View style={styles.statusBadge}><Ionicons color={level.status === "premium" ? "#7A5815" : colors.primary} name={statusIcon} size={9} /></View> : null}
      </Pressable>
    </Animated.View>
  );
}

function getStatusLabel(status: MapLevel["status"]): string {
  const labels: Record<MapLevel["status"], string> = {
    available: "disponible",
    completed: "completado",
    in_progress: "en progreso",
    locked: "bloqueado",
    premium: "premium",
  };
  return labels[status];
}

const styles = StyleSheet.create({
  available: { backgroundColor: colors.primary, borderColor: "#E7EEDC" },
  completed: { backgroundColor: colors.primary, borderColor: "#E7EEDC" },
  current: { borderColor: colors.primary, borderWidth: 2.5, shadowColor: colors.primary, shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.38, shadowRadius: 6 },
  currentLabel: { backgroundColor: colors.background, borderRadius: 8, color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 8, left: 0, lineHeight: 11, overflow: "hidden", paddingVertical: 2, position: "absolute", textAlign: "center", top: -24, width: LEVEL_NODE_SIZE, zIndex: 2 },
  in_progress: { backgroundColor: "#FDF8EC", borderColor: colors.primary },
  lightNumber: { color: colors.buttonText },
  locked: { backgroundColor: "rgba(243,239,227,0.9)", borderColor: "rgba(54,75,38,0.48)", opacity: 0.76 },
  node: { alignItems: "center", borderRadius: LEVEL_NODE_SIZE / 2, borderWidth: 2, elevation: 4, height: LEVEL_NODE_SIZE, justifyContent: "center", shadowColor: "#000000", shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.18, shadowRadius: 3, width: LEVEL_NODE_SIZE },
  number: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  position: { height: LEVEL_NODE_SIZE, position: "absolute", width: LEVEL_NODE_SIZE },
  premium: { backgroundColor: "#E9D29A", borderColor: "#7A5815", opacity: 0.88 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  statusBadge: { alignItems: "center", backgroundColor: colors.background, borderColor: "rgba(54,75,38,0.2)", borderRadius: 7, borderWidth: 1, bottom: -6, height: 14, justifyContent: "center", left: (LEVEL_NODE_SIZE - 14) / 2, position: "absolute", width: 14 },
});
