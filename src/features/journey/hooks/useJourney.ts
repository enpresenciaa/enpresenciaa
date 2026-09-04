import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getJourneyState } from "@/features/journey/domain/journey.domain";
import type { JourneyCompletionDraft } from "@/features/journey/domain/journey.types";
import { removeJourneyCompletionDraft } from "@/features/journey/services/journey-completion-draft.storage";
import { supabaseJourneyRepository } from "@/features/journey/services/supabase-journey.repository";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function getJourneyQueryKey(userId: string | undefined) {
  return ["journey", userId] as const;
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
    },
  });
}

export function useJourney() {
  const { status, user } = useAuth();

  return useQuery({
    enabled: (status === "anonymous" || status === "permanent") && Boolean(user),
    queryFn: async () => getJourneyState(await supabaseJourneyRepository.getSnapshot()),
    queryKey: getJourneyQueryKey(user?.id),
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
