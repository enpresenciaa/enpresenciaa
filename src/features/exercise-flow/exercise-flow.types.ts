import type { VideoSource } from "expo-video";

export type ExerciseFlowContent = { modality: "audio"; source: VideoSource; title: string } |
  { modality: "text"; text: string; title: string } |
  { modality: "video"; source: VideoSource; title: string };

export type ExerciseFlowModel = {
  content: ExerciseFlowContent;
  doorLabel: string;
  exerciseLabel: string;
  guidePhrase: string;
  instructions: string;
  levelLabel: string;
  title: string;
};

export type ExerciseFlowAnswer = {
  emotionalScore: number;
  reflectionText: string;
};

export type ExerciseFlowStep = "content" | "instructions" | "reflection";
export type ExerciseFlowVariant = "journey" | "onboarding";
