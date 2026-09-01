import type { LevelExercise, MapLevel } from "@/features/journey/types";

export const CURRENT_LEVEL_ID = "4";

export const journeyLevels: MapLevel[] = [
  { id: "1", number: 1, name: "Presencia", description: "Reconoce dónde estás y comienza tu camino.", positionX: 0.683, positionY: 0.813, status: "completed", exerciseCount: 3 },
  { id: "2", number: 2, name: "Consciencia", description: "Observa tu experiencia con mayor claridad.", positionX: 0.298, positionY: 0.738, status: "completed", exerciseCount: 3 },
  { id: "3", number: 3, name: "Equilibrio", description: "Integra mente, emoción y cuerpo.", positionX: 0.687, positionY: 0.677, status: "completed", exerciseCount: 3 },
  { id: "4", number: 4, name: "Reconexión", description: "Continúa fortaleciendo la relación contigo.", positionX: 0.280, positionY: 0.616, status: "in_progress", exerciseCount: 3 },
  { id: "5", number: 5, name: "Apertura", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.696, positionY: 0.554, status: "locked", exerciseCount: 3 },
  { id: "6", number: 6, name: "Confianza", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.277, positionY: 0.493, status: "locked", exerciseCount: 3 },
  { id: "7", number: 7, name: "Expansión", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.690, positionY: 0.439, status: "locked", exerciseCount: 3 },
  { id: "8", number: 8, name: "Integración", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.286, positionY: 0.381, status: "locked", exerciseCount: 3 },
  { id: "9", number: 9, name: "Claridad", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.689, positionY: 0.314, status: "locked", exerciseCount: 3 },
  { id: "10", number: 10, name: "Transformación", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.288, positionY: 0.256, status: "locked", exerciseCount: 3 },
  { id: "11", number: 11, name: "Plenitud", description: "Una nueva etapa de tu recorrido personal.", positionX: 0.710, positionY: 0.181, status: "locked", exerciseCount: 3 },
  { id: "12", number: 12, name: "Trascendencia", description: "Contenido premium provisional.", positionX: 0.395, positionY: 0.108, status: "premium", exerciseCount: 3 },
  { id: "13", number: 13, name: "Esencia", description: "La cima del camino. Contenido premium provisional.", positionX: 0.531, positionY: 0.048, status: "premium", exerciseCount: 3 },
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
