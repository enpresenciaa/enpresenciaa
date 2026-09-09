import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";

export function NotificationsScreen() {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.content}>
        <Ionicons color={colors.primary} name="notifications-outline" size={44} />
        <Text accessibilityRole="header" style={styles.title}>Notificaciones</Text>
        <Text style={styles.description}>No tienes notificaciones por el momento.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, marginTop: 8, textAlign: "center" },
  screen: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 30, marginTop: 12 },
});
