import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getJourneyState } from "@/features/journey/domain/journey.domain";
import type { JourneyCompletionDraft } from "@/features/journey/domain/journey.types";
import { removeJourneyCompletionDraft } from "@/features/journey/services/journey-completion-draft.storage";
import { supabaseJourneyRepository } from "@/features/journey/services/supabase-journey.repository";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function getJourneyQueryKey(userId: string | undefined) {
  return ["journey", userId] as const;
}

export function getJourneyQueryOptions(userId: string | undefined) {
  return queryOptions({
    queryFn: async () => getJourneyState(await supabaseJourneyRepository.getSnapshot()),
    queryKey: getJourneyQueryKey(userId),
  });
}

export function getExerciseDetailQueryKey(userId: string | undefined, exerciseId: string | undefined) {
  return ["exercise-detail", userId, exerciseId] as const;
}

export function useExerciseDetail(exerciseId: string | undefined) {
  const { status, user } = useAuth();

  return useQuery({
    enabled: (status === "anonymous" || status === "permanent") && Boolean(user && exerciseId),
    queryFn: () => {
      if (!exerciseId) {
        throw new Error("EXERCISE_NOT_AVAILABLE");
      }
      return supabaseJourneyRepository.getExerciseDetail(exerciseId);
    },
    queryKey: getExerciseDetailQueryKey(user?.id, exerciseId),
  });
}

export function useCompleteJourneyExercise() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: JourneyCompletionDraft) => {
      if (!user || draft.userId !== user.id) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      return supabaseJourneyRepository.completeExercise(draft);
    },
    onSuccess: async (_, draft) => {
      await removeJourneyCompletionDraft(draft.userId, draft.exerciseId);
      await queryClient.invalidateQueries({ queryKey: getJourneyQueryKey(draft.userId) });
      await queryClient.invalidateQueries({ queryKey: ["journal", draft.userId] });
      await queryClient.invalidateQueries({ queryKey: getExerciseDetailQueryKey(draft.userId, draft.exerciseId) });
    },
  });
}

export function useJourney() {
  const { status, user } = useAuth();

  return useQuery({
    ...getJourneyQueryOptions(user?.id),
    enabled: (status === "anonymous" || status === "permanent") && Boolean(user),
  });
}

export function useSetExerciseFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ exerciseId, isFavorite }: { exerciseId: string; isFavorite: boolean }) => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      await supabaseJourneyRepository.setExerciseFavorite(user.id, exerciseId, isFavorite);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getJourneyQueryKey(user?.id) }),
  });
}
