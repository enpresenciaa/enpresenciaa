import type { JourneyCompletion, JourneyCompletionEligibility, JourneyExercise, JourneyExerciseState, JourneySnapshot, JourneyState } from "@/features/journey/domain/journey.types";
import { JOURNEY_TIME_ZONE } from "@/features/journey/domain/journey.types";

const businessDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: JOURNEY_TIME_ZONE,
  year: "numeric",
});

export function getBusinessDateKey(value: Date | string): string | null {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = businessDateFormatter.formatToParts(date);
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;
  const day = parts.find(part => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function sortJourneyExercises(exercises: JourneyExercise[]): JourneyExercise[] {
  return [...exercises].sort((left, right) => left.globalPosition - right.globalPosition);
}

export function getNextJourneyExercise(exercises: JourneyExercise[], completions: JourneyCompletion[]): JourneyExercise | null {
  const completedExerciseIds = new Set(completions.map(completion => completion.exerciseId));
  return sortJourneyExercises(exercises).find(exercise => !completedExerciseIds.has(exercise.id)) ?? null;
}

function wasAdvancedToday(completions: JourneyCompletion[], now: Date): boolean {
  const today = getBusinessDateKey(now);
  return today !== null && completions.some(completion => completion.advancesJourney && getBusinessDateKey(completion.completedAt) === today);
}

function getExerciseStatus(exerciseId: string, completedExerciseIds: Set<string>, nextExerciseId: string | null, completedToday: boolean): JourneyExerciseState["status"] {
  if (completedExerciseIds.has(exerciseId)) {
    return "completed";
  }

  if (exerciseId !== nextExerciseId) {
    return "future";
  }

  return completedToday ? "locked_today" : "available";
}

export function getJourneyState(snapshot: JourneySnapshot, now = new Date()): JourneyState {
  const orderedExercises = sortJourneyExercises(snapshot.exercises);
  const completedExerciseIds = new Set(snapshot.completions.map(completion => completion.exerciseId));
  const nextExerciseId = getNextJourneyExercise(orderedExercises, snapshot.completions)?.id ?? null;
  const advancedToday = wasAdvancedToday(snapshot.completions, now);
  const favoriteExerciseIds = new Set(snapshot.favoriteExerciseIds);
  const exercises: JourneyExerciseState[] = orderedExercises.map(exercise => ({
    ...exercise,
    isFavorite: favoriteExerciseIds.has(exercise.id),
    status: getExerciseStatus(exercise.id, completedExerciseIds, nextExerciseId, advancedToday),
  }));

  return {
    advancedToday,
    exercises,
    nextExercise: exercises.find(exercise => exercise.id === nextExerciseId) ?? null,
  };
}

export function canCompleteJourneyExercise(state: JourneyState, exerciseId: string): JourneyCompletionEligibility {
  const exercise = state.exercises.find(item => item.id === exerciseId);

  if (!exercise) {
    return { allowed: false, reason: "EXERCISE_NOT_FOUND" };
  }

  if (exercise.status === "completed") {
    return { allowed: true };
  }

  if (state.advancedToday) {
    return { allowed: false, reason: "DAILY_LIMIT_REACHED" };
  }

  if (exercise.status !== "available") {
    return { allowed: false, reason: "OUT_OF_SEQUENCE" };
  }

  return { allowed: true };
}
