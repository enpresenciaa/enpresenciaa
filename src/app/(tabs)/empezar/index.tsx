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
import { useDeveloperMocks } from "@/features/developer-mocks/hooks/useDeveloperMocks";
import { getJourneyQueryOptions } from "@/features/journey/hooks/useJourney";

const background = require("../../../../assets/images/EMPEZAR.png");
// Intrinsic size of EMPEZAR.png and the figure's shoulder line (the button's top edge), as a fraction of its height.
const BACKGROUND_SIZE = { height: 1900, width: 900 };
const SHOULDER_LINE = 0.42;
const BUTTON_HEIGHT = 58;

// The background uses cover + top center, so the image top stays at y = 0 and scales by the larger ratio.
function getShoulderButtonTop({ height, width }: { height: number; width: number }) {
  const scale = Math.max(width / BACKGROUND_SIZE.width, height / BACKGROUND_SIZE.height);
  return BACKGROUND_SIZE.height * scale * SHOULDER_LINE;
}

export default function StartRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { dataSource } = useDeveloperMocks();
  const loadingRef = useRef(false);
  const focusedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [layoutSize, setLayoutSize] = useState<{ height: number; width: number } | null>(null);

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
      await queryClient.fetchQuery(getJourneyQueryOptions(user.id, dataSource));
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
      <View
        onLayout={event => setLayoutSize({ height: event.nativeEvent.layout.height, width: event.nativeEvent.layout.width })}
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
      >
        {layoutSize ? (
          <Animated.View style={[styles.pulse, { top: getShoulderButtonTop(layoutSize) }, animatedStyle]}>
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
        ) : null}
      </View>
      <SafeAreaView edges={["top", "left", "right"]} pointerEvents="box-none" style={styles.safeArea}>
        <View pointerEvents="box-none" style={styles.content}>
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
    minHeight: BUTTON_HEIGHT,
    minWidth: 126,
    paddingHorizontal: 22,
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: colors.primary, fontFamily: fonts.title, fontSize: 27 },
  content: { flex: 1, position: "relative" },
  error: { alignSelf: "center", backgroundColor: "rgba(5,59,50,0.9)", borderRadius: 12, bottom: 24, color: "#FFFFFF", fontFamily: fonts.body, fontSize: 14, padding: 16, position: "absolute", textAlign: "center" },
  loadingText: { opacity: 0.4 },
  pulse: { alignSelf: "center", position: "absolute" },
  safeArea: { flex: 1 },
});
