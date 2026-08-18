import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

import type { AuthContextValue, AuthStatus } from "@/features/auth/context/AuthContext";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { completeOnboarding, createSessionFromUrl, signInWithGoogle, signInWithPassword, signOut, signUpWithPassword } from "@/features/auth/services/auth.service";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: PropsWithChildren) {
  const linkingUrl = Linking.useLinkingURL();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!linkingUrl?.includes("auth/callback")) {
      return;
    }

    void createSessionFromUrl(linkingUrl).catch(() => undefined);
  }, [linkingUrl]);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;

    function updateSession(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    }

    const hydrateSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (authEventReceived) {
        return;
      }

      updateSession(data.session);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;
      updateSession(nextSession);
    });

    void hydrateSession().catch(() => {
      if (!authEventReceived) {
        updateSession(null);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    completeOnboarding,
    hasCompletedOnboarding: session?.user.user_metadata.onboarding_completed === true,
    session,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    status,
    user: session?.user ?? null,
  }), [session, status]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
