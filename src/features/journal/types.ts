export type JournalFilter = "all" | "week" | "month";

export type JournalEntry = {
  activityAt: string;
  completedAt: string | null;
  contentType: string | null;
  durationSeconds: number | null;
  emotionalScore: number | null;
  exerciseName: string;
  id: string;
  levelName: string;
  progressPercentage: number;
  repetitionNumber: number | null;
  status: "completed" | "in_progress";
};

export type JournalPage = {
  entries: JournalEntry[];
  nextOffset: number | null;
};

export type JournalQueryParams = {
  filter: JournalFilter;
  limit: number;
  offset: number;
  search: string;
  userId: string;
};
