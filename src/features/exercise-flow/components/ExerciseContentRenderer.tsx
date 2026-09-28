import { ExerciseAudioContent } from "@/features/exercise-flow/components/content/ExerciseAudioContent";
import { ExerciseTextContent } from "@/features/exercise-flow/components/content/ExerciseTextContent";
import { ExerciseVideoContent } from "@/features/exercise-flow/components/content/ExerciseVideoContent";
import type { ExerciseFlowContent } from "@/features/exercise-flow/exercise-flow.types";

export function ExerciseContentRenderer({ content, onComplete }: { content: ExerciseFlowContent; onComplete: () => void }) {
  switch (content.modality) {
    case "audio":
      return <ExerciseAudioContent onComplete={onComplete} source={content.source} title={content.title} />;
    case "video":
      return <ExerciseVideoContent onComplete={onComplete} source={content.source} title={content.title} />;
    case "text":
      return <ExerciseTextContent text={content.text} title={content.title} />;
  }
}
