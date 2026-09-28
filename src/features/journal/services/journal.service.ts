import { getJournalPeriodStart, mapJournalEntry, sanitizeJournalSearch } from "@/features/journal/utils/journal.utils";
import type { JournalPage, JournalQueryParams } from "@/features/journal/types";
import { supabase } from "@/lib/supabase";

export async function getJournalPage(params: JournalQueryParams): Promise<JournalPage> {
  const from = params.offset;
  const to = from + params.limit - 1;
  const periodStart = getJournalPeriodStart(params.filter);
  const search = sanitizeJournalSearch(params.search);
  let query = supabase
    .from("journal_entries")
    .select("entry_id,user_id,level_name,exercise_name,progress_percentage,activity_at,completed_at,duration_seconds,content_type,repetition_number,emotional_score")
    .eq("user_id", params.userId)
    .order("activity_at", { ascending: false })
    .order("completed_at", { ascending: false, nullsFirst: false })
    .order("entry_id", { ascending: true })
    .range(from, to);

  if (periodStart) {
    query = query.gte("activity_at", periodStart);
  }

  if (search) {
    query = query.or(`exercise_name.ilike.%${search}%,level_name.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const entries = data.map(mapJournalEntry);
  const completionIds = entries.flatMap((entry) => {
    const match = /^completion:(.+)$/.exec(entry.id);
    return match ? [match[1]] : [];
  });
  const reflectionByCompletion = new Map<string, string>();
  const exerciseByCompletion = new Map<string, string>();

  if (completionIds.length > 0) {
    // The view has no exercise_id, so completions resolve it from their own RLS-scoped rows.
    const [reflectionResult, completionResult] = await Promise.all([
      supabase.from("completion_reflections").select("completion_id,reflection_text").in("completion_id", completionIds),
      supabase.from("exercise_completions").select("id,exercise_id").in("id", completionIds),
    ]);

    if (reflectionResult.error) {
      throw reflectionResult.error;
    }
    if (completionResult.error) {
      throw completionResult.error;
    }

    for (const reflection of reflectionResult.data) {
      reflectionByCompletion.set(reflection.completion_id, reflection.reflection_text);
    }
    for (const completion of completionResult.data) {
      exerciseByCompletion.set(completion.id, completion.exercise_id);
    }
  }

  return {
    entries: entries.map((entry) => {
      const match = /^completion:(.+)$/.exec(entry.id);
      return match ?
          { ...entry, exerciseId: exerciseByCompletion.get(match[1]) ?? null, reflectionText: reflectionByCompletion.get(match[1]) ?? null } :
        entry;
    }),
    nextOffset: entries.length === params.limit ? from + params.limit : null,
  };
}
