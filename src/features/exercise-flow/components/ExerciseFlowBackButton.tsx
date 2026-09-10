import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/config/onboarding-theme";

export function ExerciseFlowBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Regresar"
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons color={colors.primary} name="arrow-back" size={27} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "rgba(253,248,236,0.9)", borderRadius: 23, height: 46, justifyContent: "center", position: "absolute", right: 16, top: 12, width: 46, zIndex: 10 },
  pressed: { opacity: 0.65 },
});
