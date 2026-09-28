import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

export function OpenExerciseButton({ exerciseName, onPress }: { exerciseName: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityHint="Abre este ejercicio para realizarlo de nuevo"
      accessibilityLabel={`Ir al ejercicio ${exerciseName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons color={colors.primary} name="return-up-back" size={18} />
      <Text style={styles.label}>Ir al ejercicio</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", alignSelf: "center", borderColor: colors.primary, borderRadius: 22, borderWidth: 1.5, flexDirection: "row", gap: 8, marginTop: 20, minHeight: 44, paddingHorizontal: 20 },
  label: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  pressed: { opacity: 0.68 },
});
