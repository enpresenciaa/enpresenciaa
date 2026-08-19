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

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

export type OAuthResult = "success" | "cancelled";
export type SocialOAuthProvider = "facebook" | "google";

type OAuthFlowErrorCode = "configuration" | "provider";

class OAuthFlowError extends Error {
  constructor(readonly code: OAuthFlowErrorCode, readonly provider?: SocialOAuthProvider) {
    super(code);
    this.name = "OAuthFlowError";
  }
}

const socialProviderLabels: Record<SocialOAuthProvider, string> = {
  facebook: "Facebook",
  google: "Google",
};

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

export async function signUpWithPassword({ email, password }: EmailPasswordCredentials): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw error;
  }

  return { requiresEmailConfirmation: data.session === null };
}

export async function createSessionFromUrl(url: string, provider?: SocialOAuthProvider): Promise<OAuthResult> {
  const { errorCode, params } = QueryParams.getQueryParams(url);

  if (errorCode === "access_denied") {
    return "cancelled";
  }

  if (errorCode) {
    throw new OAuthFlowError("provider", provider);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new OAuthFlowError("configuration", provider);
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return "success";
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

export async function completeOnboarding(): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  });

  if (error) {
    throw error;
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof OAuthFlowError) {
    const provider = error.provider ? socialProviderLabels[error.provider] : "el proveedor";

    return error.code === "configuration" ?
      `No pudimos iniciar ${provider}. Revisa la configuración de autenticación.` :
      `${provider} no pudo completar la autenticación. Inténtalo de nuevo.`;
  }

  if (error instanceof AuthApiError && error.code) {
    return authErrorMessages[error.code] ?? "No pudimos completar la autenticación. Inténtalo de nuevo.";
  }

  return "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.";
}
