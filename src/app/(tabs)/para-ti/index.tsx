import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { SectionScreen } from "@/components/layout/SectionScreen";

type DestinationCardProps = { description: string; label: string; onPress: () => void };

function DestinationCard({ description, label, onPress }: DestinationCardProps) {
  return (
    <Pressable accessibilityRole="button" className="mt-4 min-h-20 w-full max-w-md justify-center rounded-xl border border-border bg-card px-5" onPress={onPress}>
      <Text className="text-lg font-semibold text-text">{label}</Text>
      <Text className="mt-1 text-sm text-text-secondary">{description}</Text>
    </Pressable>
  );
}

export default function ForYouRoute() {
  const router = useRouter();

  return (
    <SectionScreen title="Para ti">
      <View className="w-full items-center">
        <DestinationCard description="Consulta tus reflexiones y ejercicios completados." label="Bitácora" onPress={() => router.push("/(tabs)/para-ti/bitacora" as Href)} />
        <DestinationCard description="Contenido en preparación para una fase posterior." label="Guías" onPress={() => router.push("/(tabs)/para-ti/guias" as Href)} />
      </View>
    </SectionScreen>
  );
}
