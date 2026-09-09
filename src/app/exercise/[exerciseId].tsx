import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import type { JourneyExerciseStatus } from "@/features/journey/domain/journey.types";
import { useJourney, useSetExerciseFavorite } from "@/features/journey/hooks/useJourney";

const statusLabels: Record<JourneyExerciseStatus, string> = {
  available: "Disponible",
  completed: "Completado",
  future: "Bloqueado",
  locked_today: "Disponible mañana",
};

export default function ExerciseDetailRoute() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const journey = useJourney();
  const favorite = useSetExerciseFavorite();
  const exercise = journey.data?.exercises.find(item => item.id === exerciseId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navigation}>
        <Pressable accessibilityLabel="Regresar" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={colors.primary} name="arrow-back" size={28} />
        </Pressable>
        {exercise ? (
          <Pressable
            accessibilityLabel={exercise.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            accessibilityRole="button"
            accessibilityState={{ busy: favorite.isPending, selected: exercise.isFavorite }}
            disabled={favorite.isPending}
            onPress={() => favorite.mutate({ exerciseId: exercise.id, isFavorite: !exercise.isFavorite })}
            style={styles.iconButton}
          >
            {favorite.isPending ? <ActivityIndicator color={colors.primary} /> : <Ionicons color={colors.primary} name={exercise.isFavorite ? "heart" : "heart-outline"} size={27} />}
          </Pressable>
        ) : null}
      </View>

      {journey.isPending ? <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View> : null}
      {journey.isError ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.message}>No pudimos cargar este ejercicio.</Text>
          <Pressable accessibilityRole="button" onPress={() => void journey.refetch()} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable>
        </View>
      ) : null}
      {journey.isSuccess && !exercise ? <View style={styles.center}><Text accessibilityRole="alert" style={styles.message}>Este ejercicio no está disponible.</Text></View> : null}
      {exercise ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>Ejercicio {exercise.globalPosition} · {statusLabels[exercise.status]}</Text>
          <Text accessibilityRole="header" style={styles.title}>{exercise.title}</Text>
          {exercise.estimatedDurationMinutes ? <Text style={styles.duration}>Duración aproximada: {exercise.estimatedDurationMinutes} min</Text> : null}
          {exercise.description ? <Text style={styles.description}>{exercise.description}</Text> : null}
          <View style={styles.placeholder}>
            <Ionicons color={colors.primary} name="leaf-outline" size={36} />
            <Text style={styles.placeholderTitle}>Contenido en preparación</Text>
            <Text style={styles.message}>Este ejercicio ya forma parte del Camino, pero su contenido todavía no ha sido publicado.</Text>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  content: { paddingBottom: 36, paddingHorizontal: 24, paddingTop: 20 },
  description: { color: colors.text, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginTop: 18 },
  duration: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginTop: 8 },
  eyebrow: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  iconButton: { alignItems: "center", height: 48, justifyContent: "center", width: 48 },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: "center" },
  navigation: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 4 },
  placeholder: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "rgba(54,75,38,0.18)", borderRadius: 20, borderWidth: 1, marginTop: 28, padding: 28 },
  placeholderTitle: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 17, marginTop: 10 },
  retry: { backgroundColor: colors.primary, borderRadius: 22, marginTop: 18, paddingHorizontal: 24, paddingVertical: 11 },
  retryText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 32, marginTop: 6 },
});
