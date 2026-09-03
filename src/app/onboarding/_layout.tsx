import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ animation: "fade", headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="video" />
      <Stack.Screen name="bienvenida" />
      <Stack.Screen name="ejercicio-inicial" />
      <Stack.Screen name="evaluacion-inicial" />
      <Stack.Screen name="poder-del-cambio" />
      <Stack.Screen name="crear-cuenta" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
