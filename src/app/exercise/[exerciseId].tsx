import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseFlow } from "@/features/exercise-flow/components/ExerciseFlow";
import type { ExerciseFlowContent, ExerciseFlowModel } from "@/features/exercise-flow/components/ExerciseFlow";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { canCompleteJourneyExercise } from "@/features/journey/domain/journey.domain";
import { useCompleteJourneyExercise, useExerciseDetail, useJourney } from "@/features/journey/hooks/useJourney";
import { createJourneyCompletionDraft, setJourneyCompletionDraft } from "@/features/journey/services/journey-completion-draft.storage";

function State({ action, message }: { action?: () => void; message: string }) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.stateScreen}>
      <Pressable accessibilityLabel="Regresar" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Ionicons color={colors.primary} name="arrow-back" size={28} />
      </Pressable>
      <View style={styles.state}>
        <Ionicons color={colors.primary} name={action ? "cloud-offline-outline" : "lock-closed-outline"} size={42} />
        <Text accessibilityRole="alert" style={styles.message}>{message}</Text>
        {action ? <Pressable accessibilityRole="button" onPress={action} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable> : null}
      </View>
    </SafeAreaView>
  );
}

export default function ExerciseDetailRoute() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const journey = useJourney();
  const detail = useExerciseDetail(exerciseId);
  const completion = useCompleteJourneyExercise();
  const exercise = journey.data?.exercises.find(item => item.id === exerciseId);
  const eligibility = journey.data && exerciseId ? canCompleteJourneyExercise(journey.data, exerciseId) : null;

  if (journey.isPending || detail.isPending) {
    return <SafeAreaView style={styles.stateScreen}><View style={styles.state}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.message}>Preparando tu ejercicio…</Text></View></SafeAreaView>;
  }

  if (journey.isError || detail.isError) {
    return <State action={() => void Promise.all([journey.refetch(), detail.refetch()])} message="No pudimos cargar el ejercicio y su contenido publicado." />;
  }

  if (!exercise || !detail.data || !eligibility?.allowed) {
    const message = eligibility && !eligibility.allowed && eligibility.reason === "DAILY_LIMIT_REACHED" ?
      "Ya avanzaste en tu Camino hoy. Este ejercicio estará disponible mañana." :
      "Este ejercicio no está disponible en tu Camino.";
    return <State message={message} />;
  }

  const rawContent = detail.data.content;
  let content: ExerciseFlowContent;

  if (rawContent.modality === "text") {
    if (!rawContent.text?.trim()) {
      return <State message="El texto de este ejercicio no está disponible." />;
    }
    content = { modality: "text", text: rawContent.text, title: exercise.title };
  } else {
    if (!rawContent.source) {
      return <State message="El contenido de este ejercicio no está disponible." />;
    }
    content = { modality: rawContent.modality, source: rawContent.source, title: exercise.title };
  }

  const model: ExerciseFlowModel = {
    content,
    doorLabel: `Puerta ${exercise.positionInLevel}`,
    exerciseLabel: `Ejercicio ${exercise.globalPosition}`,
    guidePhrase: detail.data.guidePhrase ?? "",
    instructions: detail.data.instructions ?? "",
    levelLabel: `Nivel ${exercise.levelNumber} · ${exercise.levelName}`,
    title: exercise.title,
  };

  async function handleComplete(answer: { emotionalScore: number; reflectionText: string }) {
    if (!user || !exerciseId) {
      throw new Error("AUTH_SESSION_REQUIRED");
    }

    const draft = await createJourneyCompletionDraft(user.id, exerciseId);
    const updatedDraft = {
      ...draft,
      emotionalScore: answer.emotionalScore,
      reflectionText: answer.reflectionText,
      updatedAt: new Date().toISOString(),
    };
    await setJourneyCompletionDraft(updatedDraft);
    await completion.mutateAsync(updatedDraft);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/empezar" as Href);
    }
  }

  return <ExerciseFlow model={model} onComplete={handleComplete} onExit={() => router.back()} />;
}

const styles = StyleSheet.create({
  back: { alignItems: "center", height: 48, justifyContent: "center", left: 12, position: "absolute", top: 12, width: 48, zIndex: 2 },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 360, textAlign: "center" },
  retry: { backgroundColor: colors.primary, borderRadius: 24, marginTop: 20, minHeight: 48, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 14 },
  state: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  stateScreen: { backgroundColor: colors.background, flex: 1 },
});
