import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";

const background = require("../../../assets/images/Imág. EMPEZAR.jpg");

export default function StartJourneyRoute() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const scale = useSharedValue(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(scale);
      scale.value = 1;
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 536 }),
        withTiming(1, { duration: 536 }),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(scale);
  }, [reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  async function handleStart() {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      await completeOnboarding();
      router.replace("/(tabs)");
    } catch {
      setIsNavigating(false);
      Alert.alert("No pudimos continuar", "Revisa tu conexión e inténtalo nuevamente.");
    }
  }

  return (
    <OnboardingBackground source={background}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <Text accessibilityRole="text" accessible style={[styles.dimension, styles.mental]}>Mental</Text>
          <Text accessibilityRole="text" accessible style={[styles.dimension, styles.emotional]}>Emocional</Text>

          <Animated.View style={[styles.pulse, animatedStyle]}>
            <Pressable
              accessibilityHint="Abre la navegación principal de la aplicación"
              accessibilityLabel="Empezar mi camino"
              accessibilityRole="button"
              accessibilityState={{ disabled: isNavigating }}
              disabled={isNavigating}
              onPress={() => void handleStart()}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isNavigating && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Empezar</Text>
            </Pressable>
          </Animated.View>

          <Text accessibilityRole="text" accessible style={[styles.dimension, styles.physical]}>Físico</Text>
          <Text accessibilityRole="text" accessible style={[styles.dimension, styles.spiritual]}>Energético{"\n"}y espiritual</Text>
        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const labelGold = "#f7e5b1";

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "rgba(255, 222, 145, 0.41)", borderRadius: 34, justifyContent: "center", minHeight: 58, minWidth: 126, paddingHorizontal: 22 },
  buttonDisabled: { opacity: 0.65 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: colors.primary, fontFamily: fonts.title, fontSize: 27 },
  content: { flex: 1, position: "relative" },
  dimension: { color: labelGold, fontFamily: fonts.body, fontSize: 17, lineHeight: 23, position: "absolute", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 4 },
  emotional: { right: "7%", textAlign: "right", top: "29%" },
  mental: { left: "7%", top: "23%" },
  physical: { bottom: "25%", left: "7%" },
  pulse: { alignSelf: "center", position: "absolute", top: "40%" },
  safeArea: { flex: 1 },
  spiritual: { bottom: "19%", right: "7%", textAlign: "right" },
});
