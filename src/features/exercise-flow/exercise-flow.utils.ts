import type { Mood } from "@/components/onboarding/MoodSelector";

export const REFLECTION_MAX_LENGTH = 150;

export function countReflectionCharacters(value: string): number {
  return Array.from(value).length;
}

export function clampReflection(value: string): string {
  return Array.from(value).slice(0, REFLECTION_MAX_LENGTH).join("");
}

export function getEmotionalScore(mood: Mood): number {
  const scores: Record<Mood, number> = {
    "very-sad": 1,
    "sad": 2,
    "neutral": 3,
    "happy": 4,
    "very-happy": 5,
  };
  return scores[mood];
}

export function getExerciseFlowErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("DAILY_ADVANCE_LIMIT_REACHED")) {
    return "Ya completaste tu ejercicio de Camino de hoy. Podrás avanzar de nuevo mañana.";
  }
  if (message.includes("DAILY_REPETITION_LIMIT_REACHED")) {
    return "Alcanzaste el límite de repeticiones de este ejercicio por hoy.";
  }
  if (message.includes("OUT_OF_SEQUENCE") || message.includes("NO_AVAILABLE_EXERCISE")) {
    return "Este ejercicio todavía no está disponible en tu Camino.";
  }
  if (message.includes("INVALID_EMOTIONAL_SCORE") || message.includes("INVALID_REFLECTION")) {
    return "Revisa tu emoción y escribe una reflexión de hasta 150 caracteres.";
  }
  if (message.includes("AUTH_SESSION_REQUIRED")) {
    return "No pudimos preparar tu sesión. Inténtalo de nuevo.";
  }
  if (message.includes("INITIAL_COMPLETION_VERIFICATION_FAILED")) {
    return "Guardamos la respuesta, pero no pudimos confirmarla. Inténtalo de nuevo.";
  }

  return "No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.";
}
