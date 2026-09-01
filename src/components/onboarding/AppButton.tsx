import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

type AppButtonProps = {
  accessibilityLabel?: string;
  allowPressWhenDisabled?: boolean;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};

export function AppButton({ accessibilityLabel, allowPressWhenDisabled = false, children, disabled = false, loading = false, onPress }: AppButtonProps) {
  const interactionDisabled = loading || (disabled && !allowPressWhenDisabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: interactionDisabled, busy: loading }}
      disabled={interactionDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && !interactionDisabled && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={colors.buttonText} /> : <Text style={styles.label}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 24,
    width: "80%",
  },
  disabled: { opacity: 0.45 },
  label: { color: colors.buttonText, fontFamily: fonts.title, fontSize: 23 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
