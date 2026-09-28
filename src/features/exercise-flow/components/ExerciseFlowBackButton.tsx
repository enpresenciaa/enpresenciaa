import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/config/onboarding-theme";

export function ExerciseFlowBackButton({ onPress }: { onPress: () => void }) {
  // Absolute children ignore SafeAreaView padding, so the inset is applied explicitly
  // to keep the button out of the status bar, where Android swallows touches.
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="Regresar"
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { top: insets.top + 8 }, pressed && styles.pressed]}
    >
      <Ionicons color={colors.primary} name="arrow-back" size={27} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "rgba(253,248,236,0.9)", borderRadius: 23, height: 46, justifyContent: "center", position: "absolute", right: 16, width: 46, zIndex: 10 },
  pressed: { opacity: 0.65 },
});
