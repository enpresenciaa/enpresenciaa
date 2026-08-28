import { useCallback, useState } from "react";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import { CaminoMap } from "@/features/journey/components/CaminoMap";
import { canOpenLevel, CURRENT_LEVEL_ID, journeyLevels } from "@/features/journey/mocks/journey.mock";
import type { JourneyPerspective, MapLevel } from "@/features/journey/types";

export function JourneyScreen() {
  const router = useRouter();
  const [perspective, setPerspective] = useState<JourneyPerspective>("journey");
  const [selectedLevel, setSelectedLevel] = useState<MapLevel>();

  function handlePressLevel(level: MapLevel) {
    if (!canOpenLevel(level)) {
      return;
    }
    setSelectedLevel(level);
    setPerspective("level-focus");
  }

  const handleLevelFocusComplete = useCallback(() => {
    if (!selectedLevel) {
      return;
    }
    router.push({ pathname: "/camino/nivel/[levelId]", params: { levelId: selectedLevel.id } } as unknown as Href);
    setPerspective("journey");
    setSelectedLevel(undefined);
  }, [router, selectedLevel]);

  return (
    <View style={styles.screen}>
      <CaminoMap
        currentLevelId={CURRENT_LEVEL_ID}
        levels={journeyLevels}
        onLevelFocusComplete={handleLevelFocusComplete}
        onPressLevel={handlePressLevel}
        perspective={perspective}
        selectedLevelId={selectedLevel?.id}
      />
      <SafeAreaView edges={["top", "left", "right"]} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View pointerEvents="none" style={styles.headerRow}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Tu camino</Text>
            <Text style={styles.subtitle}>Nivel 4 · Reconexión</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignSelf: "center", backgroundColor: "rgba(253,248,236,0.92)", borderColor: "rgba(54,75,38,0.28)", borderRadius: 18, borderWidth: 1, marginTop: 8, paddingHorizontal: 22, paddingVertical: 8 },
  headerRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "center", paddingHorizontal: 14 },
  screen: { backgroundColor: colors.background, flex: 1 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, textAlign: "center" },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 23, lineHeight: 27, textAlign: "center" },
});
