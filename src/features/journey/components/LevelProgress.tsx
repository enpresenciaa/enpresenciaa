import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

interface LevelProgressProps {
  completed: number;
  total: number;
}

export function LevelProgress({ completed, total }: LevelProgressProps) {
  const percentage = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  return (
    <View accessibilityLabel={`${completed} de ${total} ejercicios completados`} style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Tu progreso</Text>
        <Text style={styles.value}>{completed}/{total}</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${percentage}%` }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  fill: { backgroundColor: colors.primary, borderRadius: 4, height: "100%" },
  label: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  track: { backgroundColor: "#DCE7D5", borderRadius: 4, height: 8, overflow: "hidden" },
  value: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
});
