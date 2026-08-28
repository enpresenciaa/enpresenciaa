import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getJournalPage } from "@/features/journal/services/journal.service";
import type { JournalFilter, JournalPage } from "@/features/journal/types";
import { getJournalQueryKey } from "@/features/journal/utils/journal.utils";

const JOURNAL_PAGE_SIZE = 20;

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

export function useJournal(filter: JournalFilter, search: string) {
  const { status, user } = useAuth();
  const debouncedSearch = useDebouncedValue(search, 300);

  return useInfiniteQuery<JournalPage, Error, InfiniteData<JournalPage>, ReturnType<typeof getJournalQueryKey>, number>({
    enabled: status === "authenticated" && Boolean(user),
    getNextPageParam: lastPage => lastPage.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      return getJournalPage({
        filter,
        limit: JOURNAL_PAGE_SIZE,
        offset: pageParam,
        search: debouncedSearch,
        userId: user.id,
      });
    },
    queryKey: getJournalQueryKey(user?.id, filter, debouncedSearch),
  });
}
