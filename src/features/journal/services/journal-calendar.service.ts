import { queryJournalMonth } from "@/features/journal/services/journal-calendar.query";
import type { JournalCalendarEntry, JournalMonthParams } from "@/features/journal/services/journal-calendar.query";
import { supabase } from "@/lib/supabase";

export type { JournalCalendarEntry } from "@/features/journal/services/journal-calendar.query";

export function getJournalMonth(params: JournalMonthParams): Promise<JournalCalendarEntry[]> {
  return queryJournalMonth(supabase, params);
}
