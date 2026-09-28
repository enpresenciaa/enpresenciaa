import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseContentRenderer } from "@/features/exercise-flow/components/ExerciseContentRenderer";
import { ExerciseDoorHeader } from "@/features/exercise-flow/components/ExerciseDoorHeader";
import { ExerciseFlowBackButton } from "@/features/exercise-flow/components/ExerciseFlowBackButton";
import type { ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

const background = require("../../../../assets/images/Imág. VIDEO INTRO.jpg");

type Props = {
  contentCompleted: boolean;
  model: ExerciseFlowModel;
  onBack: () => void;
  onContentComplete: () => void;
  onContinue: () => void;
};

export function ExerciseContentView({ contentCompleted, model, onBack, onContentComplete, onContinue }: Props) {
  return (
    <OnboardingBackground source={background}>
      <View style={styles.wash} />
      <SafeAreaView style={styles.screen}>
        <ExerciseFlowBackButton onPress={onBack} />
        <ExerciseDoorHeader model={model} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.center}>
            <ExerciseContentRenderer content={model.content} onComplete={onContentComplete} />
          </View>

          <View style={styles.footer}>
            <View style={styles.divider} />
            <AppButton disabled={!contentCompleted} onPress={onContinue}>Continuar</AppButton>
            {!contentCompleted ? <Text style={styles.hint}>Completa el contenido para continuar.</Text> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 24, paddingHorizontal: 18, width: "92%" },
  divider: { backgroundColor: "rgba(39,53,31,0.45)", height: 1, marginBottom: 16, width: "100%" },
  footer: { paddingBottom: 8, paddingTop: 14, width: "100%" },
  hint: { color: colors.text, fontFamily: fonts.body, fontSize: 12, marginTop: 8, textAlign: "center" },
  screen: { flex: 1 },
  wash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(253,248,236,0.12)" },
});
