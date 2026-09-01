import { describe, expect, test } from "bun:test";

import {
  getJournalQueryKey,
  getJournalListState,
  getJournalPeriodStart,
  isEntryWithinFilter,
  mapJournalEntry,
  matchesJournalEntry,
} from "./journal.utils.ts";

const row = {
  activity_at: "2026-08-26T18:00:00.000Z",
  completed_at: null,
  content_type: "video",
  duration_seconds: null,
  emotional_score: null,
  entry_id: "progress:exercise-1",
  exercise_name: "Respiración consciente",
  level_name: "Presencia",
  progress_percentage: 45,
  repetition_number: null,
  user_id: "user-a",
};

describe("journal mapping", () => {
  test("maps partial progress as En progreso", () => {
    expect(mapJournalEntry(row).status).toBe("in_progress");
  });

  test("maps 100 percent as Realizado", () => {
    expect(mapJournalEntry({ ...row, completed_at: row.activity_at, progress_percentage: 100 }).status).toBe("completed");
  });
});

describe("journal filters", () => {
  const now = new Date("2026-08-27T18:00:00.000Z");

  test("uses Monday and first day of month in Mexico City", () => {
    expect(getJournalPeriodStart("week", now)).toBe("2026-08-24T06:00:00.000Z");
    expect(getJournalPeriodStart("month", now)).toBe("2026-08-01T06:00:00.000Z");
  });

  test("combines search and date filters", () => {
    const entry = mapJournalEntry(row);
    expect(matchesJournalEntry(entry, "  respiración   ")).toBe(true);
    expect(matchesJournalEntry(entry, "presencia")).toBe(true);
    expect(isEntryWithinFilter(entry, "week", now)).toBe(true);
    expect(isEntryWithinFilter({ ...entry, activityAt: "2026-07-01T18:00:00.000Z" }, "month", now)).toBe(false);
  });
});

describe("journal states and cache", () => {
  test("distinguishes empty, no results and errors", () => {
    expect(getJournalListState({ entryCount: 0, hasCriteria: false, isError: false, isPending: false })).toBe("empty");
    expect(getJournalListState({ entryCount: 0, hasCriteria: true, isError: false, isPending: false })).toBe("no_results");
    expect(getJournalListState({ entryCount: 0, hasCriteria: false, isError: true, isPending: false })).toBe("error");
  });

  test("isolates the query cache by user", () => {
    expect(getJournalQueryKey("user-a", "all", "")).not.toEqual(getJournalQueryKey("user-b", "all", ""));
  });
});
