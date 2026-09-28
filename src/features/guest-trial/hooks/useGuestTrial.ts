import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getGuestTrial } from "@/features/guest-trial/services/guest-trial.service";
import { getGuestTrialQueryKey } from "@/features/guest-trial/utils/guest-trial.utils";

// Only guests have a trial; the server remains the authority when completing exercises.
export function useGuestTrial() {
  const { status, user } = useAuth();

  return useQuery({
    enabled: status === "anonymous" && Boolean(user),
    queryFn: getGuestTrial,
    queryKey: getGuestTrialQueryKey(user?.id),
    staleTime: 60_000,
  });
}
