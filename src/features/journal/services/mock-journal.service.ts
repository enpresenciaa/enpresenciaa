import type { JournalCalendarEntry, JournalMonthParams } from "@/features/journal/services/journal-calendar.query";
import type { JournalEntry, JournalPage, JournalQueryParams } from "@/features/journal/types";
import { isEntryWithinFilter, matchesJournalEntry, sanitizeJournalSearch } from "@/features/journal/utils/journal.utils";
import { getMockExerciseModality, getMockJourneyJournalState } from "@/features/journey/services/mock-journey.repository";

function getCompletedEntries(): JournalCalendarEntry[] {
  const state = getMockJourneyJournalState();
  const exercises = new Map(state.exercises.map(exercise => [exercise.id, exercise]));

  return state.completions.flatMap((completion) => {
    const exercise = exercises.get(completion.exerciseId);
    if (!exercise) {
      return [];
    }

    return [{
      activityAt: completion.completedAt,
      businessDate: completion.businessDate,
      completedAt: completion.completedAt,
      contentType: getMockExerciseModality(exercise.globalPosition),
      durationSeconds: completion.durationSeconds,
      emotionalScore: completion.emotionalScore,
      exerciseId: exercise.id,
      exerciseName: exercise.title,
      exercisePosition: exercise.positionInLevel,
      id: `completion:${completion.id}`,
      levelName: exercise.levelName,
      levelNumber: exercise.levelNumber,
      progressPercentage: 100,
      reflectionText: completion.reflectionText,
      repetitionNumber: completion.repetitionNumber,
      status: "completed" as const,
    }];
  });
}

function getListEntries(): JournalEntry[] {
  const state = getMockJourneyJournalState();
  const exercises = new Map(state.exercises.map(exercise => [exercise.id, exercise]));
  const progressEntries: JournalEntry[] = state.progress.flatMap((progress) => {
    const exercise = exercises.get(progress.exerciseId);
    if (!exercise) {
      return [];
    }

    return [{
      activityAt: progress.updatedAt,
      completedAt: null,
      contentType: getMockExerciseModality(exercise.globalPosition),
      durationSeconds: null,
      emotionalScore: null,
      exerciseId: exercise.id,
      exerciseName: exercise.title,
      id: `progress:${exercise.id}`,
      levelName: exercise.levelName,
      progressPercentage: progress.progressPercentage,
      reflectionText: null,
      repetitionNumber: null,
      status: "in_progress",
    }];
  });

  return [...getCompletedEntries(), ...progressEntries].sort((left, right) => Date.parse(right.activityAt) - Date.parse(left.activityAt));
}

export async function getMockJournalPage(params: JournalQueryParams): Promise<JournalPage> {
  if (!params.userId) {
    throw new Error("AUTH_SESSION_REQUIRED");
  }

  const matchingEntries = getListEntries()
    .filter(entry => isEntryWithinFilter(entry, params.filter))
    .filter(entry => matchesJournalEntry(entry, params.search));
  const entries = matchingEntries.slice(params.offset, params.offset + params.limit);

  return {
    entries,
    nextOffset: params.offset + entries.length < matchingEntries.length ? params.offset + entries.length : null,
  };
}

export async function getMockJournalMonth(params: JournalMonthParams): Promise<JournalCalendarEntry[]> {
  if (!params.userId) {
    throw new Error("AUTH_SESSION_REQUIRED");
  }
  if (params.signal?.aborted) {
    const error = new Error("JOURNAL_MONTH_ABORTED");
    error.name = "AbortError";
    throw error;
  }

  const search = sanitizeJournalSearch(params.search).toLocaleLowerCase("es-MX");
  return getCompletedEntries()
    .filter(entry => entry.businessDate.startsWith(`${params.month}-`))
    .filter(entry => !search || `${entry.exerciseName} ${entry.levelName}`.toLocaleLowerCase("es-MX").includes(search))
    .sort((left, right) => Date.parse(left.completedAt) - Date.parse(right.completedAt) || left.id.localeCompare(right.id));
}
