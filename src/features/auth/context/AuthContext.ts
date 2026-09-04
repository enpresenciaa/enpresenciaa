import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

import type { AnonymousEmailConversionRequest, AnonymousEmailConversionResult, EmailPasswordCredentials, EmailUpdateResult, OAuthResult, SignUpCredentials, SignUpResult, SocialOAuthProvider } from "@/features/auth/services/auth.service";

export type AuthStatus = "loading" | "unauthenticated" | "anonymous" | "permanent" | "converting" | "merging";

export interface AuthContextValue {
  beginAnonymousEmailConversion: (request: AnonymousEmailConversionRequest) => Promise<AnonymousEmailConversionResult>;
  completeAnonymousEmailConversion: (email: string, password: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  linkAnonymousIdentity: (provider: SocialOAuthProvider) => Promise<OAuthResult>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  resendAnonymousEmailConversion: (email: string) => Promise<void>;
  session: Session | null;
  signInWithOAuth: (provider: SocialOAuthProvider) => Promise<OAuthResult>;
  signOut: () => Promise<void>;
  signInWithPassword: (credentials: EmailPasswordCredentials) => Promise<void>;
  signUpWithPassword: (credentials: SignUpCredentials) => Promise<SignUpResult>;
  status: AuthStatus;
  updateEmail: (email: string) => Promise<EmailUpdateResult>;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
