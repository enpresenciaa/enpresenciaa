import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import type { DeveloperDataSource } from "@/features/developer-mocks/context/DeveloperMocksContext";
import { useDeveloperMocks } from "@/features/developer-mocks/hooks/useDeveloperMocks";

type ScenarioCardProps = {
  active: boolean;
  description: string;
  onPress: () => void;
  title: string;
};

function ScenarioCard({ active, description, onPress, title }: ScenarioCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.scenario, active ? styles.scenarioActive : null, pressed ? styles.pressed : null]}
    >
      <View style={styles.scenarioCopy}>
        <Text style={styles.scenarioTitle}>{title}</Text>
        <Text style={styles.scenarioDescription}>{description}</Text>
      </View>
      <Ionicons color={active ? colors.primary : colors.border} name={active ? "checkmark-circle" : "ellipse-outline"} size={28} />
    </Pressable>
  );
}

export default function DeveloperMocksRoute() {
  const router = useRouter();
  const { dataSource, setDataSource } = useDeveloperMocks();

  if (!__DEV__) {
    return <Redirect href="/(tabs)/yo" />;
  }

  function select(source: DeveloperDataSource) {
    setDataSource(source);
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Regresar" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Ionicons color={colors.primary} name="arrow-back" size={28} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={styles.title}>Laboratorio de mocks</Text>
          <Text style={styles.subtitle}>Datos locales, reversibles y sin escrituras en Supabase.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Fuente de datos</Text>
        <View accessibilityRole="radiogroup" style={styles.scenarios}>
          <ScenarioCard
            active={dataSource === "real"}
            description="Usa el catálogo y progreso de la sesión actual."
            onPress={() => select("real")}
            title="Datos reales"
          />
          <ScenarioCard
            active={dataSource === "journey-demo"}
            description="20 ejercicios y una Bitácora coherente con progreso, emociones, reflexiones y calendario."
            onPress={() => select("journey-demo")}
            title="Camino + Bitácora"
          />
        </View>

        <View style={styles.notice}>
          <Ionicons color="#7A6200" name="flask-outline" size={22} />
          <Text style={styles.noticeText}>Al volver a activar “Camino + Bitácora”, el escenario recupera su estado inicial.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={dataSource !== "journey-demo"}
          onPress={() => router.push("/(tabs)/empezar/camino" as Href)}
          style={({ pressed }) => [styles.openButton, dataSource !== "journey-demo" ? styles.openButtonDisabled : null, pressed ? styles.pressed : null]}
        >
          <Text style={styles.openButtonText}>Abrir Camino de prueba</Text>
          <Ionicons color="#FFFFFF" name="arrow-forward" size={22} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={dataSource !== "journey-demo"}
          onPress={() => router.push("/(tabs)/para-ti/bitacora" as Href)}
          style={({ pressed }) => [styles.openButton, styles.openButtonSecondary, dataSource !== "journey-demo" ? styles.openButtonDisabled : null, pressed ? styles.pressed : null]}
        >
          <Text style={[styles.openButtonText, styles.openButtonSecondaryText]}>Abrir Bitácora de prueba</Text>
          <Ionicons color={colors.primary} name="arrow-forward" size={22} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: "center", height: 48, justifyContent: "center", width: 48 },
  content: { alignSelf: "center", maxWidth: 600, paddingBottom: 40, paddingHorizontal: 24, paddingTop: 22, width: "100%" },
  header: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 8, paddingBottom: 16, paddingHorizontal: 12 },
  headerCopy: { flex: 1 },
  notice: { alignItems: "flex-start", backgroundColor: "#FFF7DB", borderRadius: 14, flexDirection: "row", gap: 10, marginTop: 20, padding: 16 },
  noticeText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  openButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 26, flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 24, minHeight: 52, paddingHorizontal: 22 },
  openButtonDisabled: { opacity: 0.42 },
  openButtonSecondary: { backgroundColor: "#FFFFFF", borderColor: colors.primary, borderWidth: 1.5, marginTop: 12 },
  openButtonSecondaryText: { color: colors.primary },
  openButtonText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 15 },
  pressed: { opacity: 0.7 },
  scenario: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 14, minHeight: 94, padding: 16 },
  scenarioActive: { backgroundColor: "#F5F1DF", borderColor: colors.primary, borderWidth: 2 },
  scenarioCopy: { flex: 1 },
  scenarioDescription: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 4 },
  scenarios: { gap: 12 },
  scenarioTitle: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 17 },
  screen: { backgroundColor: colors.background, flex: 1 },
  sectionTitle: { color: colors.text, fontFamily: fonts.title, fontSize: 24, marginBottom: 12 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 25 },
});
