import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { env } from "@/config/env";
import { colors, fonts } from "@/config/onboarding-theme";
import { BillingTestCheckout } from "@/features/billing/components/BillingTestCheckout";
import { isStripeTestCheckoutVisible } from "@/features/billing/utils/billing.utils";
import type { JourneyExerciseState, JourneyExerciseStatus } from "@/features/journey/domain/journey.types";
import { useJourney, useSetExerciseFavorite } from "@/features/journey/hooks/useJourney";

const labels: Record<JourneyExerciseStatus, string> = {
  available: "Disponible",
  completed: "Completado",
  future: "Próximamente",
  locked_today: "Disponible mañana",
};

function ExerciseRow({ exercise }: { exercise: JourneyExerciseState }) {
  const router = useRouter();
  const favorite = useSetExerciseFavorite();
  const canOpen = exercise.status !== "future";
  const isUpdating = favorite.isPending && favorite.variables?.exerciseId === exercise.id;

  return (
    <View style={[styles.row, !canOpen && styles.future]}>
      <Pressable
        accessibilityLabel={`${exercise.title}, ${labels[exercise.status]}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canOpen }}
        disabled={!canOpen}
        onPress={() => router.push({ pathname: "/exercise/[exerciseId]", params: { exerciseId: exercise.id } } as Href)}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.position}><Text style={styles.positionText}>{exercise.globalPosition}</Text></View>
        <View style={styles.copy}>
          <Text numberOfLines={2} style={styles.title}>{exercise.title}</Text>
          <Text style={styles.status}>{labels[exercise.status]}{exercise.estimatedDurationMinutes ? ` · ${exercise.estimatedDurationMinutes} min` : ""}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={exercise.isFavorite ? `Quitar ${exercise.title} de favoritos` : `Agregar ${exercise.title} a favoritos`}
        accessibilityRole="button"
        accessibilityState={{ busy: isUpdating, selected: exercise.isFavorite }}
        disabled={isUpdating}
        onPress={() => favorite.mutate({ exerciseId: exercise.id, isFavorite: !exercise.isFavorite })}
        style={({ pressed }) => [styles.favorite, pressed && styles.pressed]}
      >
        {isUpdating ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons color={colors.primary} name={exercise.isFavorite ? "heart" : "heart-outline"} size={24} />}
      </Pressable>
    </View>
  );
}

export function JourneyScreen({ showStartHeader = false }: { showStartHeader?: boolean }) {
  const journey = useJourney();
  const completed = journey.data?.exercises.filter(item => item.status === "completed").length ?? 0;
  const showStripeTestCheckout = isStripeTestCheckoutVisible(__DEV__, env.enableStripeTestCheckout);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        {showStartHeader ? (
          <View style={styles.startSection}>
            <Text accessibilityRole="header" style={styles.startTitle}>Empezar</Text>
            <Text style={styles.startDescription}>Este es tu espacio para detenerte, practicar y continuar paso a paso.</Text>
          </View>
        ) : null}
        <Text accessibilityRole="header" style={styles.heading}>Mi camino</Text>
        <Text style={styles.subtitle}>{journey.data?.exercises.length ? `${completed} de ${journey.data.exercises.length} completados` : "Avanza a tu propio ritmo"}</Text>
        {showStripeTestCheckout ? <View style={styles.testCheckout}><BillingTestCheckout /></View> : null}
      </View>
      {journey.isPending ? <State icon="hourglass-outline" message="Preparando tu camino…" /> : null}
      {journey.isError ? <State action={() => void journey.refetch()} icon="cloud-offline-outline" message="No pudimos cargar tu camino. Revisa tu conexión." /> : null}
      {journey.isSuccess ? (
        <FlatList
          contentContainerStyle={journey.data.exercises.length ? styles.list : styles.empty}
          data={journey.data.exercises}
          keyExtractor={item => item.id}
          ListEmptyComponent={<State icon="leaf-outline" message="Los ejercicios aparecerán aquí cuando se publique el contenido." title="Estamos preparando tu camino" />}
          renderItem={({ item }) => <ExerciseRow exercise={item} />}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </SafeAreaView>
  );
}

function State({ action, icon, message, title }: { action?: () => void; icon: keyof typeof Ionicons.glyphMap; message: string; title?: string }) {
  return (
    <View style={styles.state}>
      <Ionicons color={colors.primary} name={icon} size={40} />
      {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
      <Text style={styles.stateText}>{message}</Text>
      {action ? <Pressable accessibilityRole="button" onPress={action} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { flex: 1, marginLeft: 12 },
  empty: { flexGrow: 1 },
  favorite: { alignItems: "center", height: 52, justifyContent: "center", marginHorizontal: 7, width: 44 },
  future: { opacity: 0.62 },
  header: { paddingBottom: 12, paddingHorizontal: 22, paddingTop: 10 },
  heading: { color: colors.text, fontFamily: fonts.title, fontSize: 32 },
  list: { paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 },
  main: { alignItems: "center", flex: 1, flexDirection: "row", minHeight: 78, paddingLeft: 14 },
  position: { alignItems: "center", backgroundColor: "#F1E8D4", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  positionText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  pressed: { opacity: 0.68 },
  retry: { backgroundColor: colors.primary, borderRadius: 22, marginTop: 18, paddingHorizontal: 24, paddingVertical: 11 },
  retryText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 14 },
  row: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "rgba(54,75,38,0.22)", borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 12, overflow: "hidden" },
  screen: { backgroundColor: colors.background, flex: 1 },
  state: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  stateText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 320, textAlign: "center" },
  stateTitle: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 17, marginTop: 14, textAlign: "center" },
  startDescription: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 5, maxWidth: 440 },
  startSection: { marginBottom: 24 },
  startTitle: { color: colors.text, fontFamily: fonts.title, fontSize: 38 },
  status: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  testCheckout: { alignItems: "flex-start", marginTop: 8 },
  title: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 15 },
});
