import type { ActivityDay, CurrentExercise, HomeUser, RecentExercise } from "@/types/home";

export const homeMock: {
  activityDays: ActivityDay[];
  currentExercise: CurrentExercise;
  motivation: string;
  recentExercises: RecentExercise[];
  streak: { days: number };
  user: HomeUser;
} = {
  user: { name: "Sabino" },
  motivation: "Hoy es un buen día para seguir creciendo.",
  streak: { days: 7 },
  currentExercise: { id: "exercise-4", levelName: "Puerta 1", exerciseName: "Ejercicio 4", durationMinutes: 5, status: "available" },
  recentExercises: [
    { id: "exercise-1", levelName: "Puerta 1", exerciseName: "Ejercicio 1", completedAt: "2026-08-06" },
    { id: "exercise-2", levelName: "Puerta 1", exerciseName: "Ejercicio 2", completedAt: "2026-08-07" },
    { id: "exercise-3", levelName: "Puerta 1", exerciseName: "Ejercicio 3", completedAt: "2026-08-08" },
  ],
  activityDays: [
    { date: "2026-08-06", completedExercises: 1 },
    { date: "2026-08-07", completedExercises: 2 },
    { date: "2026-08-08", completedExercises: 1 },
  ],
};
