import { useRef, useState } from "react";

import type { Mood } from "@/components/onboarding/MoodSelector";
import { ExerciseContentView } from "@/features/exercise-flow/components/ExerciseContentView";
import { ExerciseInstructionsView } from "@/features/exercise-flow/components/ExerciseInstructionsView";
import { ExerciseReflectionView } from "@/features/exercise-flow/components/ExerciseReflectionView";
import { clampReflection, countReflectionCharacters, getEmotionalScore, getExerciseFlowErrorMessage, REFLECTION_MAX_LENGTH } from "@/features/exercise-flow/exercise-flow.utils";
import type { ExerciseFlowAnswer, ExerciseFlowModel, ExerciseFlowStep, ExerciseFlowVariant } from "@/features/exercise-flow/exercise-flow.types";

export type { ExerciseFlowContent, ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

type Props = {
  model: ExerciseFlowModel;
  onComplete: (answer: ExerciseFlowAnswer) => Promise<void>;
  onExit: () => void;
  variant?: ExerciseFlowVariant;
};

export function ExerciseFlow({ model, onComplete, onExit, variant = "journey" }: Props) {
  const [step, setStep] = useState<ExerciseFlowStep>(variant === "onboarding" ? "reflection" : "instructions");
  const [contentCompleted, setContentCompleted] = useState(model.content.modality === "text");
  const [mood, setMood] = useState<Mood>();
  const [reflection, setReflection] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const navigationLockRef = useRef(false);
  const reflectionLength = countReflectionCharacters(reflection);
  const canSubmit = Boolean(mood) && reflection.trim().length > 0 && reflectionLength <= REFLECTION_MAX_LENGTH && !isSubmitting;

  function goBack() {
    if (step === "reflection") {
      if (variant === "onboarding") {
        onExit();
      } else {
        setStep("content");
      }
      return;
    }
    if (step === "content") {
      setStep("instructions");
      return;
    }
    onExit();
  }

  async function submit() {
    if (!mood || !canSubmit || submitLockRef.current || navigationLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await onComplete({ emotionalScore: getEmotionalScore(mood), reflectionText: reflection.trim() });
      navigationLockRef.current = true;
    } catch (error) {
      setSubmissionError(getExerciseFlowErrorMessage(error));
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (step === "instructions") {
    return <ExerciseInstructionsView model={model} onBack={goBack} onStart={() => setStep("content")} />;
  }

  if (step === "content") {
    return (
      <ExerciseContentView
        contentCompleted={contentCompleted}
        model={model}
        onBack={goBack}
        onContentComplete={() => setContentCompleted(true)}
        onContinue={() => setStep("reflection")}
      />
    );
  }

  return (
    <ExerciseReflectionView
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      model={model}
      mood={mood}
      onBack={goBack}
      onMoodChange={setMood}
      onReflectionChange={value => setReflection(clampReflection(value))}
      onSubmit={() => void submit()}
      reflection={reflection}
      reflectionLength={reflectionLength}
      submissionError={submissionError}
    />
  );
}
