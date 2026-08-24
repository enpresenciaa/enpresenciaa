import * as Linking from "expo-linking";
import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasOAuthCallbackParams } from "@/features/auth/services/auth.service";

export default function IndexRoute() {
  const linkingUrl = Linking.useURL();
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Redirect href="/onboarding/empezar" />;
  }

  if (linkingUrl?.includes("auth/callback") && hasOAuthCallbackParams(linkingUrl)) {
    return <Redirect href="/auth/callback" />;
  }

  return <Redirect href="/onboarding/splash" />;
}
