import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/config/onboarding-theme";

type BackButtonProps = {
  fallbackHref?: Href;
  inline?: boolean;
};

export function BackButton({ fallbackHref, inline = false }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref);
    }
  }

  return (
    <Pressable
      accessibilityHint="Regresa a la pantalla anterior"
      accessibilityLabel="Regresar"
      accessibilityRole="button"
      hitSlop={10}
      onPress={handleBack}
      style={({ pressed }) => [styles.button, inline && styles.inline, pressed && styles.pressed]}
    >
      <Ionicons color={colors.primary} name="arrow-back" size={28} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "rgba(253,248,236,0.82)", borderRadius: 23, height: 46, justifyContent: "center", left: 16, position: "absolute", top: 12, width: 46, zIndex: 10 },
  inline: { left: undefined, position: "relative", top: undefined },
  pressed: { opacity: 0.65 },
});
