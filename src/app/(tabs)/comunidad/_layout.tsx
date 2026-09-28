import { Stack } from "expo-router";

import { colors, fonts } from "@/config/onboarding-theme";

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: "Comunidad",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.title },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="instagram" options={{ title: "Instagram" }} />
      <Stack.Screen name="consultas" options={{ title: "Consultas" }} />
      <Stack.Screen name="notificaciones" options={{ headerShown: false }} />
    </Stack>
  );
}
