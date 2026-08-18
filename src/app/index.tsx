import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function IndexRoute() {
  const { hasCompletedOnboarding, status } = useAuth();

  if (status === "authenticated") {
    return <Redirect href={hasCompletedOnboarding ? "/(tabs)" : "/onboarding/empezar"} />;
  }

  return <Redirect href="/onboarding/splash" />;
}
