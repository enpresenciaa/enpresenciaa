import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { OpenExerciseButton } from "@/features/journal/components/OpenExerciseButton";
import { FavoriteStar } from "@/features/journey/components/FavoriteStar";
import { JOURNEY_STATUS_LABELS } from "@/features/journey/components/JourneySegment";
import type { JourneyExerciseState } from "@/features/journey/domain/journey.types";

type Props = {
  exercise: JourneyExerciseState;
  isFavorite: boolean;
  onOpenExercise: (exerciseId: string) => void;
  onToggleFavorite: () => void;
  toggleDisabled: boolean;
};

export function JournalFavoriteCard({ exercise, isFavorite, onOpenExercise, onToggleFavorite, toggleDisabled }: Props) {
  // Mirrors the Camino: only available or completed exercises can be opened.
  const canOpen = exercise.status === "available" || exercise.status === "completed";

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text numberOfLines={1} style={styles.level}>{`Nivel ${exercise.levelNumber} · ${exercise.levelName}`}</Text>
          <Text style={styles.title}>{exercise.title}</Text>
          <Text style={styles.status}>{`Ejercicio ${exercise.globalPosition} — ${JOURNEY_STATUS_LABELS[exercise.status]}`}</Text>
        </View>
        <FavoriteStar disabled={toggleDisabled} isFavorite={isFavorite} onToggle={onToggleFavorite} subject={`ejercicio ${exercise.globalPosition}`} />
      </View>
      {canOpen ? <OpenExerciseButton exerciseName={exercise.title} onPress={() => onOpenExercise(exercise.id)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderBottomColor: "#D9DED5", borderBottomWidth: 1, paddingVertical: 17 },
  headingRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  headingText: { flex: 1 },
  level: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  status: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 20, marginTop: 4 },
  title: { color: colors.text, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 4 },
});
