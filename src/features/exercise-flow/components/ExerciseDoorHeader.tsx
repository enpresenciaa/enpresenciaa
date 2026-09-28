import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

const logo = require("../../../../assets/logo-calendar.png");

type Props = {
  model: Pick<ExerciseFlowModel, "doorLabel" | "exerciseLabel">;
};

export function ExerciseDoorHeader({ model }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.door}>{model.doorLabel}</Text>
        <Text style={styles.exercise}>{model.exerciseLabel}</Text>
      </View>
      <Image accessible={false} contentFit="contain" source={logo} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { flex: 1 },
  door: { color: colors.text, fontFamily: fonts.titleBold, fontSize: 32, lineHeight: 40 },
  exercise: { color: colors.text, fontFamily: fonts.title, fontSize: 28, lineHeight: 34, marginTop: 2 },
  // Leaves room for the absolute back button on the right.
  header: { alignItems: "flex-start", flexDirection: "row", paddingHorizontal: 22, paddingRight: 74, paddingTop: 16 },
  logo: { height: 34, marginTop: 2, width: 44 },
});
