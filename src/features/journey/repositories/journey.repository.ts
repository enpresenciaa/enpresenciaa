import type { InitialExerciseCompletion, JourneyCompletionDraft, JourneyCompletionReceipt, JourneyExerciseDetail, JourneySnapshot } from "@/features/journey/domain/journey.types";

export interface JourneyRepository {
  completeExercise: (draft: JourneyCompletionDraft) => Promise<JourneyCompletionReceipt>;
  completeInitialExercise: (input: { emotionalScore: number; idempotencyKey: string; reflectionText: string }) => Promise<InitialExerciseCompletion>;
  getExerciseDetail: (exerciseId: string) => Promise<JourneyExerciseDetail>;
  getSnapshot: () => Promise<JourneySnapshot>;
  setExerciseFavorite: (userId: string, exerciseId: string, isFavorite: boolean) => Promise<void>;
}
