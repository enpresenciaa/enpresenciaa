import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthErrorMessage } from "@/features/auth/services/auth.service";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { getProfileDisplayData } from "@/features/profile/utils/profile-display";

type ProfileMenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
};

function ProfileMenuItem({ icon, label, onPress, trailingIcon = "chevron-forward" }: ProfileMenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text} name={icon} size={29} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons color={colors.border} name={trailingIcon} size={29} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { signOut, status, user } = useAuth();
  const signOutLockRef = useRef(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: profile, error: profileError, isFetching, refetch } = useProfile();
  const isGuest = status === "anonymous";
  const profileDisplay = isGuest ?
      { avatarUrl: null, createdAt: null, displayName: "Invitado", email: "" } :
      getProfileDisplayData(user, profile);

  function showComingSoon(section: string) {
    Alert.alert(section, "Esta sección estará disponible próximamente.");
  }

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
    <View style={styles.screen}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileHeader
            avatarUrl={profileDisplay.avatarUrl}
            createdAt={profileDisplay.createdAt}
            displayName={profileDisplay.displayName}
            subtitle={isGuest ? "Sesión temporal de invitado" : undefined}
          />

          {!isGuest && isFetching && !profile ? <ActivityIndicator color={colors.primary} style={styles.profileStatus} /> : null}
          {!isGuest && profileError ? (
            <Pressable accessibilityRole="button" onPress={() => void refetch()}>
              <Text accessibilityRole="alert" style={styles.error}>No pudimos cargar tu perfil. Toca para reintentar.</Text>
            </Pressable>
          ) : null}

          <View style={styles.menu}>
            {isGuest ? (
              <>
                <ProfileMenuItem icon="person-add-outline" label="Crear cuenta" onPress={() => router.push("/onboarding/crear-cuenta")} />
                <ProfileMenuItem icon="log-in-outline" label="Iniciar sesión" onPress={() => showComingSoon("Migración del progreso invitado")} />
              </>
            ) : (
              <ProfileMenuItem icon="create-outline" label="Editar perfil" onPress={() => router.push("/(tabs)/yo/editar-perfil")} />
            )}
            <ProfileMenuItem icon="notifications-outline" label="Notificaciones" onPress={() => router.push("/(tabs)/notificaciones")} />
            <ProfileMenuItem icon="lock-closed-outline" label="Privacidad" onPress={() => showComingSoon("Privacidad")} />
            <ProfileMenuItem icon="globe-outline" label="Idioma" onPress={() => showComingSoon("Idioma")} trailingIcon="chevron-down" />
            {!isGuest ? <ProfileMenuItem icon="diamond-outline" label="Tipo de suscripción" onPress={() => router.push("/(tabs)/yo/suscripcion")} /> : null}
            <ProfileMenuItem icon="log-out-outline" label="Cerrar sesión" onPress={() => void handleSignOut()} />
          </View>

          {isSigningOut ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
          {authError ? <Text accessibilityRole="alert" style={styles.error}>{authError}</Text> : null}

          <Pressable onPress={() => showComingSoon("Video de introducción")} style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}>
            <Text style={styles.resourceText}>Video de introducción</Text>
          </Pressable>
          <Pressable onPress={() => showComingSoon("Ejercicio de inicio")} style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}>
            <Text style={styles.resourceText}>Ejercicio de inicio</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 560, paddingBottom: 30, paddingHorizontal: 24, paddingTop: 20, width: "100%" },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 10, textAlign: "center" },
  loader: { marginTop: 10 },
  menu: { gap: 2 },
  menuItem: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E6E8E3", borderRadius: 6, borderWidth: 1, flexDirection: "row", minHeight: 54, paddingHorizontal: 14 },
  menuLabel: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 18, marginLeft: 13 },
  pressed: { opacity: 0.65 },
  profileStatus: { marginBottom: 12 },
  resourceCard: { backgroundColor: "#FFFFFF", borderColor: "#E6E8E3", borderRadius: 6, borderWidth: 1, justifyContent: "center", marginHorizontal: 5, marginTop: 8, minHeight: 54, paddingHorizontal: 14 },
  resourceText: { color: colors.text, fontFamily: fonts.body, fontSize: 17 },
  safeArea: { flex: 1 },
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
});
