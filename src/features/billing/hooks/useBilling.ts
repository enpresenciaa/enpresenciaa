import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { createStripeCheckout, getLatestBillingSubscription } from "@/features/billing/services/billing.service";

export function getBillingSubscriptionQueryKey(userId: string | undefined) {
  return ["billing-subscription", userId] as const;
}

export function useBillingSubscription(poll = false) {
  const { status, user } = useAuth();

  return useQuery({
    enabled: status === "authenticated" && Boolean(user),
    queryFn: () => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      return getLatestBillingSubscription(user.id);
    },
    queryKey: getBillingSubscriptionQueryKey(user?.id),
    refetchInterval: poll ? 3000 : false,
  });
}

export function useCreateStripeCheckout() {
  return useMutation({ mutationFn: createStripeCheckout });
}

export function useInvalidateBillingSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: getBillingSubscriptionQueryKey(user?.id) }),
    [queryClient, user?.id],
  );
}
