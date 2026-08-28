import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { LevelStatus } from "@/features/journey/types";

interface LevelHeaderProps {
  description?: string;
  status: LevelStatus;
  title: string;
}

export function LevelHeader({ description, status, title }: LevelHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.status}>{getStatusLabel(status)}</Text>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

function getStatusLabel(status: LevelStatus): string {
  const labels: Record<LevelStatus, string> = {
    available: "Disponible",
    completed: "Completado",
    in_progress: "En progreso",
    locked: "Bloqueado",
    premium: "Premium",
  };
  return labels[status];
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 24 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 8, maxWidth: 480, textAlign: "center" },
  status: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 12, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 34, lineHeight: 41, marginTop: 3, textAlign: "center" },
});
