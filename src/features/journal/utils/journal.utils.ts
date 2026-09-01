import type { JournalEntry, JournalFilter } from "@/features/journal/types";
import type { JournalEntryRow } from "@/types/database";

export const JOURNAL_TIME_ZONE = "America/Mexico_City";

export type JournalListState = "content" | "empty" | "error" | "loading" | "no_results";

function required<T>(value: T | null, field: string): T {
  if (value === null) {
    throw new Error(`INVALID_JOURNAL_ENTRY_${field.toUpperCase()}`);
  }

  return value;
}

export function mapJournalEntry(row: JournalEntryRow): JournalEntry {
  const progressPercentage = required(row.progress_percentage, "progress_percentage");

  return {
    activityAt: required(row.activity_at, "activity_at"),
    completedAt: row.completed_at,
    contentType: row.content_type,
    durationSeconds: row.duration_seconds,
    emotionalScore: row.emotional_score,
    exerciseName: required(row.exercise_name, "exercise_name"),
    id: required(row.entry_id, "entry_id"),
    levelName: required(row.level_name, "level_name"),
    progressPercentage,
    repetitionNumber: row.repetition_number,
    status: progressPercentage === 100 ? "completed" : "in_progress",
  };
}

export function normalizeJournalSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function getJournalQueryKey(userId: string | undefined, filter: JournalFilter, search: string) {
  return ["journal", userId, filter, normalizeJournalSearch(search).toLocaleLowerCase("es-MX")] as const;
}

export function sanitizeJournalSearch(value: string): string {
  return normalizeJournalSearch(value).replace(/[^\p{L}\p{N}\s-]/gu, "");
}

export function formatJournalDate(value: string, includeTime = false): string {
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    timeZone: JOURNAL_TIME_ZONE,
    year: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.hour12 = false;
    options.minute = "2-digit";
  }

  return new Intl.DateTimeFormat("es-MX", options).format(date);
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds > 0 ? `${seconds} s` : ""}`.trim() : `${seconds} s`;
}

export function getJournalPeriodStart(filter: JournalFilter, now = new Date()): string | null {
  if (filter === "all") {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: JOURNAL_TIME_ZONE,
    weekday: "short",
    year: "numeric",
  }).formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value;
  const year = Number(getPart("year"));
  const month = Number(getPart("month"));
  const day = Number(getPart("day"));
  const weekdays: Record<string, number> = { Fri: 5, Mon: 1, Sat: 6, Sun: 7, Thu: 4, Tue: 2, Wed: 3 };
  const daysFromMonday = filter === "week" ? (weekdays[getPart("weekday") ?? "Mon"] ?? 1) - 1 : day - 1;

  // Mexico City uses UTC-06:00 under the agreed product strategy.
  return new Date(Date.UTC(year, month - 1, day - daysFromMonday, 6)).toISOString();
}

export function matchesJournalEntry(entry: JournalEntry, search: string): boolean {
  const normalized = normalizeJournalSearch(search).toLocaleLowerCase("es-MX");
  return normalized.length === 0 || `${entry.exerciseName} ${entry.levelName}`.toLocaleLowerCase("es-MX").includes(normalized);
}

export function isEntryWithinFilter(entry: JournalEntry, filter: JournalFilter, now = new Date()): boolean {
  const start = getJournalPeriodStart(filter, now);
  return start === null || new Date(entry.activityAt).getTime() >= new Date(start).getTime();
}

export function getJournalListState(options: { entryCount: number; hasCriteria: boolean; isError: boolean; isPending: boolean }): JournalListState {
  if (options.isPending) {
    return "loading";
  }

  if (options.isError) {
    return "error";
  }

  if (options.entryCount > 0) {
    return "content";
  }

  return options.hasCriteria ? "no_results" : "empty";
}
