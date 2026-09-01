import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

export function MapLoadingState({ error = false }: { error?: boolean }) {
  return (
    <View accessibilityLabel={error ? "No fue posible cargar el mapa del camino" : "Cargando mapa del camino"} style={styles.container}>
      {error ? null : <ActivityIndicator color={colors.primary} />}
      <Text style={styles.label}>{error ? "No fue posible mostrar el mapa. Intenta volver a entrar." : "Preparando tu camino..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, alignItems: "center", backgroundColor: colors.background, justifyContent: "center", zIndex: 3 },
  label: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginTop: 10, maxWidth: 260, textAlign: "center" },
});
