import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseFlowBackButton } from "@/features/exercise-flow/components/ExerciseFlowBackButton";
import { ExerciseIdentityHeader } from "@/features/exercise-flow/components/ExerciseIdentityHeader";
import type { ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

type Props = {
  model: ExerciseFlowModel;
  onBack: () => void;
  onStart: () => void;
};

export function ExerciseInstructionsView({ model, onBack, onStart }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <ExerciseFlowBackButton onPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ExerciseIdentityHeader model={model} />

        <View style={styles.body}>
          <Text style={styles.exercise}>{model.exerciseLabel}</Text>
          <Text accessibilityRole="header" style={styles.title}>{model.title}</Text>

          <Text style={styles.guideHeading}>Frase Guía</Text>
          <Text style={styles.guide}>{model.guidePhrase}</Text>

          <Text accessibilityRole="header" style={styles.instructionsHeading}>Instrucciones</Text>
          <Text style={styles.instructions}>{model.instructions}</Text>
        </View>

        <View style={styles.footer}><AppButton onPress={onStart}>Comenzar</AppButton></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: "stretch", flexGrow: 1, justifyContent: "center", paddingHorizontal: 4, paddingVertical: 28 },
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 24, paddingHorizontal: 18, paddingTop: 18, width: "92%" },
  exercise: { color: colors.text, fontFamily: fonts.title, fontSize: 20, lineHeight: 26, marginTop: 12 },
  footer: { paddingBottom: 8, paddingTop: 12, width: "100%" },
  guide: { alignSelf: "center", color: colors.textMuted, fontFamily: fonts.body, fontSize: 18, fontStyle: "italic", lineHeight: 27, marginTop: 16, maxWidth: 460, textAlign: "center" },
  guideHeading: { alignSelf: "center", color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 17, fontStyle: "italic", marginTop: 28 },
  instructions: { alignSelf: "center", color: colors.textMuted, fontFamily: fonts.body, fontSize: 16, fontStyle: "italic", lineHeight: 25, marginTop: 14, maxWidth: 500, textAlign: "center" },
  instructionsHeading: { alignSelf: "center", color: colors.text, fontFamily: fonts.title, fontSize: 31, lineHeight: 38, marginTop: 34 },
  screen: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 31, lineHeight: 38, marginTop: 2 },
});
