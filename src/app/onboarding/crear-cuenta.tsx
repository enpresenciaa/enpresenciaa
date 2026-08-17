import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/onboarding/AppButton";
import { AppCheckbox } from "@/components/onboarding/AppCheckbox";
import { AppInput } from "@/components/onboarding/AppInput";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { OAuthOptions } from "@/components/onboarding/OAuthOptions";
import { PhoneNumberInput } from "@/components/onboarding/PhoneNumberInput";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthErrorMessage } from "@/features/auth/services/auth.service";

type FormValues = { confirmPassword: string; countryCode: string; email: string; fullName: string; password: string; phoneNumber: string; privacy: boolean; terms: boolean };

function isValidEmail(value: string): boolean {
  const [local, domain, extra] = value.trim().toLowerCase().split("@");
  return Boolean(local && domain && !extra && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith("."));
}

export default function CreateAccountRoute() {
  const router = useRouter();
  const { signUpWithPassword } = useAuth();
  const submitLockRef = useRef(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { control, formState: { errors, isSubmitting, isValid }, getValues, handleSubmit, trigger } = useForm<FormValues>({
    defaultValues: { confirmPassword: "", countryCode: "+52", email: "", fullName: "", password: "", phoneNumber: "", privacy: false, terms: false },
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async values => {
    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setAuthError(null);

    try {
      const result = await signUpWithPassword({ email: values.email, password: values.password });

      if (result.requiresEmailConfirmation) {
        Alert.alert(
          "Revisa tu correo",
          "Te enviamos un enlace para confirmar tu cuenta antes de iniciar sesión.",
          [{ text: "Entendido", onPress: () => router.replace("/onboarding/login") }],
        );
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      submitLockRef.current = false;
    }
  });

  return (
    <OnboardingScreen compact title="Crea tu cuenta">
      <Controller control={control} name="fullName" rules={{ maxLength: { message: "Máximo 100 caracteres", value: 100 }, minLength: { message: "Escribe al menos 2 caracteres", value: 2 }, required: "El nombre es obligatorio", validate: value => value.trim().length >= 2 || "Escribe un nombre válido" }} render={({ field: { onBlur, onChange, value } }) => <AppInput autoComplete="name" compact error={errors.fullName?.message} label="Nombre completo" maxLength={100} onBlur={onBlur} onChangeText={onChange} placeholder="Nombre completo" showLabel={false} textContentType="name" value={value} />} />
      <Controller control={control} name="email" rules={{ required: "El correo electrónico es obligatorio", validate: value => isValidEmail(value) || "Ingresa un correo electrónico válido" }} render={({ field: { onBlur, onChange, value } }) => <AppInput autoCapitalize="none" autoComplete="email" autoCorrect={false} compact error={errors.email?.message} keyboardType="email-address" label="Correo electrónico" onBlur={onBlur} onChangeText={onChange} placeholder="Correo electrónico" showLabel={false} textContentType="emailAddress" value={value} />} />
      <Controller
        control={control}
        name="countryCode"
        rules={{ required: true }}
        render={({ field: { onChange: onCountryCodeChange, value: countryCode } }) => (
          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: "El teléfono es obligatorio",
              validate: value => {
                const totalDigits = getValues("countryCode").slice(1).length + value.length;
                return (value.length >= 7 && totalDigits <= 15) || "Ingresa un número telefónico válido";
              },
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <PhoneNumberInput
                countryCode={countryCode}
                error={errors.phoneNumber?.message}
                onBlur={onBlur}
                onCountryCodeChange={code => { onCountryCodeChange(code); void trigger("phoneNumber"); }}
                onPhoneNumberChange={onChange}
                phoneNumber={value}
              />
            )}
          />
        )}
      />
      <Controller control={control} name="password" rules={{ maxLength: { message: "Máximo 128 caracteres", value: 128 }, minLength: { message: "Usa al menos 8 caracteres", value: 8 }, required: "La contraseña es obligatoria" }} render={({ field: { onBlur, onChange, value } }) => <AppInput autoCapitalize="none" autoComplete="new-password" compact error={errors.password?.message} label="Contraseña" maxLength={128} onBlur={onBlur} onChangeText={onChange} password placeholder="Contraseña" showLabel={false} textContentType="newPassword" value={value} />} />
      <Controller control={control} name="confirmPassword" rules={{ required: "Confirma tu contraseña", validate: value => value === getValues("password") || "Las contraseñas no coinciden" }} render={({ field: { onBlur, onChange, value } }) => <AppInput autoCapitalize="none" autoComplete="new-password" compact error={errors.confirmPassword?.message} label="Confirmar contraseña" maxLength={128} onBlur={onBlur} onChangeText={onChange} password placeholder="Confirmar contraseña" showLabel={false} textContentType="newPassword" value={value} />} />
      <View style={styles.checks}>
        <Controller control={control} name="terms" rules={{ validate: value => value || "Debes aceptar los términos y la privacidad" }} render={({ field: { onChange, value } }) => <AppCheckbox accessibilityLabel="Acepto los Términos y Privacidad" checked={value} error={errors.terms?.message} label={<Text style={styles.checkText}>Acepto los <Text style={styles.highlight}>Términos y Privacidad</Text></Text>} onChange={onChange} />} />
        <Controller control={control} name="privacy" rules={{ validate: value => value || "Debes aceptar el aviso de privacidad" }} render={({ field: { onChange, value } }) => <AppCheckbox accessibilityLabel="Aviso de privacidad" checked={value} error={errors.privacy?.message} label={<Text style={styles.checkText}>Aviso de privacidad</Text>} onChange={onChange} />} />
      </View>
      {authError ? <Text accessibilityRole="alert" style={styles.authError}>{authError}</Text> : null}
      <AppButton allowPressWhenDisabled disabled={!isValid} loading={isSubmitting} onPress={onSubmit}>Registrarme</AppButton>
      <OAuthOptions separatorText="o" title="Regístrate con" />
      <View style={styles.footer}>
        <Pressable accessibilityRole="link" onPress={() => router.push("/onboarding/login")} style={styles.linkButton}>
          <Text style={styles.link}>¿Ya tienes cuenta? <Text style={styles.linkHighlight}>Inicia sesión</Text></Text>
        </Pressable>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  authError: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginBottom: 10, textAlign: "center" },
  checkText: { color: colors.text, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  checks: { marginBottom: 10, marginTop: 1 },
  footer: { marginTop: 25, paddingBottom: 4 },
  highlight: { color: colors.primary, fontFamily: fonts.bodySemiBold },
  link: { color: colors.text, fontFamily: fonts.body, fontSize: 12, textAlign: "center" },
  linkHighlight: { color: colors.primary, fontFamily: fonts.bodySemiBold },
  linkButton: { justifyContent: "center", minHeight: 38 },
});
