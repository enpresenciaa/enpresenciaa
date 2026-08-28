import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/onboarding/BackButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseList } from "@/features/journey/components/ExerciseList";
import { LevelHeader } from "@/features/journey/components/LevelHeader";
import { LevelProgress } from "@/features/journey/components/LevelProgress";
import { getExercisesByLevelId, getLevelById } from "@/features/journey/mocks/journey.mock";

export function LevelScreen({ levelId }: { levelId: string }) {
  const level = getLevelById(levelId);

  if (!level) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <BackButton />
        <View style={styles.notFound}>
          <Text accessibilityRole="header" style={styles.notFoundTitle}>Nivel no encontrado</Text>
          <Text style={styles.information}>Regresa al Camino y selecciona un nivel válido.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const exercises = getExercisesByLevelId(levelId);
  const completed = exercises.filter(exercise => exercise.status === "completed").length;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LevelHeader description={level.description} status={level.status} title={`Nivel ${level.number}: ${level.name}`} />
        <LevelProgress completed={completed} total={exercises.length} />
        <ExerciseList exercises={exercises} />
        <Text style={styles.information}>El contenido de los ejercicios se conectará cuando exista el catálogo del backend.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 560, paddingBottom: 32, paddingHorizontal: 22, paddingTop: 66, width: "100%" },
  information: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, marginTop: 14, textAlign: "center" },
  notFound: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  notFoundTitle: { color: colors.text, fontFamily: fonts.title, fontSize: 30 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
