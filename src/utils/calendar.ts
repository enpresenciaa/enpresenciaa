import type { ActivityDay } from "@/types/home";

export interface CalendarCell {
  activityLevel: 0 | 1 | 2 | 3;
  date: string;
  day: number;
}

export function getActivityLevel(completedExercises: number): 0 | 1 | 2 | 3 {
  if (completedExercises >= 3) {
    return 3;
  }
  if (completedExercises === 2) {
    return 2;
  }
  if (completedExercises === 1) {
    return 1;
  }
  return 0;
}

export function createMonthGrid(year: number, month: number, activityDays: ActivityDay[]): (CalendarCell | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const activityByDate = new Map(activityDays.map(item => [item.date, item.completedExercises]));
  const cells: (CalendarCell | null)[] = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ activityLevel: getActivityLevel(activityByDate.get(date) ?? 0), date, day });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}
