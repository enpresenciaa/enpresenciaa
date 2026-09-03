export const JOURNEY_TIME_ZONE = "America/Mexico_City";

export type JourneyExerciseStatus = "available" | "completed" | "future" | "locked_today";
export type PublicationStatus = "archived" | "draft" | "published";

export type JourneyExercise = {
  description: string | null;
  estimatedDurationMinutes: number | null;
  globalPosition: number;
  id: string;
  levelId: string;
  levelNumber: number;
  positionInLevel: number;
  publicationStatus: PublicationStatus;
  title: string;
};

export type JourneyCompletion = {
  completedAt: string;
  exerciseId: string;
  id: string;
};

export type JourneyProgress = {
  exerciseId: string;
  progressPercentage: number;
  updatedAt: string;
};

export type JourneySnapshot = {
  completions: JourneyCompletion[];
  exercises: JourneyExercise[];
  progress: JourneyProgress[];
};

export type JourneyExerciseState = JourneyExercise & {
  status: JourneyExerciseStatus;
};

export type JourneyState = {
  completedToday: boolean;
  exercises: JourneyExerciseState[];
  nextExercise: JourneyExerciseState | null;
};

export type JourneyCompletionEligibility = { allowed: true } |
  { allowed: false; reason: "ALREADY_COMPLETED" | "DAILY_LIMIT_REACHED" | "EXERCISE_NOT_FOUND" | "OUT_OF_SEQUENCE" };
