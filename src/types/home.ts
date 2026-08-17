export interface ActivityDay {
  date: string;
  completedExercises: number;
}

export interface CurrentExercise {
  durationMinutes: number;
  exerciseName: string;
  id: string;
  levelName: string;
  status: "locked" | "available" | "in_progress" | "completed";
}

export interface RecentExercise {
  completedAt: string;
  exerciseName: string;
  id: string;
  levelName: string;
}

export interface HomeUser {
  name: string;
}
