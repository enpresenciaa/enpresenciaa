import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { JournalEntry } from "@/features/journal/types";
import { formatDuration, formatJournalDate } from "@/features/journal/utils/journal.utils";

type JournalEntryCardProps = {
  entry: JournalEntry;
};

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusLabel = entry.status === "completed" ? "Realizado" : "En progreso";

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityHint="Muestra u oculta los detalles del ejercicio"
        accessibilityLabel={`${entry.exerciseName}, ${statusLabel}, ${entry.progressPercentage}%`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        hitSlop={6}
        onPress={() => setExpanded(value => !value)}
        style={({ pressed }) => [styles.cardButton, pressed && styles.pressed]}
      >
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <Text numberOfLines={1} style={styles.levelName}>{entry.levelName}</Text>
            <Text style={styles.exerciseName}>{entry.exerciseName}</Text>
          </View>
          <Ionicons color={colors.primary} name={expanded ? "chevron-up" : "chevron-down"} size={23} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.statusRow}>
            <Ionicons color={colors.primary} name={entry.status === "completed" ? "checkmark-circle" : "time-outline"} size={17} />
            <Text style={styles.status}>{statusLabel}</Text>
          </View>
          <Text style={styles.date}>{formatJournalDate(entry.activityAt)}</Text>
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
          <DetailRow label={entry.completedAt ? "Finalizado" : "Última actividad"} value={formatJournalDate(entry.activityAt, true)} />
          {entry.durationSeconds !== null ? <DetailRow label="Duración" value={formatDuration(entry.durationSeconds)} /> : null}
          {entry.contentType ? <DetailRow label="Contenido" value={entry.contentType} /> : null}
          {entry.repetitionNumber !== null ? <DetailRow label="Repetición" value={`${entry.repetitionNumber}`} /> : null}
          {entry.emotionalScore !== null ? <DetailRow label="Puntuación emocional" value={`${entry.emotionalScore}/5`} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderBottomColor: "#D9DED5", borderBottomWidth: 1, paddingVertical: 17 },
  cardButton: { minHeight: 120 },
  date: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  detailLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  detailValue: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 12, marginLeft: 16, textAlign: "right" },
  details: { backgroundColor: "#F5F3E9", borderRadius: 12, marginTop: 10, paddingHorizontal: 13, paddingVertical: 10 },
  exerciseName: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 22 },
  headingRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  headingText: { flex: 1 },
  levelName: { color: colors.primary, fontFamily: fonts.body, fontSize: 12, marginBottom: 2 },
  metaRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  pressed: { opacity: 0.68 },
  progressFill: { backgroundColor: colors.primary, borderRadius: 4, height: "100%" },
  progressText: { alignSelf: "flex-end", color: colors.textMuted, fontFamily: fonts.bodySemiBold, fontSize: 11, marginTop: 4 },
  progressTrack: { backgroundColor: "#DCE2D7", borderRadius: 4, height: 7, marginTop: 10, overflow: "hidden" },
  status: { color: colors.text, fontFamily: fonts.body, fontSize: 12 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 5 },
});
