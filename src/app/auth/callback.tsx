import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { createSessionFromUrl, getAuthErrorMessage } from "@/features/auth/services/auth.service";

type CallbackStatus = "loading" | "success" | "cancelled" | "error";

export default function AuthCallbackRoute() {
  const url = Linking.useURL();
  const [message, setMessage] = useState("Procesando autenticación…");
  const [status, setStatus] = useState<CallbackStatus>("loading");

  useEffect(() => {
    if (!url) {
      return;
    }

    let active = true;

    void createSessionFromUrl(url)
      .then(result => {
        if (!active) {
          return;
        }

        setStatus(result);
        setMessage(result === "success" ? "Autenticación completada." : "Autenticación cancelada.");
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
  }, [url]);

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
