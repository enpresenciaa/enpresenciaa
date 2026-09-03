import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

import { SectionScreen } from "@/components/layout/SectionScreen";

export default function StartRoute() {
  const router = useRouter();

  return (
    <SectionScreen title="Empezar">
      <Pressable accessibilityRole="button" className="mt-6 min-h-12 justify-center rounded-full bg-primary px-8" onPress={() => router.push("/(tabs)/empezar/camino" as Href)}>
        <Text className="text-base font-semibold text-white">Abrir mi camino</Text>
      </Pressable>
    </SectionScreen>
  );
}
