import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

type Props = { accessibilityLabel: string; checked: boolean; error?: string; label: ReactNode; onChange: (checked: boolean) => void };

export function AppCheckbox({ accessibilityLabel, checked, error, label, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onChange(!checked)} style={styles.row}>
        <View style={[styles.box, checked && styles.checked]}>
          {checked ? <Ionicons color={colors.buttonText} name="checkmark" size={17} /> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", borderColor: colors.primary, borderRadius: 4, borderWidth: 1.5, height: 20, justifyContent: "center", width: 20 },
  checked: { backgroundColor: colors.primary },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 11, marginLeft: 28, marginTop: 2 },
  label: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  row: { alignItems: "center", flexDirection: "row", gap: 8, minHeight: 32 },
  wrapper: { marginBottom: 4 },
});
