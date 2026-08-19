import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { SectionScreen } from "@/components/layout/SectionScreen";
import { useThemeColors } from "@/config/theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthErrorMessage } from "@/features/auth/services/auth.service";

export function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { signOut } = useAuth();
  const signOutLockRef = useRef(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (signOutLockRef.current) {
      return;
    }

    signOutLockRef.current = true;
    setAuthError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      signOutLockRef.current = false;
      setIsSigningOut(false);
    }
  }

  return (
    <SectionScreen title="Yo">
      {__DEV__ ? (
        <Pressable
          accessibilityRole="button"
          className="mt-8 min-h-12 min-w-48 items-center justify-center rounded-xl bg-primary px-6"
          onPress={() => router.push("/auth-inspector" as Href)}
        >
          <Text className="font-semibold text-primary-foreground">Ver datos de autenticación</Text>
        </Pressable>
      ) : null}
      {authError ? <Text accessibilityRole="alert" className="mt-5 text-center text-sm text-destructive">{authError}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isSigningOut, disabled: isSigningOut }}
        className="mt-4 min-h-12 min-w-48 items-center justify-center rounded-xl bg-destructive px-6"
        disabled={isSigningOut}
        onPress={() => void handleSignOut()}
      >
        {isSigningOut ? <ActivityIndicator color={colors.primaryForeground} /> : <Text className="font-semibold text-primary-foreground">Cerrar sesión</Text>}
      </Pressable>
    </SectionScreen>
  );
}
