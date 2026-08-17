import { StyleSheet, Text, View } from "react-native";

import { NotificationButton } from "@/components/home/NotificationButton";
import { BackButton } from "@/components/onboarding/BackButton";
import { colors, fonts } from "@/config/onboarding-theme";

interface Props {
  unreadCount: number;
  userName: string;
}

export function NotificationsHeader({ unreadCount, userName }: Props) {
  return (
    <View style={styles.header}>
      <BackButton inline />
      <View style={styles.textBlock}>
        <Text accessibilityRole="header" style={styles.title}>¡Hola, {userName}!</Text>
        <Text style={styles.motivation}>Tus notificaciones del día</Text>
      </View>
      <NotificationButton unreadCount={unreadCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", gap: 10, paddingBottom: 18, paddingTop: 12 },
  motivation: { color: colors.text, fontFamily: fonts.body, fontSize: 16, lineHeight: 21 },
  textBlock: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 28, lineHeight: 34 },
});
