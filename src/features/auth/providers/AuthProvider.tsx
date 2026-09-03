import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AuthContextValue, AuthStatus } from "@/features/auth/context/AuthContext";
import { AuthContext } from "@/features/auth/context/AuthContext";
import type { SocialOAuthProvider } from "@/features/auth/services/auth.service";
import { completeOnboarding, createSessionFromUrl, hasOAuthCallbackParams, resendConfirmationEmail, signInWithOAuth as signInWithOAuthService, signInWithPassword, signOut, signUpWithPassword as signUpWithPasswordService, updateEmail } from "@/features/auth/services/auth.service";
import { queryClient } from "@/lib/query-client";
import { getPersistedOnboardingCompleted, persistOnboardingCompleted } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

function getSessionStatus(session: Session | null): AuthStatus {
  if (!session) {
    return "unauthenticated";
  }

  return session.user.is_anonymous ? "anonymous" : "permanent";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const linkingUrl = Linking.useLinkingURL();
  const processedCallbackUrlRef = useRef<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(getPersistedOnboardingCompleted);

  const handleCompleteOnboarding = useCallback(async () => {
    await completeOnboarding();
    persistOnboardingCompleted();
    setHasCompletedOnboarding(true);
  }, []);

  const handleSignInWithOAuth = useCallback(async (provider: SocialOAuthProvider) => {
    const result = await signInWithOAuthService(provider);

    if (result !== "success") {
      return result;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    setSession(data.session);
    setStatus(getSessionStatus(data.session));

    return result;
  }, []);

  const handleSignUpWithPassword = useCallback<AuthContextValue["signUpWithPassword"]>(async credentials => {
    const result = await signUpWithPasswordService(credentials);

    if (result.requiresEmailConfirmation) {
      return result;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    setSession(data.session);
    setStatus(getSessionStatus(data.session));

    return result;
  }, []);

  useEffect(() => {
    if (!linkingUrl?.includes("auth/callback") || !hasOAuthCallbackParams(linkingUrl)) {
      return;
    }

    if (processedCallbackUrlRef.current === linkingUrl) {
      return;
    }

    let active = true;
    processedCallbackUrlRef.current = linkingUrl;

    void Promise.resolve()
      .then(() => {
        if (active) {
          setStatus("loading");
        }

        return createSessionFromUrl(linkingUrl);
      })
      .then(async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (active) {
          setSession(data.session);
          setStatus(getSessionStatus(data.session));
        }
      })
      .catch(async () => {
        const { data } = await supabase.auth.getSession();

        if (active) {
          setSession(data.session);
          setStatus(getSessionStatus(data.session));
        }
      });

    return () => {
      active = false;
    };
  }, [linkingUrl]);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    let initializing = true;

    function updateSession(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setStatus(getSessionStatus(nextSession));
    }

    const hydrateSession = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl?.includes("auth/callback") && hasOAuthCallbackParams(initialUrl)) {
        processedCallbackUrlRef.current = initialUrl;
        await createSessionFromUrl(initialUrl);
      }

      const { data } = await supabase.auth.getSession();

      if (authEventReceived) {
        initializing = false;
        return;
      }

      initializing = false;
      updateSession(data.session);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (initializing && !nextSession) {
        return;
      }

      authEventReceived = true;

      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["journal"] });
        queryClient.removeQueries({ queryKey: ["journey"] });
        queryClient.removeQueries({ queryKey: ["billing-subscription"] });
      }

      updateSession(nextSession);
    });

    void hydrateSession().catch(() => {
      initializing = false;

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
    completeOnboarding: handleCompleteOnboarding,
    hasCompletedOnboarding,
    resendConfirmationEmail,
    session,
    signInWithOAuth: handleSignInWithOAuth,
    signInWithPassword,
    signOut,
    signUpWithPassword: handleSignUpWithPassword,
    status,
    updateEmail,
    user: session?.user ?? null,
  }), [handleCompleteOnboarding, handleSignInWithOAuth, handleSignUpWithPassword, hasCompletedOnboarding, session, status]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
