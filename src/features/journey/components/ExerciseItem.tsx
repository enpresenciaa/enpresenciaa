import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { LevelExercise } from "@/features/journey/types";

interface ExerciseItemProps {
  exercise: LevelExercise;
  onPress?: () => void;
}

export function ExerciseItem({ exercise, onPress }: ExerciseItemProps) {
  const disabled = exercise.status === "locked" || !onPress;
  const icon = exercise.status === "completed" ? "checkmark-circle" : exercise.status === "available" ? "play-circle" : "lock-closed";

  return (
    <Pressable
      accessibilityLabel={`${exercise.title}, ${getStatusLabel(exercise.status)}`}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.item, exercise.status === "locked" && styles.locked, pressed && styles.pressed]}
    >
      <View style={styles.icon}><Ionicons color={colors.primary} name={icon} size={24} /></View>
      <Text style={styles.title}>{exercise.title}</Text>
      <Text style={styles.status}>{getStatusLabel(exercise.status)}</Text>
    </Pressable>
  );
}

function getStatusLabel(status: LevelExercise["status"]): string {
  const labels: Record<LevelExercise["status"], string> = {
    available: "Disponible",
    completed: "Completado",
    locked: "Bloqueado",
  };
  return labels[status];
}

const styles = StyleSheet.create({
  icon: { alignItems: "center", backgroundColor: "#DCE7D5", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  item: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "rgba(54,75,38,0.28)", borderRadius: 17, borderWidth: 1, flexDirection: "row", marginBottom: 11, minHeight: 70, paddingHorizontal: 14 },
  locked: { opacity: 0.6 },
  pressed: { opacity: 0.72 },
  status: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10 },
  title: { color: colors.text, flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 14, marginHorizontal: 12 },
});
