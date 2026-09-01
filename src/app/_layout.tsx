import "../../global.css";

import { Alice_400Regular } from "@expo-google-fonts/alice";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { registerSupabaseAutoRefresh } from "@/lib/supabase";
import { queryClient } from "@/lib/query-client";

function AuthNavigator() {
  const { hasCompletedOnboarding, status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const isAuthenticated = status === "authenticated";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="auth/callback" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && hasCompletedOnboarding}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camino/nivel/[levelId]" />
        <Stack.Screen name="exercise/[exerciseId]" />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Alice: Alice_400Regular,
    Poppins: Poppins_400Regular,
    PoppinsMedium: Poppins_500Medium,
    PoppinsSemiBold: Poppins_600SemiBold,
  });

  useEffect(() => registerSupabaseAutoRefresh(), []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthNavigator />
      </QueryClientProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
});
