import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { moods } from "@/components/onboarding/MoodSelector";
import { getEmotionalScore } from "@/features/exercise-flow/exercise-flow.utils";
import type { JournalCalendarEntry } from "@/features/journal/services/journal-calendar.service";
import { OpenExerciseButton } from "@/features/journal/components/OpenExerciseButton";
import type { JournalEntry } from "@/features/journal/types";
import { formatJournalDate } from "@/features/journal/utils/journal.utils";

type JournalEntryCardProps = ({ entry: JournalEntry; variant?: "history" } | { entry: JournalCalendarEntry; variant: "calendar" }) & {
  /** Opens the entry's exercise; the button is hidden when omitted. */
  onOpenExercise?: (exerciseId: string) => void;
};

function formatContentType(value: string | null): string {
  switch (value?.toLocaleLowerCase("es-MX")) {
    case "audio":
      return "Audio";
    case "text":
      return "Texto";
    case "video":
      return "Video";
    default:
      if (!value) {
        return "Sin tipo";
      }
      return `${value.charAt(0).toLocaleUpperCase("es-MX")}${value.slice(1).toLocaleLowerCase("es-MX")}`;
  }
}

export function JournalEntryCard(props: JournalEntryCardProps) {
  const { entry, onOpenExercise } = props;
  const exerciseId = entry.exerciseId;
  const openButton = onOpenExercise && exerciseId ?
      <OpenExerciseButton exerciseName={entry.exerciseName} onPress={() => onOpenExercise(exerciseId)} /> :
    null;
  const [expanded, setExpanded] = useState(false);
  const statusLabel = entry.status === "completed" ? "Realizado" : "En progreso";

  if (props.variant === "calendar") {
    const completion = props.entry;
    const mood = moods.find(item => getEmotionalScore(item.value) === completion.emotionalScore);
    const modality = completion.contentType === "audio" ? "Audio" : completion.contentType === "video" ? "Video" : completion.contentType === "text" ? "Texto" : "Sin modalidad registrada";
    return (
      <View style={styles.completionCard}>
        <View style={styles.summaryBlock}>
          <View style={styles.completionLevelRow}>
            <Text accessibilityRole="header" style={styles.completionLevel}>{`Nivel ${completion.levelNumber} · ${completion.levelName}`}</Text>
            <Image accessible={false} contentFit="contain" source={require("../../../../assets/images/CUEVA CAMINO1.png")} style={styles.completionLevelIcon} />
          </View>
          <View style={styles.exerciseRow}>
            <Text style={styles.completionTitle}>{completion.exerciseName}</Text>
            <Text style={styles.modality}>{modality}</Text>
          </View>
          <View style={styles.statusDateRow}>
            <Text style={styles.statusLabel}>Realizado</Text>
            <View accessible={false} style={styles.statusRule} />
            <Text style={styles.completionDate}>{formatJournalDate(completion.completedAt)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailBlock}>
          <Text style={styles.prompt}>1. ¿Cómo te sentiste después de realizar el ejercicio?</Text>
          <View style={styles.moodRow}>
            {mood ? <MaterialCommunityIcons accessible={false} color={mood.color} name={mood.icon} size={28} /> : null}
            <Text style={[styles.moodLabel, { color: mood?.color ?? colors.textMuted }]}>{mood?.label || "Sin emoción registrada"}</Text>
          </View>
        </View>

        <View style={styles.detailBlock}>
          <Text style={styles.prompt}>2. ¿Hay alguna reflexión o experiencia que quisieras registrar del ejercicio?</Text>
          <Text style={styles.reflectionText}>{completion.reflectionText?.trim() || "Sin reflexión registrada"}</Text>
          <View accessible={false} style={styles.reflectionRule} />
        </View>
        {openButton}
      </View>
    );
  }

  const contentTypeLabel = formatContentType(entry.contentType);
  const historyMood = moods.find(item => getEmotionalScore(item.value) === entry.emotionalScore);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityHint="Muestra u oculta los detalles del ejercicio"
        accessibilityLabel={`${entry.levelName}, ${contentTypeLabel}, ${entry.exerciseName}, ${statusLabel} el ${formatJournalDate(entry.activityAt)}, ${entry.progressPercentage}%`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        hitSlop={6}
        onPress={() => setExpanded(value => !value)}
        style={({ pressed }) => [styles.cardButton, pressed && styles.pressed]}
      >
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <View style={styles.levelRow}>
              <Text numberOfLines={1} style={styles.levelName}>{entry.levelName}</Text>
              <Image accessible={false} contentFit="contain" source={require("../../../../assets/images/CUEVA CAMINO1.png")} style={styles.levelIcon} />
              <Text numberOfLines={1} style={styles.contentType}>{contentTypeLabel}</Text>
            </View>
            <Text style={styles.exerciseName}>{entry.exerciseName}</Text>
            <Text style={styles.historyStatus}>{`${statusLabel} — ${formatJournalDate(entry.activityAt)}`}</Text>
          </View>
          <Ionicons color={colors.primary} name={expanded ? "chevron-up" : "chevron-down"} size={23} />
        </View>

        <View
          accessibilityLabel={`Progreso ${entry.progressPercentage}%`}
          accessibilityRole="progressbar"
          accessibilityValue={{ max: 100, min: 0, now: entry.progressPercentage }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${entry.progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{entry.progressPercentage}%</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <Text style={styles.expandedQuestion}>1. ¿Cómo te sentiste después de realizar el ejercicio?</Text>
          <View style={styles.expandedMoodRow}>
            {historyMood ? <MaterialCommunityIcons accessible={false} color={historyMood.color} name={historyMood.icon} size={30} /> : null}
            <Text style={[styles.expandedMoodLabel, { color: historyMood?.color ?? colors.textMuted }]}>{historyMood?.label ?? "Sin sentimiento registrado"}</Text>
          </View>
          <Text style={[styles.expandedQuestion, styles.reflectionQuestion]}>2. ¿Hay alguna reflexión o experiencia que quisieras registrar del ejercicio?</Text>
          <Text style={styles.expandedReflection}>{entry.reflectionText?.trim() || "Sin reflexión registrada"}</Text>
          {openButton}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderBottomColor: "#D9DED5", borderBottomWidth: 1, paddingVertical: 17 },
  cardButton: { minHeight: 120 },
  completionCard: { paddingBottom: 4 },
  completionDate: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  completionLevel: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 22, lineHeight: 29, textAlign: "center" },
  completionLevelIcon: { height: 25, width: 32 },
  completionLevelRow: { alignItems: "center", flexDirection: "row", gap: 7, justifyContent: "center", paddingHorizontal: 38 },
  completionTitle: { color: colors.text, flexShrink: 1, fontFamily: fonts.title, fontSize: 17 },
  contentType: { color: colors.textMuted, flexShrink: 1, fontFamily: fonts.title, fontSize: 13, fontStyle: "italic" },
  detailBlock: { marginTop: 20 },
  details: { paddingBottom: 18, paddingHorizontal: 24, paddingTop: 16 },
  divider: { backgroundColor: colors.primary, height: StyleSheet.hairlineWidth, marginTop: 16, width: "100%" },
  exerciseRow: { alignItems: "baseline", flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  exerciseName: { color: colors.text, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 4 },
  expandedMoodLabel: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  expandedMoodRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 10 },
  expandedQuestion: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 19 },
  expandedReflection: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 10 },
  headingRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  headingText: { flex: 1 },
  historyStatus: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 20, marginTop: 4 },
  levelIcon: { height: 22, width: 28 },
  levelName: { color: colors.text, flexShrink: 1, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  levelRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  modality: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, fontStyle: "italic" },
  moodLabel: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  moodRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 10 },
  pressed: { opacity: 0.68 },
  prompt: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 19 },
  progressFill: { backgroundColor: colors.primary, borderRadius: 4, height: "100%" },
  progressText: { alignSelf: "flex-end", color: colors.textMuted, fontFamily: fonts.bodySemiBold, fontSize: 11, marginTop: 4 },
  progressTrack: { backgroundColor: "#DCE2D7", borderRadius: 4, height: 7, marginTop: 10, overflow: "hidden" },
  reflectionRule: { backgroundColor: colors.border, height: 2, marginTop: 8, width: "82%" },
  reflectionText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 10 },
  reflectionQuestion: { marginTop: 24 },
  statusDateRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  statusLabel: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 22 },
  statusRule: { backgroundColor: colors.border, flex: 1, height: StyleSheet.hairlineWidth },
  summaryBlock: { paddingHorizontal: 2 },
});
