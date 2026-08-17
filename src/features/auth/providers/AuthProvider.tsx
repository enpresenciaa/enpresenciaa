import type { Session } from "@supabase/supabase-js";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

import type { AuthContextValue, AuthStatus } from "@/features/auth/context/AuthContext";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { signInWithPassword, signUpWithPassword } from "@/features/auth/services/auth.service";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    function updateSession(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    }

    const hydrateSession = async () => {
      const { data } = await supabase.auth.getSession();
      updateSession(data.session);
    };

    void hydrateSession().catch(() => updateSession(null));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      updateSession(nextSession);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    signInWithPassword,
    signUpWithPassword,
    status,
    user: session?.user ?? null,
  }), [session, status]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
