import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

import type { EmailPasswordCredentials, OAuthResult, SignUpResult, SocialOAuthProvider } from "@/features/auth/services/auth.service";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  completeOnboarding: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  session: Session | null;
  signInWithOAuth: (provider: SocialOAuthProvider) => Promise<OAuthResult>;
  signOut: () => Promise<void>;
  signInWithPassword: (credentials: EmailPasswordCredentials) => Promise<void>;
  signUpWithPassword: (credentials: EmailPasswordCredentials) => Promise<SignUpResult>;
  status: AuthStatus;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
