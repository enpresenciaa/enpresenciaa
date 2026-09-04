import type { JourneyCompletionDraft, JourneyCompletionReceipt, JourneySnapshot } from "@/features/journey/domain/journey.types";

export interface JourneyRepository {
  completeExercise: (draft: JourneyCompletionDraft) => Promise<JourneyCompletionReceipt>;
  getSnapshot: () => Promise<JourneySnapshot>;
  setExerciseFavorite: (userId: string, exerciseId: string, isFavorite: boolean) => Promise<void>;
}
