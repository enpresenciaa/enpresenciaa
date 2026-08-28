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
  return {
    entries,
    nextOffset: entries.length === params.limit ? from + params.limit : null,
  };
}
