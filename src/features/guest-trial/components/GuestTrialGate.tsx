import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";

type Props = {
  /** "screen" replaces a view; "banner" floats over the Camino. */
  variant: "banner" | "screen";
};

export function GuestTrialGate({ variant }: Props) {
  const router = useRouter();

  // Signing in replaces the guest session; the guest → account transfer does not exist yet.
  function confirmSignIn() {
    Alert.alert(
      "Iniciar sesión",
      "Si inicias sesión en una cuenta que ya existe, lo que hiciste como invitado (ejercicios, reflexiones y favoritos) todavía no se transferirá a esa cuenta. Para conservarlo, crea una cuenta nueva.",
      [
        { style: "cancel", text: "Cancelar" },
        { onPress: () => router.push("/onboarding/crear-cuenta" as Href), text: "Crear cuenta" },
        { onPress: () => router.push("/onboarding/login" as Href), style: "destructive", text: "Iniciar sesión" },
      ],
      { cancelable: true },
    );
  }

  return (
    <View accessibilityLiveRegion="polite" style={variant === "banner" ? styles.banner : styles.screen}>
      <Ionicons color={colors.primary} name="hourglass-outline" size={variant === "banner" ? 28 : 42} />
      <Text accessibilityRole="header" style={styles.title}>Tu periodo de prueba terminó</Text>
      <Text style={styles.message}>
        Crea tu cuenta para seguir avanzando en tu Camino. Conservarás tus ejercicios, reflexiones y favoritos.
      </Text>
      <View style={styles.actions}>
        <AppButton onPress={() => router.push("/onboarding/crear-cuenta" as Href)}>Crear cuenta</AppButton>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={confirmSignIn} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
          <Text style={styles.linkText}>Ya tengo cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignSelf: "stretch", marginTop: 18 },
  banner: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 20,
    bottom: 16,
    elevation: 8,
    left: 16,
    padding: 20,
    position: "absolute",
    right: 16,
    shadowColor: "#000000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  link: { alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 44 },
  linkText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14, textDecorationLine: "underline" },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 8, maxWidth: 380, textAlign: "center" },
  pressed: { opacity: 0.7 },
  screen: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 24, lineHeight: 30, marginTop: 10, textAlign: "center" },
});
