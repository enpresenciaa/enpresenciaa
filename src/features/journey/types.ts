export type LevelStatus = "locked" | "available" | "in_progress" | "completed" | "premium";

export type JourneyPerspective = "journey" | "level-focus";

export interface MapLevel {
  description?: string;
  exerciseCount: number;
  id: string;
  name: string;
  nodeOffsetX?: number;
  nodeOffsetY?: number;
  number: number;
  positionX: number;
  positionY: number;
  status: LevelStatus;
}

export interface LevelExercise {
  id: string;
  levelId: string;
  status: "locked" | "available" | "completed";
  title: string;
}
