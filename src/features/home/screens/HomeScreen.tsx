import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityCalendar } from "@/components/home/ActivityCalendar";
import {
  CurrentExerciseCard,
  RecentExerciseCard,
} from "@/components/home/ExerciseCards";
import {
  HomeHeader,
  MotivationRow,
} from "@/components/home/HomeHeader";
import {
  HomeBackground,
  HomeHeroSection,
} from "@/components/home/HomeHeroSection";

import {
  colors,
  fonts,
} from "@/config/onboarding-theme";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { getProfileDisplayData } from "@/features/profile/utils/profile-display";

import { homeMock } from "@/mocks/home";
import { getUnreadNotificationsCount } from "@/mocks/notifications";

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { height } = useWindowDimensions();
  const { displayName } = getProfileDisplayData(user, profile);

  /**
   * Controla dónde comienza visualmente
   * el panel "Continúa con tu camino".
   *
   * Se adapta a distintas alturas de pantalla
   * sin depender completamente de un valor fijo.
   */
  const topSectionHeight = Math.min(
    Math.max(height * 0.6, 420),
    610,
  );

  return (
    <HomeBackground>
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* BLOQUE SUPERIOR SOBRE EL PAISAJE */}
          <View
            style={[
              styles.topSection,
              {
                minHeight: topSectionHeight,
              },
            ]}
          >
            <HomeHeader
              name={displayName}
            />

            <MotivationRow
              motivation={homeMock.motivation}
              onNotificationsPress={() => {
                router.push(
                  "/(tabs)/notificaciones",
                );
              }}
              unreadCount={
                getUnreadNotificationsCount()
              }
            />

            <HomeHeroSection
              days={homeMock.streak.days}
            />
          </View>

          {/* PANEL DE PROGRESO */}
          <View style={styles.progressSection}>
            <View
              accessibilityElementsHidden
              style={styles.handle}
            />

            <Text
              accessibilityRole="header"
              style={styles.sectionTitle}
            >
              Continúa con tu camino
            </Text>

            <CurrentExerciseCard
              exercise={homeMock.currentExercise}
              onPress={() => {
                router.push(
                  `/exercise/${homeMock.currentExercise.id}` as unknown as Href,
                );
              }}
            />

            {/*
              Este contenido queda debajo del primer viewport
              y aparece naturalmente al hacer scroll.
            */}

            <Text
              accessibilityRole="header"
              style={[
                styles.sectionSubTitle,
                styles.spacedTitle,
              ]}
            >
              Conoce tú avance
            </Text>

            {homeMock.recentExercises.map(
              exercise => (
                <RecentExerciseCard
                  exercise={exercise}
                  key={exercise.id}
                />
              ),
            )}

            <ActivityCalendar
              activityDays={
                homeMock.activityDays
              }
              month={7}
              year={2026}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </HomeBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    paddingBottom: 0,
  },

  topSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  progressSection: {
    backgroundColor: "white",

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingBottom: 34,
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: 3,
    height: 5,
    marginBottom: 18,
    width: 44,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 25,
    lineHeight: 31,
    marginBottom: 13,
  },
  sectionSubTitle: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 31,
    marginBottom: 13,
  },
  spacedTitle: {
    marginTop: 15,
    alignSelf: "center",
  },
});
