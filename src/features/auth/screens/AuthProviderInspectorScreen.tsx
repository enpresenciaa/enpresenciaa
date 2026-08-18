import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { sanitizeAuthUser } from "@/features/auth/utils/sanitize-auth-user";

export function AuthProviderInspectorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const sanitizedUser = useMemo(() => user ? sanitizeAuthUser(user) : null, [user]);
  const serializedUser = useMemo(() => JSON.stringify(sanitizedUser, null, 2), [sanitizedUser]);

  async function handleCopy() {
    await Clipboard.setStringAsync(serializedUser);
    setCopied(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-12 pt-4">
        <View className="flex-row items-center justify-between gap-4">
          <Pressable accessibilityRole="button" className="min-h-11 justify-center" onPress={() => router.back()}>
            <Text className="text-base font-semibold text-primary">Volver</Text>
          </Pressable>
          <Text accessibilityRole="header" className="flex-1 text-right text-2xl font-semibold text-text">Inspector de usuario</Text>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="text-sm leading-5 text-text-secondary">
            Vista disponible sólo para desarrollo. El contenido está limitado a campos de identidad permitidos y no incluye tokens ni secretos.
          </Text>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="mb-3 text-lg font-semibold text-card-foreground">Datos sanitizados</Text>
          <ScrollView horizontal>
            <Text selectable className="font-mono text-xs leading-5 text-card-foreground">{serializedUser}</Text>
          </ScrollView>
        </View>

        <Pressable
          accessibilityRole="button"
          className="min-h-12 items-center justify-center rounded-xl bg-primary px-5"
          onPress={() => void handleCopy()}
        >
          <Text className="font-semibold text-primary-foreground">{copied ? "Copiado" : "Copiar datos sanitizados"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
