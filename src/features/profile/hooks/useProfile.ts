import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { ensureProfile, updateProfile } from "@/features/profile/services/profile.service";
import type { ProfileUpdate } from "@/types/database";

export function getProfileQueryKey(userId: string | undefined) {
  return ["profile", userId] as const;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    enabled: Boolean(user),
    queryFn: () => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      return ensureProfile(user);
    },
    queryKey: getProfileQueryKey(user?.id),
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileUpdate) => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      return updateProfile(user.id, values);
    },
    onSuccess: profile => {
      queryClient.setQueryData(getProfileQueryKey(user?.id), profile);
    },
  });
}
