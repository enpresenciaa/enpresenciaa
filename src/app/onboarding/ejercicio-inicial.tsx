import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { BackButton } from "@/components/onboarding/BackButton";
import { MoodSelector } from "@/components/onboarding/MoodSelector";
import type { Mood } from "@/components/onboarding/MoodSelector";
import { colors, fonts } from "@/config/onboarding-theme";

type FormValues = { mood?: Mood };

export default function InitialExerciseRoute() {
  const router = useRouter();
  const player = useVideoPlayer(require("@/assets/videos/video_introduccion.mp4"), videoPlayer => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
  });
  const { control, formState: { errors, isValid }, handleSubmit } = useForm<FormValues>({
    defaultValues: { mood: undefined },
    mode: "onChange",
  });

  const onSubmit = handleSubmit(() => router.push("/onboarding/poder-del-cambio"));

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>Ejercicio 1</Text>
          <Text style={styles.subtitle}>¿Quién soy hoy?</Text>
        </View>
        <View style={styles.centerGroup}>
          <View style={styles.videoFrame}>
            <VideoView
              accessibilityLabel="Video del ejercicio 1"
              contentFit="cover"
              nativeControls
              player={player}
              style={styles.video}
            />
          </View>
          <Text accessibilityRole="header" style={styles.question}>¿Qué tan consiente estás de tus emociones?</Text>
          <Controller
            control={control}
            name="mood"
            rules={{ required: "Selecciona cómo te sientes" }}
            render={({ field: { onChange, value } }) => <MoodSelector error={errors.mood?.message} onChange={onChange} value={value} />}
          />
        </View>
        <AppButton disabled={!isValid} onPress={onSubmit}>Continuar</AppButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerGroup: { flex: 1, justifyContent: "center" },
  content: { alignSelf: "center", flex: 1, maxWidth: 560, padding: 24, paddingBottom: 28, width: "100%" },
  header: { marginTop: 54 },
  question: { color: colors.text, fontFamily: fonts.title, fontSize: 30, lineHeight: 42, marginBottom: 32, textAlign: "center" },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  subtitle: { color: colors.text, fontFamily: fonts.title, fontSize: 24, lineHeight: 31, marginTop: 2 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 32, lineHeight: 38 },
  video: { height: "100%", width: "100%" },
  videoFrame: { backgroundColor: colors.text, borderColor: colors.primary, borderRadius: 16, borderWidth: 2, height: 180, marginBottom: 24, overflow: "hidden", width: "100%" },
});
