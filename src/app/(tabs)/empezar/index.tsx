import { useQueryClient } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getJourneyQueryOptions } from "@/features/journey/hooks/useJourney";

const background = require("../../../../assets/images/EMPEZAR.png");

export default function StartRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loadingRef = useRef(false);
  const focusedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useFocusEffect(useCallback(() => {
    focusedRef.current = true;
    return () => { focusedRef.current = false; };
  }, []));

  async function openJourney() {
    if (loadingRef.current || !user) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setLoadError(false);

    try {
      await queryClient.fetchQuery(getJourneyQueryOptions(user.id));
      if (focusedRef.current) {
        router.push("/(tabs)/empezar/camino" as Href);
      }
    } catch {
      if (focusedRef.current) {
        setLoadError(true);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

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

  return (
    <OnboardingBackground backgroundColor="#053B32" contentFit="cover" contentPosition="top center" source={background}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.pulse, animatedStyle]}>
            <Pressable
              accessibilityHint="Abre tu Camino"
              accessibilityLabel="Empezar mi camino"
              accessibilityRole="button"
              accessibilityState={{ busy: isLoading, disabled: isLoading || !user }}
              disabled={isLoading || !user}
              onPress={() => void openJourney()}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={[styles.buttonText, isLoading && styles.loadingText]}>Empezar</Text>
            </Pressable>
          </Animated.View>
          {loadError ? <Text accessibilityRole="alert" style={styles.error}>No pudimos cargar tu camino. Toca Empezar para reintentar.</Text> : null}
        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "rgba(255, 222, 145, 0.41)",
    borderRadius: 34,
    justifyContent: "center",
    minHeight: 58,
    minWidth: 126,
    paddingHorizontal: 22,
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: colors.primary, fontFamily: fonts.title, fontSize: 27 },
  content: { flex: 1, position: "relative" },
  error: { alignSelf: "center", backgroundColor: "rgba(5,59,50,0.9)", borderRadius: 12, bottom: 24, color: "#FFFFFF", fontFamily: fonts.body, fontSize: 14, padding: 16, position: "absolute", textAlign: "center" },
  loadingText: { opacity: 0.4 },
  pulse: { alignSelf: "center", position: "absolute", top: "45%" },
  safeArea: { flex: 1 },
});
