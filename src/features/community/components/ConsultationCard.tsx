import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { ConsultationInfo } from "@/features/community/types";

export function ConsultationCard({ consultation }: { consultation: ConsultationInfo }) {
  return (
    <View style={styles.card}>
      <Ionicons accessible={false} color={colors.primary} name={consultation.id === "in-person" ? "location-outline" : "videocam-outline"} size={28} />
      <Text accessibilityRole="header" style={styles.title}>{consultation.title}</Text>
      <Text style={styles.description}>{consultation.description}</Text>
      <View style={styles.details}>
        {consultation.details.map(detail => (
          <View key={detail.label} style={styles.detail}>
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.value}>{detail.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderColor: "#E6E8E3", borderRadius: 22, borderWidth: 1, padding: 22 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 6 },
  detail: { flexDirection: "row", flexWrap: "wrap", columnGap: 16, justifyContent: "space-between", rowGap: 4 },
  details: { borderTopColor: "#E6E8E3", borderTopWidth: 1, gap: 12, marginTop: 20, paddingTop: 18 },
  label: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 26, marginTop: 12 },
  value: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
});
