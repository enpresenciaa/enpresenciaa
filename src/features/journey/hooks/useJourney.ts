import { useQuery } from "@tanstack/react-query";

import { getJourneyState } from "@/features/journey/domain/journey.domain";
import { supabaseJourneyRepository } from "@/features/journey/services/supabase-journey.repository";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function getJourneyQueryKey(userId: string | undefined) {
  return ["journey", userId] as const;
}

export function useJourney() {
  const { status, user } = useAuth();

  return useQuery({
    enabled: (status === "anonymous" || status === "permanent") && Boolean(user),
    queryFn: async () => getJourneyState(await supabaseJourneyRepository.getSnapshot()),
    queryKey: getJourneyQueryKey(user?.id),
  });
}
