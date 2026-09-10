import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useRef } from "react";

import { ExerciseFlow } from "@/features/exercise-flow/components/ExerciseFlow";
import type { ExerciseFlowModel } from "@/features/exercise-flow/components/ExerciseFlow";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabaseJourneyRepository } from "@/features/journey/services/supabase-journey.repository";
import { createUuid } from "@/lib/uuid";

const initialExercise: ExerciseFlowModel = {
  content: {
    modality: "video",
    source: require("../../../assets/videos/video_introduccion.mp4"),
    title: "Video del ejercicio inicial",
  },
  doorLabel: "Puerta de entrada",
  exerciseLabel: "Ejercicio inicial",
  guidePhrase: "¿Quién soy hoy?",
  instructions: "Mira el video completo. Después reconoce cómo te sientes y escribe una breve reflexión sobre este momento.",
  levelLabel: "Nivel inicial",
  title: "Reconocer cómo estoy",
};

export default function InitialExerciseRoute() {
  const router = useRouter();
  const { completeOnboarding, ensureAnonymousSession } = useAuth();
  const idempotencyKeyRef = useRef(createUuid());

  async function handleComplete(answer: { emotionalScore: number; reflectionText: string }) {
    const user = await ensureAnonymousSession();
    const completion = await supabaseJourneyRepository.completeInitialExercise({
      emotionalScore: answer.emotionalScore,
      idempotencyKey: idempotencyKeyRef.current,
      reflectionText: answer.reflectionText,
    });

    if (completion.userId !== user.id) {
      throw new Error("INITIAL_COMPLETION_VERIFICATION_FAILED");
    }

    await completeOnboarding();
    router.replace("/(tabs)/empezar" as Href);
  }

  return (
    <ExerciseFlow
      model={initialExercise}
      onComplete={handleComplete}
      onExit={() => router.canGoBack() ? router.back() : router.replace("/onboarding/bienvenida")}
      variant="onboarding"
    />
  );
}

// TODO(content): reemplazar el video local por contenido inicial publicado cuando exista su contrato editorial.
