import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

export default function AuthCallbackRoute() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text accessibilityRole="header" style={styles.title}>
        Procesando autenticación…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: "center",
  },
});
