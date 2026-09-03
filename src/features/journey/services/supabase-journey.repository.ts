import type { JourneyCompletion, JourneyCompletionDraft, JourneyCompletionReceipt, JourneyExercise, JourneyProgress, JourneySnapshot, PublicationStatus } from "@/features/journey/domain/journey.types";
import type { JourneyRepository } from "@/features/journey/repositories/journey.repository";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type ExerciseRow = Database["public"]["Tables"]["exercises"]["Row"];
type LevelRow = Database["public"]["Tables"]["levels"]["Row"];

function isPublicationStatus(value: string): value is PublicationStatus {
  return value === "archived" || value === "draft" || value === "published";
}

function mapExercise(row: ExerciseRow, level: LevelRow, globalPosition: number): JourneyExercise | null {
  if (row.position === null || !isPublicationStatus(row.publication_status)) {
    return null;
  }

  return {
    description: row.description,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    globalPosition,
    id: row.id,
    levelId: row.level_id,
    levelNumber: level.number,
    positionInLevel: row.position,
    publicationStatus: row.publication_status,
    title: row.name,
  };
}

export const supabaseJourneyRepository: JourneyRepository = {
  async completeExercise(draft: JourneyCompletionDraft): Promise<JourneyCompletionReceipt> {
    const { data, error } = await supabase.rpc("complete_exercise", {
      p_duration_seconds: draft.durationSeconds ?? undefined,
      p_emotional_score: draft.emotionalScore ?? undefined,
      p_exercise_id: draft.exerciseId,
      p_idempotency_key: draft.idempotencyKey,
      p_reflection_text: draft.reflectionText ?? undefined,
    });

    if (error) {
      throw error;
    }

    return {
      advancesJourney: data.advances_journey,
      businessDate: data.business_date,
      completedAt: data.completed_at,
      emotionalScore: data.emotional_score,
      exerciseId: data.exercise_id,
      id: data.id,
      repetitionNumber: data.repetition_number,
    };
  },

  async getSnapshot(): Promise<JourneySnapshot> {
    const [levelsResult, exercisesResult, completionsResult, progressResult] = await Promise.all([
      supabase.from("levels").select("*").eq("publication_status", "published").order("number"),
      supabase.from("exercises").select("*").eq("publication_status", "published").not("position", "is", null).order("position"),
      supabase.from("exercise_completions").select("id,exercise_id,completed_at").order("completed_at"),
      supabase.from("exercise_progress").select("exercise_id,progress_percentage,updated_at").order("updated_at"),
    ]);

    const error = levelsResult.error ?? exercisesResult.error ?? completionsResult.error ?? progressResult.error;

    if (error) {
      throw error;
    }

    const levelsById = new Map((levelsResult.data ?? []).map(level => [level.id, level]));
    const orderedRows = (exercisesResult.data ?? [])
      .flatMap(row => {
        const level = levelsById.get(row.level_id);
        return level ? [{ level, row }] : [];
      })
      .sort((left, right) => left.level.number - right.level.number || (left.row.position ?? 0) - (right.row.position ?? 0));
    const exercises = orderedRows.flatMap(({ level, row }, index) => {
      const exercise = mapExercise(row, level, index + 1);
      return exercise ? [exercise] : [];
    });
    const completions: JourneyCompletion[] = (completionsResult.data ?? []).map(row => ({
      completedAt: row.completed_at,
      exerciseId: row.exercise_id,
      id: row.id,
    }));
    const progress: JourneyProgress[] = (progressResult.data ?? []).map(row => ({
      exerciseId: row.exercise_id,
      progressPercentage: row.progress_percentage,
      updatedAt: row.updated_at,
    }));

    return { completions, exercises, progress };
  },
};
