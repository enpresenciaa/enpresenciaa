import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { BackButton } from "@/components/onboarding/BackButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";

const background = require("../../../assets/images/Imág. COMENZAR.jpg");

export default function WelcomeRoute() {
  const router = useRouter();
  return (
    <OnboardingBackground source={background}>
      <SafeAreaView style={styles.safeArea}>
        <BackButton />
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Tu bienestar empieza hoy</Text>
          <View>
            <AppButton onPress={() => router.push("/onboarding/ejercicio-inicial")}>Comenzar</AppButton>
            <Pressable accessibilityRole="link" onPress={() => router.push("/onboarding/login")} style={styles.linkButton}>
              <Text style={styles.link}>¿Ya tienes cuenta? <Text style={styles.underlined}>Inicia sesión</Text></Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  content: { alignContent:"center", flex: 1, justifyContent: "space-between", marginHorizontal: "auto", maxWidth: 560, padding: 24, paddingBottom: 28, paddingTop: 48, width: "100%" },
  link: { color: colors.text, fontFamily: fonts.body, fontSize: 14, textAlign: "center" },
  linkButton: { minHeight: 48, justifyContent: "center", marginTop: 6 },
  safeArea: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 38, lineHeight: 45, textAlign: "center" },
  underlined: { color: colors.primary, textDecorationLine: "underline" },
});
