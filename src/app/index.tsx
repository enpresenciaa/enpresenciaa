import * as Linking from "expo-linking";
import type { Href } from "expo-router";
import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasOAuthCallbackParams } from "@/features/auth/services/auth.service";

export default function IndexRoute() {
  const linkingUrl = Linking.useURL();
  const { hasCompletedOnboarding, status } = useAuth();

  if (linkingUrl?.includes("auth/callback") && hasOAuthCallbackParams(linkingUrl)) {
    return <Redirect href="/auth/callback" />;
  }

  if (status === "permanent" || (status === "anonymous" && hasCompletedOnboarding)) {
    return <Redirect href={"/(tabs)/empezar" as Href} />;
  }

  if (status === "anonymous") {
    return <Redirect href="/onboarding/ejercicio-inicial" />;
  }

  return <Redirect href="/onboarding/splash" />;
}
