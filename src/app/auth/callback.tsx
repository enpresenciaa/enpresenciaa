import * as Linking from "expo-linking";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { getPendingAnonymousEmailConversion } from "@/features/auth/services/anonymous-email-conversion.storage";
import { createSessionFromUrl, getAuthErrorMessage, hasOAuthCallbackParams } from "@/features/auth/services/auth.service";

type CallbackStatus = "loading" | "success" | "cancelled" | "error";

export default function AuthCallbackRoute() {
  const router = useRouter();
  const url = Linking.useURL();
  const [message, setMessage] = useState("Procesando autenticación…");
  const [status, setStatus] = useState<CallbackStatus>("loading");

  useEffect(() => {
    if (!url || !hasOAuthCallbackParams(url)) {
      return;
    }

    let active = true;

    void createSessionFromUrl(url)
      .then(async result => {
        if (!active) {
          return;
        }

        if (result === "success") {
          const pendingEmailConversion = await getPendingAnonymousEmailConversion();

          if (pendingEmailConversion) {
            router.replace("/onboarding/completar-cuenta" as Href);
            return;
          }

          router.replace("/(tabs)/empezar" as Href);
          return;
        }

        setStatus(result);
        setMessage("Autenticación cancelada.");
      })
      .catch(error => {
        if (!active) {
          return;
        }

        setStatus("error");
        setMessage(getAuthErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [router, url]);

  return (
    <View style={styles.container}>
      {status === "loading" ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text accessibilityRole={status === "error" ? "alert" : "header"} style={[styles.title, status === "error" && styles.error]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  error: {
    color: colors.error,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: "center",
  },
});
