import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { NotificationItem } from "@/types/notification";

export function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons color={notification.type === "streak" ? "#E7792F" : colors.primary} name={notification.type === "streak" ? "flame" : "newspaper-outline"} size={26} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.description ? <Text style={styles.description}>{notification.description}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: "center", backgroundColor: "#FFFFFF", borderColor: colors.primary, borderRadius: 19, borderWidth: 1, flexDirection: "row", minHeight: 90, padding: 14, width: "90%" },
  content: { flex: 1, paddingLeft: 12 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 2, paddingRight: 8 },
  iconContainer: { alignItems: "center", backgroundColor: "rgba(220,231,213,0.72)", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  title: { color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
});
