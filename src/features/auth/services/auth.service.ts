import { AuthApiError } from "@supabase/supabase-js";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import { getAuthRedirectUrl } from "@/features/auth/utils/auth-redirect";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends EmailPasswordCredentials {
  fullName?: string;
  phone?: string;
}

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

export interface EmailUpdateResult {
  requiresEmailConfirmation: boolean;
}

export type OAuthResult = "success" | "cancelled";
export type SocialOAuthProvider = "facebook" | "google";

type OAuthFlowErrorCode = "configuration" | "provider";

class OAuthFlowError extends Error {
  constructor(
    readonly code: OAuthFlowErrorCode,
    readonly provider?: SocialOAuthProvider,
    readonly detail?: string,
  ) {
    super(detail ?? code);
    this.name = "OAuthFlowError";
  }
}

class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("email_already_registered");
    this.name = "EmailAlreadyRegisteredError";
  }
}

const socialProviderLabels: Record<SocialOAuthProvider, string> = {
  facebook: "Facebook",
  google: "Google",
};

let callbackAttempt: { promise: Promise<OAuthResult>; url: string } | null = null;

export function hasOAuthCallbackParams(url: string): boolean {
  const { errorCode, params } = QueryParams.getQueryParams(url);

  return Boolean(
    errorCode ||
    params.error ||
    params.access_token ||
    params.refresh_token ||
    params.code,
  );
}

const authErrorMessages: Record<string, string> = {
  email_exists: "Ya existe una cuenta asociada a este correo.",
  email_not_confirmed: "Confirma tu correo electrónico antes de iniciar sesión.",
  invalid_credentials: "El correo o la contraseña son incorrectos.",
  over_email_send_rate_limit: "Espera unos minutos antes de solicitar otro correo.",
  over_request_rate_limit: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  signup_disabled: "El registro de nuevas cuentas no está disponible en este momento.",
  user_already_exists: "Ya existe una cuenta asociada a este correo.",
  weak_password: "La contraseña no cumple los requisitos de seguridad.",
};

export async function signInWithPassword({ email, password }: EmailPasswordCredentials): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signUpWithPassword({ email, fullName, password, phone }: SignUpCredentials): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    options: {
      data: {
        ...(fullName?.trim() ? { full_name: fullName.trim(), name: fullName.trim() } : {}),
        ...(phone?.trim() ? { phone: phone.trim() } : {}),
      },
      emailRedirectTo: getAuthRedirectUrl(),
    },
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Supabase did not return a user after sign up.");
  }

  // Supabase can obscure an existing confirmed account by returning a user
  // without identities. Do not report that response as a new registration.
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new EmailAlreadyRegisteredError();
  }

  return { requiresEmailConfirmation: data.session === null };
}

async function exchangeCallbackForSession(url: string, provider?: SocialOAuthProvider): Promise<OAuthResult> {
  const { errorCode, params } = QueryParams.getQueryParams(url);
  const providerError = errorCode ?? params.error;
  const errorDescription = params.error_description ?? params.error;

  if (providerError === "access_denied") {
    return "cancelled";
  }

  if (providerError) {
    throw new OAuthFlowError("provider", provider, errorDescription);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  const code = params.code;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new OAuthFlowError("configuration", provider);
    }

    return "success";
  }

  if (!accessToken || !refreshToken) {
    throw new OAuthFlowError("configuration", provider);
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new OAuthFlowError("configuration", provider);
  }

  return "success";
}

export async function resendConfirmationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: getAuthRedirectUrl() },
    type: "signup",
  });

  if (error) {
    throw error;
  }
}

export function createSessionFromUrl(url: string, provider?: SocialOAuthProvider): Promise<OAuthResult> {
  if (callbackAttempt?.url === url) {
    return callbackAttempt.promise;
  }

  // OAuth authorization codes are single-use. Expo Linking and
  // openAuthSessionAsync can expose the same callback to multiple listeners.
  const promise = exchangeCallbackForSession(url, provider);

  callbackAttempt = { promise, url };
  return promise;
}

export async function signInWithOAuth(provider: SocialOAuthProvider): Promise<OAuthResult> {
  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new OAuthFlowError("configuration", provider);
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "cancel" || result.type === "dismiss") {
    return "cancelled";
  }

  if (result.type !== "success") {
    throw new OAuthFlowError("provider", provider);
  }

  return createSessionFromUrl(result.url, provider);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

let onboardingCompletionAttempt: Promise<void> | null = null;

async function completeOnboardingOnce(): Promise<void> {
  const { data: currentSession, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!currentSession.session) {
    const { error: anonymousError } = await supabase.auth.signInAnonymously();

    if (anonymousError) {
      throw anonymousError;
    }
  }
}

export function completeOnboarding(): Promise<void> {
  if (onboardingCompletionAttempt) {
    return onboardingCompletionAttempt;
  }

  onboardingCompletionAttempt = completeOnboardingOnce().finally(() => {
    onboardingCompletionAttempt = null;
  });

  return onboardingCompletionAttempt;
}

export async function updateEmail(email: string): Promise<EmailUpdateResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const currentEmail = (await supabase.auth.getUser()).data.user?.email?.toLowerCase();

  if (normalizedEmail === currentEmail) {
    return { requiresEmailConfirmation: false };
  }

  const { data, error } = await supabase.auth.updateUser({
    email: normalizedEmail,
  });

  if (error) {
    throw error;
  }

  return { requiresEmailConfirmation: data.user.email?.toLowerCase() !== normalizedEmail };
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof EmailAlreadyRegisteredError) {
    return "Ya existe una cuenta asociada a este correo. Inicia sesión o recupera tu contraseña.";
  }

  if (error instanceof OAuthFlowError) {
    const provider = error.provider ? socialProviderLabels[error.provider] : "el proveedor";

    if (error.detail) {
      return `${provider} rechazó la autenticación: ${error.detail}`;
    }

    return error.code === "configuration" ?
      `No pudimos iniciar ${provider}. Revisa la configuración de autenticación.` :
      `${provider} no pudo completar la autenticación. Inténtalo de nuevo.`;
  }

  if (error instanceof AuthApiError && error.code) {
    return authErrorMessages[error.code] ?? "No pudimos completar la autenticación. Inténtalo de nuevo.";
  }

  return "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.";
}
