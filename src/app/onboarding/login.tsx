import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { AppInput } from "@/components/onboarding/AppInput";
import { BackButton } from "@/components/onboarding/BackButton";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { OAuthOptions } from "@/components/onboarding/OAuthOptions";
import type { OAuthProvider } from "@/components/onboarding/OAuthOptions";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthErrorMessage } from "@/features/auth/services/auth.service";

type FormValues = { email: string; password: string };
const background = require("../../../assets/images/Imág. INICIAR SESIÓN.jpg");

function isValidEmail(value: string): boolean {
  const [local, domain, extra] = value.trim().toLowerCase().split("@");
  return Boolean(local && domain && !extra && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith("."));
}

export default function LoginRoute() {
  const router = useRouter();
  const { signInWithOAuth, signInWithPassword } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const oauthLockRef = useRef(false);
  const submitLockRef = useRef(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const { height } = useWindowDimensions();
  const { control, formState: { errors, isSubmitting, isValid }, handleSubmit } = useForm<FormValues>({ defaultValues: { email: "", password: "" }, mode: "onChange" });

  const onSubmit = handleSubmit(async values => {
    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setAuthError(null);

    try {
      await signInWithPassword(values);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      submitLockRef.current = false;
    }
  });

  function handleForgotPassword() {
    // TODO(auth): conectar recuperación de contraseña cuando exista el flujo.
  }

  async function handleOAuthPress(provider: OAuthProvider) {
    const authProvider = provider === "Google" ? "google" : provider === "Facebook" ? "facebook" : null;

    if (!authProvider || oauthLockRef.current) {
      return;
    }

    oauthLockRef.current = true;
    setAuthError(null);
    setLoadingProvider(provider);

    try {
      await signInWithOAuth(authProvider);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      oauthLockRef.current = false;
      setLoadingProvider(null);
    }
  }

  return (
    <OnboardingBackground source={background}>
      <SafeAreaView style={styles.safeArea}>
        <BackButton />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={[styles.content, { paddingTop: height * 0.16 }]} keyboardShouldPersistTaps="handled">
            <View style={[styles.card, height >= 780 && { maxHeight: height * 0.55 }]}>
              <Text accessibilityRole="header" style={styles.title}>Iniciar sesión</Text>
              <Controller
                control={control}
                name="email"
                rules={{ required: "El correo electrónico es obligatorio", validate: value => isValidEmail(value) || "Ingresa un correo electrónico válido" }}
                render={({ field: { onBlur, onChange, value } }) => (
                  <AppInput
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    compact
                    error={errors.email?.message}
                    keyboardType="email-address"
                    label="Correo electrónico"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    placeholder="Ingresa tu correo electrónico"
                    returnKeyType="next"
                    showLabel={false}
                    textContentType="emailAddress"
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                rules={{ required: "La contraseña es obligatoria" }}
                render={({ field: { onBlur, onChange, value } }) => (
                  <AppInput
                    autoCapitalize="none"
                    autoComplete="password"
                    compact
                    error={errors.password?.message}
                    inputRef={passwordRef}
                    label="Contraseña"
                    maxLength={128}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={() => void onSubmit()}
                    password
                    placeholder="Ingresa tu contraseña"
                    returnKeyType="done"
                    showLabel={false}
                    textContentType="password"
                    value={value}
                  />
                )}
              />
              <Pressable accessibilityLabel="Recuperar contraseña" accessibilityRole="link" hitSlop={8} onPress={handleForgotPassword} style={styles.forgotButton}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
              {authError ? <Text accessibilityRole="alert" style={styles.authError}>{authError}</Text> : null}
              <AppButton allowPressWhenDisabled disabled={!isValid} loading={isSubmitting} onPress={onSubmit}>Iniciar sesión</AppButton>
              <OAuthOptions
                disabled={isSubmitting || loadingProvider !== null}
                enabledProviders={["Google", "Facebook"]}
                loadingProvider={loadingProvider}
                onProviderPress={provider => void handleOAuthPress(provider)}
                separatorText="o continúa con"
              />
              <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push("/onboarding/crear-cuenta")} style={styles.createButton}>
                <Text style={styles.createText}>¿No tienes cuenta? <Text style={styles.createHighlight}>Crear cuenta</Text></Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  authError: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginBottom: 9, textAlign: "center" },
  card: { alignSelf: "center", backgroundColor: "rgba(253,248,236,0.95)", borderRadius: 22, maxWidth: 520, paddingHorizontal: 20, paddingVertical: 17, width: "100%" },
  content: { flexGrow: 1, justifyContent: "flex-start", paddingBottom: 24, paddingHorizontal: 24 },
  createButton: { alignItems: "center", justifyContent: "center", marginTop: 10, minHeight: 32 },
  createHighlight: { color: colors.primary, fontFamily: fonts.bodySemiBold },
  createText: { color: colors.text, fontFamily: fonts.body, fontSize: 11, textAlign: "center" },
  flex: { flex: 1 },
  forgotButton: { alignSelf: "flex-end", justifyContent: "center", marginBottom: 9, marginTop: -4, minHeight: 28 },
  forgotText: { color: colors.primary, fontFamily: fonts.body, fontSize: 11 },
  safeArea: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 30, lineHeight: 36, marginBottom: 14, textAlign: "center" },
});
