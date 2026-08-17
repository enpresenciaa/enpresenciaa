import { AuthApiError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
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

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError && error.code) {
    return authErrorMessages[error.code] ?? "No pudimos completar la autenticación. Inténtalo de nuevo.";
  }

  return "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.";
}
