import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { BackButton } from "@/components/onboarding/BackButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";

const background = require("../../../assets/images/Imág. ¿YASENTISTE EL CAMBIO.jpg");

export default function PowerOfChangeRoute() {
  const router = useRouter();
  return (
    <OnboardingBackground source={background}>
      <SafeAreaView style={styles.safeArea}>
        <BackButton />
        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <Text accessibilityRole="header" style={styles.title}>¿Ya sentiste el poder del cambio?</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.subtitle}>Para que sigas transformándote,{"\n"} crea una cuenta</Text>
            <AppButton onPress={() => router.push("/onboarding/crear-cuenta")}>Crear cuenta</AppButton>
          </View>
        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, marginHorizontal: "auto", maxWidth: 560, padding: 24, paddingBottom: 28, width: "100%" },
  footer: { marginTop: "auto" },
  safeArea: { flex: 1 },
  subtitle: { color: colors.text, fontFamily: fonts.title, fontSize: 30, lineHeight: 33, marginBottom: 48, textAlign: "center" },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 37, lineHeight: 44, textAlign: "center" },
  titleBlock: { marginTop: "31%" },
});
