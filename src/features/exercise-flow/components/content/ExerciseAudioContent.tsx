import type { VideoSource } from "expo-video";

import { CustomAudioPlayer } from "@/components/video/CustomAudioPlayer";
import { ExerciseContentHeading } from "@/features/exercise-flow/components/content/ExerciseContentHeading";

type Props = {
  onComplete: () => void;
  source: VideoSource;
  title: string;
};

export function ExerciseAudioContent({ onComplete, source, title }: Props) {
  return (
    <>
      <ExerciseContentHeading label="Audio" title={title} />
      <CustomAudioPlayer onComplete={onComplete} source={source} />
    </>
  );
}
