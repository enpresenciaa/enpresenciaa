export type JournalListFilter = "all" | "week" | "month";
export type JournalFilter = JournalListFilter | "calendar" | "favorites";

export type JournalEntry = {
  activityAt: string;
  completedAt: string | null;
  contentType: string | null;
  durationSeconds: number | null;
  emotionalScore: number | null;
  /** Null only when a completion's exercise could not be resolved. */
  exerciseId: string | null;
  exerciseName: string;
  id: string;
  levelName: string;
  progressPercentage: number;
  reflectionText: string | null;
  repetitionNumber: number | null;
  status: "completed" | "in_progress";
};

export type JournalPage = {
  entries: JournalEntry[];
  nextOffset: number | null;
};

export type JournalQueryParams = {
  filter: JournalListFilter;
  limit: number;
  offset: number;
  search: string;
  userId: string;
};
