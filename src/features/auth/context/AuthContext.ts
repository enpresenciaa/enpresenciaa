import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  session: Session | null;
  status: AuthStatus;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
