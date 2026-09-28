import { describe, expect, test } from "bun:test";

import { createJourneySegments, JOURNEY_EXERCISES_PER_SEGMENT } from "./journey-segments.ts";

function exercise(id, globalPosition) {
  return { globalPosition, id };
}

describe("journey visual segmentation", () => {
  test("an empty catalog creates no visual content", () => {
    expect(createJourneySegments([])).toEqual([]);
  });

  test("a partial segment keeps every exercise once in global order", () => {
    const segments = createJourneySegments([
      exercise("exercise-3", 3),
      exercise("exercise-1", 1),
      exercise("exercise-2", 2),
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0].exercises.map(item => item.exercise.id)).toEqual([
      "exercise-1",
      "exercise-2",
      "exercise-3",
    ]);
    expect(segments[0].exercises.map(item => item.slotIndex)).toEqual([0, 1, 2]);
  });

  test("multiple segments preserve order, stable identities and deterministic backgrounds", () => {
    const catalog = Array.from({ length: 13 }, (_, index) => exercise(`exercise-${index + 1}`, index + 1));
    const segments = createJourneySegments(catalog);
    const flattenedIds = segments.flatMap(segment => segment.exercises.map(item => item.exercise.id));

    expect(segments).toHaveLength(Math.ceil(catalog.length / JOURNEY_EXERCISES_PER_SEGMENT));
    expect(segments.map(segment => segment.backgroundVariant)).toEqual([0, 1, 2]);
    expect(flattenedIds).toEqual(catalog.map(item => item.id));
    expect(new Set(flattenedIds).size).toBe(catalog.length);
    expect(new Set(segments.map(segment => segment.key)).size).toBe(segments.length);
  });

  test("a duplicated stable ID is rendered only once", () => {
    const segments = createJourneySegments([
      exercise("exercise-1", 1),
      exercise("exercise-1", 1),
      exercise("exercise-2", 2),
    ]);

    expect(segments.flatMap(segment => segment.exercises.map(item => item.exercise.id))).toEqual([
      "exercise-1",
      "exercise-2",
    ]);
  });

  test("the transition from exercise 28 to 29 does not create a level boundary", () => {
    const catalog = Array.from({ length: 31 }, (_, index) => exercise(`exercise-${index + 1}`, index + 1));
    const segments = createJourneySegments(catalog);
    const exercise28 = segments.flatMap(segment => segment.exercises).find(item => item.exercise.globalPosition === 28);
    const exercise29 = segments.flatMap(segment => segment.exercises).find(item => item.exercise.globalPosition === 29);

    expect(exercise28?.slotIndex).toBe(2);
    expect(exercise29?.slotIndex).toBe(3);
  });
});
