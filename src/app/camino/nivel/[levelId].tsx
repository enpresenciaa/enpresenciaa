import { useLocalSearchParams } from "expo-router";

import { LevelScreen } from "@/features/journey/screens/LevelScreen";

export default function LevelRoute() {
  const { levelId } = useLocalSearchParams<{ levelId: string | string[] }>();
  const normalizedLevelId = Array.isArray(levelId) ? levelId[0] : levelId;

  return <LevelScreen levelId={normalizedLevelId ?? ""} />;
}
