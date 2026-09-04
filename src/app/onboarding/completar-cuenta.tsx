import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { AppButton } from "@/components/onboarding/AppButton";
import { AppInput } from "@/components/onboarding/AppInput";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { PendingAnonymousEmailConversion } from "@/features/auth/services/anonymous-email-conversion.storage";
import { clearPendingAnonymousEmailConversion, getPendingAnonymousEmailConversion } from "@/features/auth/services/anonymous-email-conversion.storage";
import { getAuthErrorMessage } from "@/features/auth/services/auth.service";

type FormValues = { confirmPassword: string; password: string };

export default function CompleteAccountRoute() {
  const router = useRouter();
  const { completeAnonymousEmailConversion, user } = useAuth();
  const [pending, setPending] = useState<PendingAnonymousEmailConversion | null>(null);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { control, formState: { errors, isSubmitting, isValid }, getValues, handleSubmit } = useForm<FormValues>({
    defaultValues: { confirmPassword: "", password: "" },
    mode: "onChange",
  });

  useEffect(() => {
    let active = true;

    void getPendingAnonymousEmailConversion()
      .then(value => {
        if (active) {
          setPending(value);
          setIsLoadingPending(false);
        }
      })
      .catch(() => {
        if (active) {
          setAuthError("No pudimos recuperar la conversión pendiente.");
          setIsLoadingPending(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = handleSubmit(async values => {
    if (!pending) {
      return;
    }

    setAuthError(null);

    try {
      if (user?.id !== pending.userId) {
        throw new Error("conversion_user_mismatch");
      }

      await completeAnonymousEmailConversion(pending.email, values.password);
      await clearPendingAnonymousEmailConversion();
      router.replace("/(tabs)/empezar" as Href);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  });

  if (isLoadingPending) {
    return (
      <OnboardingScreen compact title="Protegiendo tu cuenta">
        <ActivityIndicator color={colors.primary} size="large" />
      </OnboardingScreen>
    );
  }

  if (!pending) {
    return (
      <OnboardingScreen compact title="Enlace no disponible">
        <Text style={styles.description}>No encontramos una conversión pendiente en este dispositivo.</Text>
        <AppButton onPress={() => router.replace("/(tabs)/yo" as Href)}>Volver a Perfil</AppButton>
      </OnboardingScreen>
    );
  }

  return (
    <OnboardingScreen compact title="Crea tu contraseña">
      <Text style={styles.description}>Correo confirmado: {pending.email}</Text>
      <Text style={styles.hint}>Por seguridad, escribe ahora una contraseña. No conservamos la que pudieras haber escrito antes.</Text>
      <Controller control={control} name="password" rules={{ maxLength: { message: "Máximo 128 caracteres", value: 128 }, minLength: { message: "Usa al menos 8 caracteres", value: 8 }, required: "La contraseña es obligatoria" }} render={({ field: { onBlur, onChange, value } }) => <AppInput autoCapitalize="none" autoComplete="new-password" compact error={errors.password?.message} label="Contraseña" maxLength={128} onBlur={onBlur} onChangeText={onChange} password placeholder="Contraseña" showLabel={false} textContentType="newPassword" value={value} />} />
      <Controller control={control} name="confirmPassword" rules={{ required: "Confirma tu contraseña", validate: value => value === getValues("password") || "Las contraseñas no coinciden" }} render={({ field: { onBlur, onChange, value } }) => <AppInput autoCapitalize="none" autoComplete="new-password" compact error={errors.confirmPassword?.message} label="Confirmar contraseña" maxLength={128} onBlur={onBlur} onChangeText={onChange} password placeholder="Confirmar contraseña" showLabel={false} textContentType="newPassword" value={value} />} />
      {authError ? <Text accessibilityRole="alert" style={styles.error}>{authError}</Text> : null}
      <AppButton allowPressWhenDisabled disabled={!isValid} loading={isSubmitting} onPress={onSubmit}>Guardar contraseña</AppButton>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  description: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 21, marginBottom: 12, textAlign: "center" },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginBottom: 10, textAlign: "center" },
  hint: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginBottom: 18, textAlign: "center" },
});
