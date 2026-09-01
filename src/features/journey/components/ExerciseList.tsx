import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { LevelExercise } from "@/features/journey/types";
import { ExerciseItem } from "./ExerciseItem";

export function ExerciseList({ exercises }: { exercises: LevelExercise[] }) {
  return (
    <View>
      <Text accessibilityRole="header" style={styles.heading}>Ejercicios</Text>
      {exercises.map(exercise => <ExerciseItem exercise={exercise} key={exercise.id} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontFamily: fonts.title, fontSize: 25, marginBottom: 12 },
});
