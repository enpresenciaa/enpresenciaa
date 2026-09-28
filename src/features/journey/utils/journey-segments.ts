import type { JourneyExerciseState } from "@/features/journey/domain/journey.types";

export const JOURNEY_EXERCISES_PER_SEGMENT = 5;
export const JOURNEY_BACKGROUND_VARIANT_COUNT = 4;

export type JourneySegmentExercise = {
  exercise: JourneyExerciseState;
  slotIndex: number;
};

export type JourneySegment = {
  backgroundVariant: number;
  exercises: JourneySegmentExercise[];
  key: string;
};

export function createJourneySegments(exercises: JourneyExerciseState[]): JourneySegment[] {
  const seenExerciseIds = new Set<string>();
  const orderedExercises = [...exercises]
    .sort((left, right) => left.globalPosition - right.globalPosition)
    .filter((exercise) => {
      if (seenExerciseIds.has(exercise.id)) {
        return false;
      }

      seenExerciseIds.add(exercise.id);
      return true;
    });

  const segments: JourneySegment[] = [];

  for (let start = 0; start < orderedExercises.length; start += JOURNEY_EXERCISES_PER_SEGMENT) {
    const segmentExercises = orderedExercises.slice(start, start + JOURNEY_EXERCISES_PER_SEGMENT);
    segments.push({
      backgroundVariant: segments.length % JOURNEY_BACKGROUND_VARIANT_COUNT,
      exercises: segmentExercises.map((exercise, slotIndex) => ({ exercise, slotIndex })),
      key: `journey-segment-${segmentExercises[0].id}`,
    });
  }

  return segments;
}
