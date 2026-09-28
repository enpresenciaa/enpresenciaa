import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/config/onboarding-theme";
import { JournalEntryCard } from "@/features/journal/components/JournalEntryCard";
import type { JournalCalendarEntry } from "@/features/journal/services/journal-calendar.service";
import { formatJournalDay } from "@/features/journal/utils/journal-calendar.utils";

type Props = {
  day: string;
  entries: readonly JournalCalendarEntry[];
  onClose: () => void;
  onOpenExercise: (exerciseId: string) => void;
};

export function JournalDayDetails({ day, entries, onClose, onOpenExercise }: Props) {
  return (
    <View accessibilityLabel={`Detalle del ${formatJournalDay(day)}`} accessibilityViewIsModal style={styles.container}>
      <Pressable accessibilityLabel="Cerrar detalle del día" accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
        <Ionicons color={colors.primary} name="close" size={23} />
      </Pressable>
      <FlatList
        alwaysBounceVertical={false}
        contentContainerStyle={styles.content}
        data={entries}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={entry => entry.id}
        renderItem={({ item }) => <JournalEntryCard entry={item} onOpenExercise={onOpenExercise} variant="calendar" />}
        showsVerticalScrollIndicator
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  close: { alignItems: "center", borderRadius: 22, height: 44, justifyContent: "center", position: "absolute", right: 8, top: 5, width: 44, zIndex: 2 },
  container: { backgroundColor: colors.background, borderRadius: 18, elevation: 12, height: "45%", maxWidth: 480, overflow: "hidden", shadowColor: "#000000", shadowOffset: { height: 6, width: 0 }, shadowOpacity: 0.32, shadowRadius: 14, width: "86%" },
  content: { paddingBottom: 26, paddingHorizontal: 24, paddingTop: 12 },
  list: { flex: 1 },
  pressed: { opacity: 0.7 },
  separator: { backgroundColor: "rgba(54,75,38,0.28)", height: 1, marginVertical: 22 },
});
