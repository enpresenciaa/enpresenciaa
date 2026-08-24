import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { AppInput } from "@/components/onboarding/AppInput";
import { BackButton } from "@/components/onboarding/BackButton";
import { DateOfBirthPicker } from "@/components/onboarding/DateOfBirthPicker";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthErrorMessage } from "@/features/auth/services/auth.service";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks/useProfile";
import { toDisplayDate, toIsoDate } from "@/features/profile/services/profile.service";
import { getProfileDisplayData } from "@/features/profile/utils/profile-display";

type ProfileForm = { dateOfBirth: string; email: string; fullName: string };

function isValidEmail(value: string): boolean {
  const [local, domain, extra] = value.trim().toLowerCase().split("@");
  return Boolean(local && domain && !extra && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith("."));
}

export function EditProfileScreen() {
  const router = useRouter();
  const { updateEmail, user } = useAuth();
  const { data: profile } = useProfile();
  const profileMutation = useUpdateProfile();
  const profileDisplay = getProfileDisplayData(user, profile);
  const { control, formState: { errors, isDirty, isSubmitting, isValid }, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: {
      dateOfBirth: "",
      email: profileDisplay.email,
      fullName: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!profile || isDirty) {
      return;
    }

    reset({
      dateOfBirth: toDisplayDate(profile.date_of_birth),
      email: profileDisplay.email,
      fullName: profile.full_name ?? profileDisplay.displayName,
    });
  }, [isDirty, profile, profileDisplay.displayName, profileDisplay.email, reset]);

  const onSubmit = handleSubmit(async values => {
    let profileSaved = false;

    try {
      await profileMutation.mutateAsync({
        date_of_birth: toIsoDate(values.dateOfBirth),
        full_name: values.fullName.trim(),
      });
      profileSaved = true;
      const result = await updateEmail(values.email);
      Alert.alert(
        "Perfil actualizado",
        result.requiresEmailConfirmation ?
          "Guardamos tus datos. Confirma el nuevo correo desde el mensaje que te enviamos." :
          "Tus datos se guardaron correctamente.",
        [{ text: "Entendido", onPress: () => router.replace("/(tabs)/yo") }],
      );
    } catch (error) {
      Alert.alert(
        profileSaved ? "Perfil guardado parcialmente" : "No pudimos guardar",
        profileSaved ?
          `El nombre y la fecha se guardaron, pero no pudimos actualizar el correo. ${getAuthErrorMessage(error)}` :
            getAuthErrorMessage(error),
      );
    }
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <BackButton fallbackHref="/(tabs)/yo" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <ProfileHeader avatarUrl={profileDisplay.avatarUrl} createdAt={profileDisplay.createdAt} displayName={profileDisplay.displayName} />

            <Controller
              control={control}
              name="fullName"
              rules={{ maxLength: { message: "Máximo 100 caracteres", value: 100 }, minLength: { message: "Escribe al menos 2 caracteres", value: 2 }, required: "El nombre es obligatorio" }}
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput error={errors.fullName?.message} label="Nombre" onBlur={onBlur} onChangeText={onChange} placeholder="Cambiar nombre" showLabel={false} value={value} />
              )}
            />
            <Controller
              control={control}
              name="email"
              rules={{ required: "El correo es obligatorio", validate: value => isValidEmail(value) || "Ingresa un correo electrónico válido" }}
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput autoCapitalize="none" autoComplete="email" error={errors.email?.message} keyboardType="email-address" label="Correo" onBlur={onBlur} onChangeText={onChange} placeholder="Correo" showLabel={false} value={value} />
              )}
            />
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{ required: "Selecciona tu fecha de nacimiento" }}
              render={({ field: { onBlur, onChange, value } }) => (
                <DateOfBirthPicker error={errors.dateOfBirth?.message} onBlur={onBlur} onChange={onChange} value={value} />
              )}
            />

            <View style={styles.submit}>
              <AppButton disabled={!isValid} loading={isSubmitting} onPress={() => void onSubmit()}>Guardar cambios</AppButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 560, paddingBottom: 40, paddingHorizontal: 24, paddingTop: 20, width: "100%" },
  safeArea: { flex: 1 },
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
  submit: { marginTop: 30 },
});
