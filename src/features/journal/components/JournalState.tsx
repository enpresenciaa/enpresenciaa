import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

type JournalStateProps = {
  actionLabel?: string;
  loading?: boolean;
  message: string;
  onAction?: () => void;
  title: string;
};

export function JournalState({ actionLabel, loading, message, onAction, title }: JournalStateProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : <Ionicons color={colors.primary} name="journal-outline" size={38} />}
      <Text accessibilityRole={onAction ? "alert" : undefined} style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: { backgroundColor: colors.primary, borderRadius: 20, marginTop: 16, minHeight: 44, paddingHorizontal: 22, paddingVertical: 11 },
  actionText: { color: colors.buttonText, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  container: { alignItems: "center", justifyContent: "center", minHeight: 280, paddingHorizontal: 30 },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: "center" },
  pressed: { opacity: 0.7 },
  title: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 17, marginTop: 12, textAlign: "center" },
});
