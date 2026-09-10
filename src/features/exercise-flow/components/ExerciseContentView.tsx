import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseContentRenderer } from "@/features/exercise-flow/components/ExerciseContentRenderer";
import { ExerciseFlowBackButton } from "@/features/exercise-flow/components/ExerciseFlowBackButton";
import { ExerciseIdentityHeader } from "@/features/exercise-flow/components/ExerciseIdentityHeader";
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ExerciseIdentityHeader model={model} onPhotoBackground />

          <View style={styles.center}>
            <Text accessibilityRole="header" style={styles.title}>{model.content.title}</Text>
            <ExerciseContentRenderer content={model.content} onComplete={onContentComplete} />
          </View>

          <View style={styles.footer}>
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
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 24, paddingHorizontal: 18, paddingTop: 18, width: "92%" },
  footer: { paddingBottom: 8, paddingTop: 14, width: "100%" },
  hint: { color: colors.text, fontFamily: fonts.body, fontSize: 12, marginTop: 8, textAlign: "center" },
  screen: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 32, lineHeight: 39, marginBottom: 18, textAlign: "center" },
  wash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(253,248,236,0.12)" },
});
