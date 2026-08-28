import type { LevelExercise, MapLevel } from "@/features/journey/types";
import {
  CAVE_NODE_OFFSET_Y,
  LEFT_CAVE_NODE_OFFSET_X,
  RIGHT_CAVE_NODE_OFFSET_X,
  SUMMIT_NODE_OFFSET_Y,
} from "@/features/journey/constants/map-layout.constants";

export const CURRENT_LEVEL_ID = "4";

export const journeyLevels: MapLevel[] = [
  { id: "1", number: 1, name: "Presencia", description: "Reconoce dónde estás y comienza tu camino.", positionX: 0.744, positionY: 0.847, nodeOffsetX: RIGHT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "completed", exerciseCount: 3 },
  { id: "2", number: 2, name: "Consciencia", description: "Observa tu experiencia con mayor claridad.", positionX: 0.217, positionY: 0.776, nodeOffsetX: LEFT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "completed", exerciseCount: 3 },
  { id: "3", number: 3, name: "Equilibrio", description: "Integra mente, emoción y cuerpo.", positionX: 0.767, positionY: 0.711, nodeOffsetX: RIGHT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "completed", exerciseCount: 3 },
  { id: "4", number: 4, name: "Reconexión", description: "Continúa fortaleciendo la relación contigo.", positionX: 0.214, positionY: 0.650, nodeOffsetX: LEFT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "in_progress", exerciseCount: 3 },
  { id: "5", number: 5, name: "Apertura", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.768, positionY: 0.580, nodeOffsetX: RIGHT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "6", number: 6, name: "Confianza", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.206, positionY: 0.519, nodeOffsetX: LEFT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "7", number: 7, name: "Expansión", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.767, positionY: 0.459, nodeOffsetX: RIGHT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "8", number: 8, name: "Integración", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.213, positionY: 0.398, nodeOffsetX: LEFT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "9", number: 9, name: "Claridad", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.778, positionY: 0.338, nodeOffsetX: RIGHT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "10", number: 10, name: "Transformación", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.212, positionY: 0.285, nodeOffsetX: LEFT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "11", number: 11, name: "Plenitud", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.788, positionY: 0.221, nodeOffsetX: RIGHT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "locked", exerciseCount: 3 },
  { id: "12", number: 12, name: "Trascendencia", description: "Contenido premium provisional.", positionX: 0.235, positionY: 0.154, nodeOffsetX: LEFT_CAVE_NODE_OFFSET_X, nodeOffsetY: CAVE_NODE_OFFSET_Y, status: "premium", exerciseCount: 3 },
  { id: "13", number: 13, name: "Esencia", description: "La cima del camino. Contenido premium provisional.", positionX: 0.508, positionY: 0.064, nodeOffsetY: SUMMIT_NODE_OFFSET_Y, status: "premium", exerciseCount: 3 },
];

function getExerciseStatus(level: MapLevel, exerciseNumber: number): LevelExercise["status"] {
  if (level.status === "completed") {
    return "completed";
  }
  if (level.status === "in_progress") {
    if (exerciseNumber === 1) {
      return "completed";
    }
    if (exerciseNumber === 2) {
      return "available";
    }
  }
  if (level.status === "available" && exerciseNumber === 1) {
    return "available";
  }
  return "locked";
}

export const levelExercises: LevelExercise[] = journeyLevels.flatMap(level =>
  Array.from({ length: level.exerciseCount }, (_, index) => {
    const exerciseNumber = index + 1;
    return {
      id: `${level.id}-${exerciseNumber}`,
      levelId: level.id,
      status: getExerciseStatus(level, exerciseNumber),
      title: `Ejercicio ${exerciseNumber}`,
    };
  }),
);

export function getLevelById(levelId: string): MapLevel | undefined {
  return journeyLevels.find(level => level.id === levelId);
}

export function getExercisesByLevelId(levelId: string): LevelExercise[] {
  return levelExercises.filter(exercise => exercise.levelId === levelId);
}

export function canOpenLevel(level: MapLevel): boolean {
  return level.status === "available" || level.status === "in_progress" || level.status === "completed";
}
