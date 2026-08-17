import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { CurrentExercise, RecentExercise } from "@/types/home";

export function CurrentExerciseCard({ exercise, onPress }: { exercise: CurrentExercise; onPress: () => void }) {
  return (
    <View style={styles.currentCard}>
      <View style={styles.exerciseDetails}>
        <Text style={styles.level}>{exercise.levelName}</Text>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        
      </View>
      <View>
        <Text style={styles.meta}>{exercise.durationMinutes} min</Text>
      </View>
      <Pressable accessibilityLabel={`Continuar ${exercise.exerciseName}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
        <Ionicons color={colors.primary} name="play-forward" size={43} />
      </Pressable>
    </View>
  );
}

export function RecentExerciseCard({ exercise }: { exercise: RecentExercise }) {
  const date = exercise.completedAt.split("-").reverse().join("/");
  return (
    <View style={styles.recentCard}>
      <View>
        <Text style={styles.level}>{exercise.levelName}</Text>
        <Text style={styles.exerciseNameSmall}>{exercise.exerciseName}</Text>
      </View>
      <View style={styles.completedBlock}>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  completedBlock: { alignItems: "center", flexDirection: "row", gap: 6 },
  continueButton: { alignItems: "center", backgroundColor: "transparent", borderRadius: 28, height: 56, justifyContent: "center", width: 56 },
  currentCard: { alignItems: "center", backgroundColor: "#ffffff", borderColor: colors.primary, borderRadius: 10, borderWidth: 1, flexDirection: "row", padding: 12 },
  date: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  exerciseDetails: { flex: 1 },  
  exerciseName: { color: colors.text, fontFamily: fonts.title, fontSize: 20, marginTop: 2 },
  exerciseNameSmall: { color: colors.text, fontFamily: fonts.title, fontSize: 18, marginTop: 1 },
  level: { color: colors.primary, fontFamily: fonts.title, fontSize: 22 },
  meta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, marginTop: 5,},
  pressed: { opacity: 0.7 },
  recentCard: { alignItems: "center", backgroundColor: "#fdfcfb", borderRadius: 10, borderColor: colors.primary, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginBottom: 10, paddingHorizontal: 15, paddingVertical: 12 },
});
