import { z } from "zod";

import type { JourneyCompletionDraft } from "@/features/journey/domain/journey.types";
import { secureStorage } from "@/lib/auth-storage";

const draftSchema = z.object({
  durationSeconds: z.number().int().nonnegative().nullable(),
  emotionalScore: z.number().int().min(1).max(5).nullable(),
  exerciseId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  reflectionText: z.string().trim().min(1).max(5000).nullable(),
  updatedAt: z.string().datetime(),
  userId: z.string().uuid(),
});
const draftIndexSchema = z.array(z.string().uuid());

function getDraftKey(userId: string, exerciseId: string): string {
  return `journey.completion-draft.${userId}.${exerciseId}`;
}

function getDraftIndexKey(userId: string): string {
  return `journey.completion-drafts.${userId}.index`;
}

async function getDraftExerciseIds(userId: string): Promise<string[]> {
  const key = getDraftIndexKey(userId);
  const stored = await secureStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    const result = draftIndexSchema.safeParse(JSON.parse(stored));

    if (result.success) {
      return result.data;
    }
  } catch {
    // Corrupt indexes are discarded; individual drafts remain inaccessible by another user.
  }

  await secureStorage.removeItem(key);
  return [];
}

async function setDraftExerciseIds(userId: string, exerciseIds: string[]): Promise<void> {
  const uniqueExerciseIds = [...new Set(exerciseIds)];

  if (uniqueExerciseIds.length === 0) {
    await secureStorage.removeItem(getDraftIndexKey(userId));
    return;
  }

  await secureStorage.setItem(getDraftIndexKey(userId), JSON.stringify(uniqueExerciseIds));
}

export async function getJourneyCompletionDraft(userId: string, exerciseId: string): Promise<JourneyCompletionDraft | null> {
  const key = getDraftKey(userId, exerciseId);
  const stored = await secureStorage.getItem(key);

  if (!stored) {
    return null;
  }

  try {
    const result = draftSchema.safeParse(JSON.parse(stored));

    if (result.success && result.data.userId === userId && result.data.exerciseId === exerciseId) {
      return result.data;
    }
  } catch {
    // Invalid or partially written sensitive data must not remain on the device.
  }

  await secureStorage.removeItem(key);
  return null;
}

export async function createJourneyCompletionDraft(userId: string, exerciseId: string): Promise<JourneyCompletionDraft> {
  const existing = await getJourneyCompletionDraft(userId, exerciseId);

  if (existing) {
    return existing;
  }

  const draft: JourneyCompletionDraft = {
    durationSeconds: null,
    emotionalScore: null,
    exerciseId,
    idempotencyKey: crypto.randomUUID(),
    reflectionText: null,
    updatedAt: new Date().toISOString(),
    userId,
  };

  await setJourneyCompletionDraft(draft);
  return draft;
}

export async function setJourneyCompletionDraft(draft: JourneyCompletionDraft): Promise<void> {
  const validated = draftSchema.parse({ ...draft, updatedAt: new Date().toISOString() });
  await secureStorage.setItem(
    getDraftKey(validated.userId, validated.exerciseId),
    JSON.stringify(validated),
  );
  const exerciseIds = await getDraftExerciseIds(validated.userId);
  await setDraftExerciseIds(validated.userId, [...exerciseIds, validated.exerciseId]);
}

export async function removeJourneyCompletionDraft(userId: string, exerciseId: string): Promise<void> {
  await secureStorage.removeItem(getDraftKey(userId, exerciseId));
  const exerciseIds = await getDraftExerciseIds(userId);
  await setDraftExerciseIds(userId, exerciseIds.filter(id => id !== exerciseId));
}

export async function clearJourneyCompletionDrafts(userId: string): Promise<void> {
  const exerciseIds = await getDraftExerciseIds(userId);
  await Promise.all(exerciseIds.map(exerciseId =>
    secureStorage.removeItem(getDraftKey(userId, exerciseId)),
  ));
  await secureStorage.removeItem(getDraftIndexKey(userId));
}
