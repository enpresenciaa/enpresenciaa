import { afterEach, describe, expect, test } from "bun:test";

import { getMockJournalMonth, getMockJournalPage } from "./mock-journal.service.ts";
import { getMockJourneyJournalState, mockJourneyRepository, setMockJourneyMediaSources } from "../../journey/services/mock-journey.repository.ts";

const userId = "40000000-0000-4000-8000-000000000001";

afterEach(() => mockJourneyRepository.reset());

describe("developer journal mock", () => {
  test("exposes completed activity and one in-progress exercise", async () => {
    const page = await getMockJournalPage({ filter: "all", limit: 20, offset: 0, search: "", userId });

    expect(page.entries).toHaveLength(8);
    expect(page.entries.filter(entry => entry.status === "completed")).toHaveLength(7);
    expect(page.entries.filter(entry => entry.status === "in_progress")).toHaveLength(1);
    expect(page.nextOffset).toBeNull();
  });

  test("applies search without changing the shared mock state", async () => {
    const page = await getMockJournalPage({ filter: "all", limit: 20, offset: 0, search: "Respirar 5", userId });

    expect(page.entries.map(entry => entry.exerciseName)).toEqual(["Respirar 5"]);
    expect(getMockJourneyJournalState().completions).toHaveLength(7);
  });

  test("returns calendar details for the requested business month", async () => {
    const state = getMockJourneyJournalState();
    const month = state.completions.at(-1).businessDate.slice(0, 7);
    const entries = await getMockJournalMonth({ month, search: "", userId });

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every(entry => entry.businessDate.startsWith(`${month}-`))).toBe(true);
    expect(entries.every(entry => entry.reflectionText && entry.emotionalScore)).toBe(true);
  });

  test("a mock exercise completion replaces progress and appears in the journal", async () => {
    const exerciseId = "00000000-0000-4000-8000-000000000008";
    await mockJourneyRepository.completeExercise({
      durationSeconds: 420,
      emotionalScore: 5,
      exerciseId,
      idempotencyKey: "50000000-0000-4000-8000-000000000001",
      reflectionText: "Pude escucharme con claridad.",
      updatedAt: new Date().toISOString(),
      userId,
    });
    const page = await getMockJournalPage({ filter: "all", limit: 20, offset: 0, search: "Aceptar 8", userId });

    expect(page.entries).toHaveLength(1);
    expect(page.entries[0]).toMatchObject({ emotionalScore: 5, progressPercentage: 100, status: "completed" });
    expect(getMockJourneyJournalState().progress).toHaveLength(0);
  });

  // Runs last: media injection is module state with no reset.
  test("entries carry their exercise and the modality that exercise actually uses", async () => {
    setMockJourneyMediaSources({ audio: "mock://audio", video: "mock://video" });
    const positions = new Map(getMockJourneyJournalState().exercises.map(exercise => [exercise.id, exercise.globalPosition]));
    const page = await getMockJournalPage({ filter: "all", limit: 20, offset: 0, search: "", userId });

    expect(page.entries.length).toBeGreaterThan(0);
    for (const entry of page.entries) {
      const position = positions.get(entry.exerciseId);
      expect(position).toBeDefined();
      expect(entry.contentType).toBe(["audio", "video", "text"][(position - 1) % 3]);
      const detail = await mockJourneyRepository.getExerciseDetail(entry.exerciseId);
      expect(detail.content.modality).toBe(entry.contentType);
    }
  });
});
