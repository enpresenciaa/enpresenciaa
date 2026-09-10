import { describe, expect, test } from "bun:test";

import { clampReflection, countReflectionCharacters, getEmotionalScore } from "./exercise-flow.utils.ts";

describe("exercise flow validation", () => {
  test("counts accented characters and emoji like PostgreSQL char_length", () => {
    expect(countReflectionCharacters("Respiré 🌿")).toBe(9);
  });

  test("clamps reflection at 150 Unicode code points", () => {
    const value = `${"á".repeat(149)}🌿extra`;
    const result = clampReflection(value);
    expect(countReflectionCharacters(result)).toBe(150);
    expect(result.endsWith("🌿")).toBe(true);
  });

  test("maps the five moods to the persisted 1-5 scale", () => {
    expect(getEmotionalScore("very-sad")).toBe(1);
    expect(getEmotionalScore("neutral")).toBe(3);
    expect(getEmotionalScore("very-happy")).toBe(5);
  });
});
