import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { formatJournalDay, formatJournalMonth, getCurrentJournalDay, getJournalMonthDays, shiftJournalMonth } from "@/features/journal/utils/journal-calendar.utils";

type Props = {
  activityByDay: ReadonlyMap<string, number>;
  activityMarker: ReactNode;
  isLoading: boolean;
  onDayPress: (day: string) => void;
  onMonthChange: (month: string) => void;
  selectedDay: string | null;
  visibleMonth: string;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function JournalCalendar({ activityByDay, activityMarker, isLoading, onDayPress, onMonthChange, selectedDay, visibleMonth }: Props) {
  const today = getCurrentJournalDay();
  const days = getJournalMonthDays(visibleMonth);

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Pressable accessibilityLabel="Mes anterior" accessibilityRole="button" onPress={() => onMonthChange(shiftJournalMonth(visibleMonth, -1))} style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}>
          <Ionicons color={colors.primary} name="chevron-back" size={25} />
        </Pressable>
        <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={styles.monthTitle}>{formatJournalMonth(visibleMonth)}</Text>
        <Pressable accessibilityLabel="Mes siguiente" accessibilityRole="button" onPress={() => onMonthChange(shiftJournalMonth(visibleMonth, 1))} style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}>
          <Ionicons color={colors.primary} name="chevron-forward" size={25} />
        </Pressable>
      </View>
      <View accessibilityState={{ busy: isLoading }} style={styles.gridContainer}>
        <View style={styles.weekRow}>
          {WEEKDAYS.map(day => <Text key={day} numberOfLines={1} style={styles.weekday}>{day}</Text>)}
        </View>
        <View style={styles.grid}>
          {days.map((day, index) => {
            if (!day) {
              // eslint-disable-next-line react/no-array-index-key -- Empty slots represent fixed positions in this month's grid.
              return <View key={`empty-${index}`} style={styles.cell} />;
            }
            const count = isLoading ? 0 : activityByDay.get(day) ?? 0;
            const selected = selectedDay === day;
            const isToday = day === today;
            const content = (
              <View style={[styles.dayFace, count > 0 && styles.activeFace, selected && styles.selectedFace]}>
                {count > 0 ? <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={styles.marker}>{activityMarker}</View> : null}
                <Text style={[styles.dayNumber, count === 0 && styles.inactiveNumber]}>{Number(day.slice(-2))}</Text>
                {isToday ? <View style={styles.todayLine} /> : null}
              </View>
            );
            return count > 0 ? (
              <Pressable
                accessibilityHint="Abre los registros de este día"
                accessibilityLabel={`${formatJournalDay(day)}, ${count} ${count === 1 ? "ejercicio completado" : "ejercicios completados"}${isToday ? ", hoy" : ""}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={day}
                onPress={() => onDayPress(day)}
                style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
              >
                {content}
              </Pressable>
            ) : (
              <View accessible accessibilityLabel={`${formatJournalDay(day)}${isToday ? ", hoy" : ""}, ${isLoading ? "actividad cargando" : "sin ejercicios completados"}`} key={day} style={styles.cell}>
                {content}
              </View>
            );
          })}
        </View>
      </View>
      <View accessibilityLiveRegion="polite" style={styles.legend}>
        {isLoading ? <ActivityIndicator color={colors.primary} size="small" /> : null}
        <Text style={styles.legendText}>{isLoading ? "Cargando actividad del mes…" : "Selecciona un día marcado para recordar tu camino."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeFace: { backgroundColor: "rgba(54,75,38,0.10)", borderColor: "rgba(54,75,38,0.14)" },
  cell: { alignItems: "center", justifyContent: "center", minHeight: 48, width: `${100 / 7}%` },
  container: { marginTop: 18, paddingBottom: 16 },
  dayFace: { alignItems: "center", borderColor: "transparent", borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  dayNumber: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 17 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridContainer: { width: "100%" },
  inactiveNumber: { color: colors.textMuted, fontFamily: fonts.body },
  legend: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 16, paddingHorizontal: 16 },
  legendText: { color: colors.textMuted, flexShrink: 1, fontFamily: fonts.body, fontSize: 12, textAlign: "center" },
  marker: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", opacity: 0.34 },
  monthButton: { alignItems: "center", justifyContent: "center", minHeight: 48, width: 48 },
  monthRow: { alignItems: "center", flexDirection: "row", marginBottom: 12 },
  monthTitle: { color: colors.text, flex: 1, fontFamily: fonts.title, fontSize: 25, textAlign: "center", textTransform: "capitalize" },
  pressed: { opacity: 0.65 },
  selectedFace: { borderColor: colors.primary, borderWidth: 2 },
  todayLine: { backgroundColor: colors.primary, borderRadius: 2, bottom: 4, height: 3, position: "absolute", width: 16 },
  weekday: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 11, paddingVertical: 9, textAlign: "center", width: `${100 / 7}%` },
  weekRow: { flexDirection: "row" },
});
