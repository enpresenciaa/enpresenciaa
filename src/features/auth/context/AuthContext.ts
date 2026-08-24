import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

import type { EmailPasswordCredentials, EmailUpdateResult, OAuthResult, SignUpCredentials, SignUpResult, SocialOAuthProvider } from "@/features/auth/services/auth.service";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  completeOnboarding: () => Promise<void>;
  hasCompletedOnboarding: boolean;
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
