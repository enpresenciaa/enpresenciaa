import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { MoodSelector } from "@/components/onboarding/MoodSelector";
import type { Mood } from "@/components/onboarding/MoodSelector";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseFlowBackButton } from "@/features/exercise-flow/components/ExerciseFlowBackButton";
import { ExerciseIdentityHeader } from "@/features/exercise-flow/components/ExerciseIdentityHeader";
import { REFLECTION_MAX_LENGTH } from "@/features/exercise-flow/exercise-flow.utils";
import type { ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

const background = require("../../../../assets/images/Imág. VIDEO INTRO.jpg");

type Props = {
  canSubmit: boolean;
  isSubmitting: boolean;
  model: ExerciseFlowModel;
  mood: Mood | undefined;
  onBack: () => void;
  onMoodChange: (mood: Mood) => void;
  onReflectionChange: (value: string) => void;
  onSubmit: () => void;
  reflection: string;
  reflectionLength: number;
  submissionError: string | null;
};

export function ExerciseReflectionView({ canSubmit, isSubmitting, model, mood, onBack, onMoodChange, onReflectionChange, onSubmit, reflection, reflectionLength, submissionError }: Props) {
  return (
    <OnboardingBackground source={background}>
      <View style={styles.wash} />
      <SafeAreaView style={styles.screen}>
        <ExerciseFlowBackButton onPress={onBack} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <ExerciseIdentityHeader model={model} onPhotoBackground />

            <View style={styles.center}>
              <Text accessibilityRole="header" style={styles.title}>Reflexión</Text>
              <View style={styles.formCard}>
                <Text style={styles.question}>1. ¿Cómo te sentiste después de realizar el ejercicio?</Text>
                <MoodSelector error={!mood && submissionError ? "Selecciona una emoción" : undefined} onChange={onMoodChange} value={mood} />

                <Text style={[styles.question, styles.secondQuestion]}>2. ¿Hay alguna reflexión o experiencia que quisieras registrar del ejercicio?</Text>
                <TextInput
                  accessibilityLabel="Reflexión o experiencia del ejercicio"
                  editable={!isSubmitting}
                  multiline
                  onChangeText={onReflectionChange}
                  placeholder="Escribe aquí"
                  placeholderTextColor="#667063"
                  style={styles.input}
                  textAlignVertical="top"
                  value={reflection}
                />
                <Text accessibilityLabel={`${reflectionLength} de ${REFLECTION_MAX_LENGTH} caracteres`} style={styles.counter}>{reflectionLength}/{REFLECTION_MAX_LENGTH}</Text>
                {submissionError ? <Text accessibilityRole="alert" style={styles.error}>{submissionError}</Text> : null}
              </View>
            </View>

            <View style={styles.footer}><AppButton disabled={!canSubmit} loading={isSubmitting} onPress={onSubmit}>¡Listo!</AppButton></View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", flexGrow: 1, justifyContent: "center", paddingVertical: 20 },
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 22, paddingHorizontal: 18, paddingTop: 18, width: "92%" },
  counter: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 5, textAlign: "right" },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 10, textAlign: "center" },
  footer: { paddingBottom: 8, paddingTop: 12, width: "100%" },
  formCard: { backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 18, elevation: 5, maxWidth: 520, paddingHorizontal: 18, paddingVertical: 20, shadowColor: "#000000", shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.15, shadowRadius: 9, width: "100%" },
  input: { borderBottomColor: "#738468", borderBottomWidth: 1.5, color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 8, minHeight: 72, paddingHorizontal: 2, paddingVertical: 8 },
  keyboardView: { flex: 1 },
  question: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20, textAlign: "left" },
  screen: { flex: 1 },
  secondQuestion: { marginTop: 18 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 29, lineHeight: 35, marginBottom: 14, textAlign: "center" },
  wash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(253,248,236,0.10)" },
});
