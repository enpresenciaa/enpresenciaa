import type { ExerciseContentModality, InitialExerciseCompletion, JourneyCompletion, JourneyCompletionDraft, JourneyCompletionReceipt, JourneyExercise, JourneyExerciseDetail, JourneyProgress, JourneySnapshot, PublicationStatus } from "@/features/journey/domain/journey.types";
import type { JourneyRepository } from "@/features/journey/repositories/journey.repository";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type ExerciseRow = Database["public"]["Tables"]["exercises"]["Row"];
type LevelRow = Database["public"]["Tables"]["levels"]["Row"];

function isPublicationStatus(value: string): value is PublicationStatus {
  return value === "archived" || value === "draft" || value === "published";
}

function isContentModality(value: string | null): value is ExerciseContentModality {
  return value === "audio" || value === "text" || value === "video";
}

function mapExercise(row: ExerciseRow, level: LevelRow, globalPosition: number): JourneyExercise | null {
  if (row.position === null || !isPublicationStatus(row.publication_status)) {
    return null;
  }

  return {
    description: row.description,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    globalPosition,
    guidePhrase: row.guide_phrase,
    id: row.id,
    instructions: row.instructions,
    levelId: row.level_id,
    levelName: level.name,
    levelNumber: level.number,
    positionInLevel: row.position,
    publicationStatus: row.publication_status,
    title: row.name,
  };
}

export const supabaseJourneyRepository: JourneyRepository = {
  async completeInitialExercise(input): Promise<InitialExerciseCompletion> {
    const { data, error } = await supabase.rpc("complete_initial_exercise", {
      p_emotional_score: input.emotionalScore,
      p_idempotency_key: input.idempotencyKey,
      p_reflection_text: input.reflectionText,
    });

    if (error) {
      throw error;
    }

    const verification = await supabase
      .from("initial_exercise_completions")
      .select("id,user_id,emotional_score,reflection_text,completed_at")
      .eq("id", data.id)
      .single();

    const verifiedReflectionLength = verification.data ? Array.from(verification.data.reflection_text.trim()).length : 0;
    if (verification.error || !verification.data || verifiedReflectionLength < 1 || verifiedReflectionLength > 150) {
      throw verification.error ?? new Error("INITIAL_COMPLETION_VERIFICATION_FAILED");
    }

    return {
      completedAt: verification.data.completed_at,
      emotionalScore: verification.data.emotional_score,
      id: verification.data.id,
      reflectionText: verification.data.reflection_text,
      userId: verification.data.user_id,
    };
  },

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
    const [levelsResult, exercisesResult, completionsResult, progressResult, favoritesResult] = await Promise.all([
      supabase.from("levels").select("*").eq("publication_status", "published").order("number"),
      supabase.from("exercises").select("*").eq("publication_status", "published").not("position", "is", null).order("position"),
      supabase.from("exercise_completions").select("id,exercise_id,completed_at,advances_journey").order("completed_at"),
      supabase.from("exercise_progress").select("exercise_id,progress_percentage,updated_at").order("updated_at"),
      supabase.from("user_favorites").select("exercise_id").order("created_at"),
    ]);

    const error = levelsResult.error ?? exercisesResult.error ?? completionsResult.error ?? progressResult.error ?? favoritesResult.error;

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
      advancesJourney: row.advances_journey,
      completedAt: row.completed_at,
      exerciseId: row.exercise_id,
      id: row.id,
    }));
    const progress: JourneyProgress[] = (progressResult.data ?? []).map(row => ({
      exerciseId: row.exercise_id,
      progressPercentage: row.progress_percentage,
      updatedAt: row.updated_at,
    }));

    const favoriteExerciseIds = (favoritesResult.data ?? []).map(row => row.exercise_id);

    return { completions, exercises, favoriteExerciseIds, progress };
  },

  async getExerciseDetail(exerciseId: string): Promise<JourneyExerciseDetail> {
    const [exerciseResult, contentsResult] = await Promise.all([
      supabase.from("exercises").select("*").eq("id", exerciseId).eq("publication_status", "published").maybeSingle(),
      supabase.from("exercise_contents").select("*").eq("exercise_id", exerciseId).eq("publication_status", "published").eq("locale", "es-MX"),
    ]);

    if (exerciseResult.error ?? contentsResult.error) {
      throw exerciseResult.error ?? contentsResult.error;
    }

    const row = exerciseResult.data;
    if (!row || row.position === null) {
      throw new Error("EXERCISE_NOT_AVAILABLE");
    }

    if (!isContentModality(row.content_type)) {
      throw new Error("EXERCISE_MODALITY_NOT_CONFIGURED");
    }

    const matchingContents = (contentsResult.data ?? []).filter(content => content.modality === row.content_type);
    if (matchingContents.length !== 1) {
      throw new Error(matchingContents.length === 0 ? "EXERCISE_CONTENT_MISSING" : "EXERCISE_CONTENT_AMBIGUOUS");
    }

    const levelResult = await supabase.from("levels").select("*").eq("id", row.level_id).eq("publication_status", "published").maybeSingle();
    if (levelResult.error) {
      throw levelResult.error;
    }

    if (!levelResult.data) {
      throw new Error("EXERCISE_LEVEL_NOT_AVAILABLE");
    }

    const exercise = mapExercise(row, levelResult.data, 0);
    if (!exercise || !exercise.guidePhrase || !exercise.instructions) {
      throw new Error("EXERCISE_INSTRUCTIONS_MISSING");
    }

    const content = matchingContents[0];
    let source: string | null = null;

    if (content.modality === "audio" || content.modality === "video") {
      if (!content.storage_path) {
        throw new Error("EXERCISE_MEDIA_MISSING");
      }

      const signedUrl = await supabase.storage.from("exercise-content").createSignedUrl(content.storage_path, 3600);
      if (signedUrl.error) {
        throw signedUrl.error;
      }
      source = signedUrl.data.signedUrl;
    }

    return {
      ...exercise,
      content: {
        id: content.id,
        modality: row.content_type,
        source,
        text: content.text_content,
      },
    };
  },

  async setExerciseFavorite(userId: string, exerciseId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      const result = await supabase.from("user_favorites").upsert(
        { exercise_id: exerciseId, user_id: userId },
        { ignoreDuplicates: true, onConflict: "user_id,exercise_id" },
      );

      if (result.error) {
        throw result.error;
      }

      return;
    }

    const result = await supabase.from("user_favorites").delete().eq("user_id", userId).eq("exercise_id", exerciseId);

    if (result.error) {
      throw result.error;
    }
  },
};
