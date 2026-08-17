import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";

export default function ExerciseDetailRoute() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable accessibilityLabel="Regresar" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Ionicons color={colors.primary} name="arrow-back" size={28} />
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Ejercicio actual</Text>
        <Text accessibilityRole="header" style={styles.title}>{exerciseId}</Text>
        <Text style={styles.body}>Esta pantalla queda preparada para recibir el contenido del ejercicio.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", height: 48, justifyContent: "center", marginLeft: 16, marginTop: 8, width: 48 },
  body: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: "center" },
  content: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  eyebrow: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 32, marginTop: 4 },
});
