import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function IndexRoute() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Redirect href="/onboarding/empezar" />;
  }

  return <Redirect href="/onboarding/splash" />;
}
