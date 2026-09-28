import { getBusinessDateKey } from "@/features/journey/domain/journey.domain";
import type { ExerciseContentModality, JourneyCompletion, JourneyExercise, JourneyExerciseDetail, JourneySnapshot } from "@/features/journey/domain/journey.types";
import type { JourneyRepository } from "@/features/journey/repositories/journey.repository";

const EXERCISE_COUNT = 20;

export type MockJournalCompletion = JourneyCompletion & {
  businessDate: string;
  durationSeconds: number | null;
  emotionalScore: number | null;
  reflectionText: string | null;
  repetitionNumber: number;
};

function exerciseId(position: number) {
  return `00000000-0000-4000-8000-${position.toString().padStart(12, "0")}`;
}

function createExercise(position: number): JourneyExercise {
  return {
    description: `Una práctica breve para explorar el paso ${position} de tu proceso.`,
    estimatedDurationMinutes: 5 + (position % 3) * 2,
    globalPosition: position,
    guidePhrase: "Respira, observa y permite que la experiencia se despliegue sin prisa.",
    id: exerciseId(position),
    instructions: "Busca una postura cómoda. Respira con calma y dirige tu atención a las sensaciones presentes. Continúa cuando estés listo.",
    levelId: "00000000-0000-4000-9000-000000000001",
    levelName: "Presencia",
    levelNumber: 1,
    positionInLevel: position,
    publicationStatus: "published",
    title: `${["Respirar", "Observar", "Reconocer", "Aceptar", "Integrar"][position % 5]} ${position}`,
  };
}

const exercises = Array.from({ length: EXERCISE_COUNT }, (_, index) => createExercise(index + 1));

function createCompletion(position: number): MockJournalCompletion {
  const completedDate = new Date();
  completedDate.setUTCDate(completedDate.getUTCDate() - (8 - position));
  completedDate.setUTCHours(18, position, 0, 0);
  const completedAt = completedDate.toISOString();
  return {
    advancesJourney: true,
    businessDate: getBusinessDateKey(completedAt) ?? completedAt.slice(0, 10),
    completedAt,
    durationSeconds: 240 + position * 35,
    emotionalScore: ((position - 1) % 5) + 1,
    exerciseId: exerciseId(position),
    id: `10000000-0000-4000-8000-${position.toString().padStart(12, "0")}`,
    reflectionText: `En esta práctica ${position} pude observar mi experiencia con más calma y claridad.`,
    repetitionNumber: 1,
  };
}

function createMockState() {
  const completions = Array.from({ length: 7 }, (_, index) => createCompletion(index + 1));
  return {
    completionRecords: completions,
    snapshot: {
      completions,
      exercises,
      favoriteExerciseIds: [exerciseId(2), exerciseId(7)],
      progress: [{ exerciseId: exerciseId(8), progressPercentage: 35, updatedAt: new Date().toISOString() }],
    } satisfies JourneySnapshot,
  };
}

type MockJourneyMediaSources = { audio: string; video: string };

let mockMediaSources: MockJourneyMediaSources | null = null;

// Injected by the app so tests importing this module never resolve binary assets.
export function setMockJourneyMediaSources(sources: MockJourneyMediaSources) {
  mockMediaSources = sources;
}

// Rotates audio → video → text so every modality can be reviewed; text only without injected media.
// Shared with the mock journal so its entries report the modality the exercise actually used.
export function getMockExerciseModality(globalPosition: number): ExerciseContentModality {
  return mockMediaSources ? (["audio", "video", "text"] as const)[(globalPosition - 1) % 3] : "text";
}

function createDetail(exercise: JourneyExercise): JourneyExerciseDetail {
  const id = `20000000-0000-4000-8000-${exercise.globalPosition.toString().padStart(12, "0")}`;
  const modality = getMockExerciseModality(exercise.globalPosition);

  if (modality !== "text" && mockMediaSources) {
    return { ...exercise, content: { id, modality, source: mockMediaSources[modality], text: null } };
  }

  return {
    ...exercise,
    content: {
      id,
      modality: "text",
      source: null,
      text: "Cierra suavemente los ojos. Nota el ritmo natural de tu respiración y recorre tu cuerpo con atención. No necesitas cambiar nada: solo estar presente durante unos instantes.",
    },
  };
}

let mockState = createMockState();

export function getMockJourneyJournalState() {
  return {
    completions: mockState.completionRecords.map(completion => ({ ...completion })),
    exercises: mockState.snapshot.exercises.map(exercise => ({ ...exercise })),
    progress: mockState.snapshot.progress.map(progress => ({ ...progress })),
  };
}

export const mockJourneyRepository: JourneyRepository & { reset: () => void } = {
  async completeExercise(draft) {
    const snapshot = mockState.snapshot;
    const alreadyCompleted = snapshot.completions.some(completion => completion.exerciseId === draft.exerciseId);
    const repetitionNumber = snapshot.completions.filter(completion => completion.exerciseId === draft.exerciseId).length + 1;
    const completedAt = new Date().toISOString();
    const id = `30000000-0000-4000-8000-${snapshot.completions.length.toString().padStart(12, "0")}`;
    const completion: MockJournalCompletion = {
      advancesJourney: !alreadyCompleted,
      businessDate: getBusinessDateKey(completedAt) ?? completedAt.slice(0, 10),
      completedAt,
      durationSeconds: draft.durationSeconds,
      emotionalScore: draft.emotionalScore,
      exerciseId: draft.exerciseId,
      id,
      reflectionText: draft.reflectionText,
      repetitionNumber,
    };
    mockState = {
      completionRecords: [...mockState.completionRecords, completion],
      snapshot: {
        ...snapshot,
        completions: [...snapshot.completions, completion],
        progress: snapshot.progress.filter(progress => progress.exerciseId !== draft.exerciseId),
      },
    };
    return {
      advancesJourney: !alreadyCompleted,
      businessDate: completedAt.slice(0, 10),
      completedAt,
      emotionalScore: draft.emotionalScore,
      exerciseId: draft.exerciseId,
      id,
      repetitionNumber,
    };
  },
  async completeInitialExercise() {
    throw new Error("MOCK_INITIAL_EXERCISE_NOT_CONFIGURED");
  },
  async getExerciseDetail(id) {
    const exercise = mockState.snapshot.exercises.find(item => item.id === id);
    if (!exercise) {
      throw new Error("EXERCISE_NOT_AVAILABLE");
    }
    return createDetail(exercise);
  },
  async getSnapshot() {
    const { snapshot } = mockState;
    return {
      ...snapshot,
      completions: [...snapshot.completions],
      exercises: [...snapshot.exercises],
      favoriteExerciseIds: [...snapshot.favoriteExerciseIds],
      progress: [...snapshot.progress],
    };
  },
  reset() {
    mockState = createMockState();
  },
  async setExerciseFavorite(_userId, id, isFavorite) {
    const { snapshot } = mockState;
    const favorites = new Set(snapshot.favoriteExerciseIds);
    if (isFavorite) {
      favorites.add(id);
    } else {
      favorites.delete(id);
    }
    mockState = { ...mockState, snapshot: { ...snapshot, favoriteExerciseIds: [...favorites] } };
  },
};
