import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDeveloperMocks } from "@/features/developer-mocks/hooks/useDeveloperMocks";
import { getJournalPage } from "@/features/journal/services/journal.service";
import { getJournalMonth } from "@/features/journal/services/journal-calendar.service";
import { getMockJournalMonth, getMockJournalPage } from "@/features/journal/services/mock-journal.service";
import type { JournalFilter, JournalPage } from "@/features/journal/types";
import { getJournalQueryKey, sanitizeJournalSearch } from "@/features/journal/utils/journal.utils";
import { getJournalCalendarQueryKey } from "@/features/journal/utils/journal-calendar.utils";

const JOURNAL_PAGE_SIZE = 20;

function getJournalSourceQueryKey(userId: string | undefined, filter: JournalFilter, search: string, source: "journey-demo" | "real") {
  return [...getJournalQueryKey(userId, filter, search), source] as const;
}

function getJournalCalendarSourceQueryKey(userId: string | undefined, month: string, search: string, source: "journey-demo" | "real") {
  return [...getJournalCalendarQueryKey(userId, month, search), source] as const;
}

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
  const { dataSource } = useDeveloperMocks();
  const debouncedSearch = useDebouncedValue(search, 300);

  return useInfiniteQuery<JournalPage, Error, InfiniteData<JournalPage>, ReturnType<typeof getJournalSourceQueryKey>, number>({
    enabled: filter !== "calendar" && filter !== "favorites" && (status === "anonymous" || status === "permanent") && Boolean(user),
    getNextPageParam: lastPage => lastPage.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      if (!user || filter === "calendar" || filter === "favorites") {
        throw new Error("AUTH_SESSION_REQUIRED");
      }

      const getPage = dataSource === "journey-demo" ? getMockJournalPage : getJournalPage;
      return getPage({
        filter,
        limit: JOURNAL_PAGE_SIZE,
        offset: pageParam,
        search: debouncedSearch,
        userId: user.id,
      });
    },
    queryKey: getJournalSourceQueryKey(user?.id, filter, debouncedSearch, dataSource),
  });
}

export function useJournalMonth(month: string, search: string, enabled: boolean) {
  const { status, user } = useAuth();
  const { dataSource } = useDeveloperMocks();
  const debouncedSearch = useDebouncedValue(search, 300);
  const query = useQuery({
    enabled: enabled && (status === "anonymous" || status === "permanent") && Boolean(user),
    queryFn: ({ signal }) => {
      if (!user) {
        throw new Error("AUTH_SESSION_REQUIRED");
      }
      const getMonth = dataSource === "journey-demo" ? getMockJournalMonth : getJournalMonth;
      return getMonth({ month, search: debouncedSearch, signal, userId: user.id });
    },
    queryKey: getJournalCalendarSourceQueryKey(user?.id, month, debouncedSearch, dataSource),
  });

  return {
    ...query,
    isSearchPending: sanitizeJournalSearch(search).toLocaleLowerCase("es-MX") !== sanitizeJournalSearch(debouncedSearch).toLocaleLowerCase("es-MX"),
  };
}
