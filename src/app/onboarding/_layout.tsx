import { Stack } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function OnboardingLayout() {
  const { hasCompletedOnboarding, status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <Stack screenOptions={{ animation: "fade", headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="video" />
        <Stack.Screen name="bienvenida" />
        <Stack.Screen name="ejercicio-inicial" />
        <Stack.Screen name="evaluacion-inicial" />
        <Stack.Screen name="poder-del-cambio" />
        <Stack.Screen name="crear-cuenta" />
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && !hasCompletedOnboarding}>
        <Stack.Screen name="empezar" />
      </Stack.Protected>
    </Stack>
  );
}
