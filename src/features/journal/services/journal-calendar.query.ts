import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { JournalEntry } from "@/features/journal/types";
import { getJournalMonthBounds } from "@/features/journal/utils/journal-calendar.utils";
import { sanitizeJournalSearch } from "@/features/journal/utils/journal.utils";
import type { Database } from "@/types/database";

export type JournalCalendarEntry = JournalEntry & {
  businessDate: string;
  completedAt: string;
  exerciseId: string;
  exercisePosition: number | null;
  levelNumber: number;
  reflectionText: string | null;
  status: "completed";
};

export type JournalMonthParams = {
  month: string;
  search: string;
  signal?: AbortSignal;
  userId: string;
};

// Manual Database relationships cannot infer embedded rows. Validate the wire
// contract without casting it or exposing received personal data in errors.
const completionSchema = z.object({
  business_date: z.string().date(),
  completed_at: z.string().datetime({ offset: true }),
  duration_seconds: z.number().int().nonnegative().nullable(),
  emotional_score: z.number().int().min(1).max(5).nullable(),
  exercise: z.object({
    content_type: z.string().nullable(),
    level: z.object({ name: z.string(), number: z.number().int().positive() }),
    name: z.string(),
    position: z.number().int().positive().nullable(),
  }),
  exercise_id: z.string().uuid(),
  id: z.string().uuid(),
  reflection: z.object({ reflection_text: z.string() }).nullable(),
  repetition_number: z.number().int().positive(),
});

const pageSchema = z.array(completionSchema);
const PAGE_SIZE = 500;
const COLUMNS = "id,exercise_id,business_date,completed_at,duration_seconds,emotional_score,repetition_number,exercise:exercises!inner(name,position,content_type,level:levels!inner(name,number)),reflection:completion_reflections(reflection_text)";

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error("JOURNAL_MONTH_ABORTED");
    error.name = "AbortError";
    throw error;
  }
}

export async function queryJournalMonth(
  client: Pick<SupabaseClient<Database>, "from">,
  params: JournalMonthParams,
): Promise<JournalCalendarEntry[]> {
  if (!params.userId) {
    throw new Error("AUTH_SESSION_REQUIRED");
  }

  const { start, end } = getJournalMonthBounds(params.month);
  const search = sanitizeJournalSearch(params.search).toLocaleLowerCase("es-MX");
  const entries: JournalCalendarEntry[] = [];
  let offset = 0;

  while (true) {
    assertNotAborted(params.signal);

    // RLS enforces auth.uid(); the filter also prevents a changing session from
    // returning another identity's data. Inner joins preserve journal_entries'
    // visibility when an exercise or level is no longer published.
    let query = client
      .from("exercise_completions")
      .select(COLUMNS, { count: "exact" })
      .eq("user_id", params.userId)
      .gte("business_date", start)
      .lt("business_date", end)
      .order("completed_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (params.signal) {
      query = query.abortSignal(params.signal);
    }

    const { data, error, count } = await query;
    assertNotAborted(params.signal);

    if (error) {
      throw new Error("JOURNAL_MONTH_QUERY_FAILED");
    }

    const parsed = pageSchema.safeParse(data);
    if (!parsed.success || count === null) {
      throw new Error("INVALID_JOURNAL_MONTH_RESPONSE");
    }

    for (const row of parsed.data) {
      if (row.business_date < start || row.business_date >= end) {
        throw new Error("INVALID_JOURNAL_MONTH_RESPONSE");
      }

      // Match the list's sanitized ILIKE on either name separately. All rows
      // belong to this month; filtering here needs no per-entry/day requests.
      if (search &&
        !row.exercise.name.toLocaleLowerCase("es-MX").includes(search) &&
        !row.exercise.level.name.toLocaleLowerCase("es-MX").includes(search)) {
        continue;
      }

      entries.push({
        activityAt: row.completed_at,
        businessDate: row.business_date,
        completedAt: row.completed_at,
        contentType: row.exercise.content_type,
        durationSeconds: row.duration_seconds,
        emotionalScore: row.emotional_score,
        exerciseId: row.exercise_id,
        exerciseName: row.exercise.name,
        exercisePosition: row.exercise.position,
        id: `completion:${row.id}`,
        levelName: row.exercise.level.name,
        levelNumber: row.exercise.level.number,
        progressPercentage: 100,
        reflectionText: row.reflection?.reflection_text ?? null,
        repetitionNumber: row.repetition_number,
        status: "completed",
      });
    }

    offset += parsed.data.length;
    if (offset >= count) {
      return entries;
    }

    // Exact count also handles Data API limits lower than our requested page.
    // Never silently show a truncated month if pagination stops unexpectedly.
    if (parsed.data.length === 0) {
      throw new Error("INCOMPLETE_JOURNAL_MONTH_RESPONSE");
    }
  }
}
