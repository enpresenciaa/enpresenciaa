import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import { BackButton } from "./BackButton";

type Props = { children: ReactNode; compact?: boolean; description?: string; title: string };

export function OnboardingScreen({ children, compact = false, description, title }: Props) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <BackButton />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.content, compact && styles.compactContent]} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
            {description ? <Text style={[styles.description, compact && styles.compactDescription]}>{description}</Text> : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { maxWidth: 560, width: "100%" },
  compactContent: { justifyContent: "flex-start", paddingBottom: 20, paddingTop: 68 },
  compactDescription: { fontSize: 13, lineHeight: 19, marginBottom: 28, marginTop: 2, textAlign: "center" },
  compactTitle: { fontSize: 30, lineHeight: 35, marginBottom: 24 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginBottom: 26, marginTop: 10 },
  flex: { flex: 1 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 34, lineHeight: 41, marginBottom: 28, textAlign: "center" },
});
