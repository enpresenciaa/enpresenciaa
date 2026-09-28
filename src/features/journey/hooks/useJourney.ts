import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGuestTrialQueryKey, isGuestTrialExpiredError } from "@/features/guest-trial/utils/guest-trial.utils";
import { getJourneyState } from "@/features/journey/domain/journey.domain";
import type { JourneyCompletionDraft } from "@/features/journey/domain/journey.types";
import { useDeveloperMocks } from "@/features/developer-mocks/hooks/useDeveloperMocks";
import { removeJourneyCompletionDraft } from "@/features/journey/services/journey-completion-draft.storage";
import { mockJourneyRepository } from "@/features/journey/services/mock-journey.repository";
import { supabaseJourneyRepository } from "@/features/journey/services/supabase-journey.repository";
import { useAuth } from "@/features/auth/hooks/useAuth";

type JourneyDataSource = "journey-demo" | "real";

function getJourneyRepository(dataSource: JourneyDataSource) {
  return dataSource === "journey-demo" ? mockJourneyRepository : supabaseJourneyRepository;
}

export function getJourneyQueryKey(userId: string | undefined) {
  return ["journey", userId] as const;
}

export function getJourneyQueryOptions(userId: string | undefined, dataSource: JourneyDataSource = "real") {
  return queryOptions({
    queryFn: async () => getJourneyState(await getJourneyRepository(dataSource).getSnapshot()),
    queryKey: [...getJourneyQueryKey(userId), dataSource] as const,
  });
}

export function getExerciseDetailQueryKey(userId: string | undefined, exerciseId: string | undefined) {
  return ["exercise-detail", userId, exerciseId] as const;
}

export function useExerciseDetail(exerciseId: string | undefined) {
  const { status, user } = useAuth();
  const { dataSource } = useDeveloperMocks();

  return useQuery({
    enabled: (status === "anonymous" || status === "permanent") && Boolean(user && exerciseId),
    queryFn: () => {
      if (!exerciseId) {
        throw new Error("EXERCISE_NOT_AVAILABLE");
      }
      return getJourneyRepository(dataSource).getExerciseDetail(exerciseId);
    },
    queryKey: [...getExerciseDetailQueryKey(user?.id, exerciseId), dataSource],
  });
}

export function useCompleteJourneyExercise() {
  const { user } = useAuth();
  const { dataSource } = useDeveloperMocks();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: JourneyCompletionDraft) => {
      if (!user || draft.userId !== user.id) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      return getJourneyRepository(dataSource).completeExercise(draft);
    },
    // A rejected completion may mean the trial just expired; refresh its status so the gate appears.
    onError: async (error, draft) => {
      if (isGuestTrialExpiredError(error)) {
        await queryClient.invalidateQueries({ queryKey: getGuestTrialQueryKey(draft.userId) });
      }
    },
    onSuccess: async (_, draft) => {
      await removeJourneyCompletionDraft(draft.userId, draft.exerciseId);
      await queryClient.invalidateQueries({ queryKey: getGuestTrialQueryKey(draft.userId) });
      await queryClient.invalidateQueries({ queryKey: getJourneyQueryKey(draft.userId) });
      await queryClient.invalidateQueries({ queryKey: ["journal", draft.userId] });
      await queryClient.invalidateQueries({ queryKey: getExerciseDetailQueryKey(draft.userId, draft.exerciseId) });
    },
  });
}

export function useJourney() {
  const { status, user } = useAuth();
  const { dataSource } = useDeveloperMocks();

  return useQuery({
    ...getJourneyQueryOptions(user?.id, dataSource),
    enabled: (status === "anonymous" || status === "permanent") && Boolean(user),
  });
}

export function useSetExerciseFavorite() {
  const { user } = useAuth();
  const { dataSource } = useDeveloperMocks();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ exerciseId, isFavorite }: { exerciseId: string; isFavorite: boolean }) => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      await getJourneyRepository(dataSource).setExerciseFavorite(user.id, exerciseId, isFavorite);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getJourneyQueryKey(user?.id) }),
  });
}
