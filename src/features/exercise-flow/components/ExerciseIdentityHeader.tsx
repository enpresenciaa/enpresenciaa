import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

type Props = {
  model: ExerciseFlowModel;
  onPhotoBackground?: boolean;
};

export function ExerciseIdentityHeader({ model, onPhotoBackground = false }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={[styles.level, onPhotoBackground && styles.onPhoto]}>{model.levelLabel}</Text>
        <Text style={[styles.door, onPhotoBackground && styles.onPhoto]}>{model.doorLabel}</Text>
      </View>
      <Ionicons accessibilityElementsHidden color={onPhotoBackground ? "#27351F" : colors.primary} importantForAccessibility="no" name="leaf-outline" size={28} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", minHeight: 58, paddingRight: 58 },
  copy: { flex: 1 },
  door: { color: colors.text, fontFamily: fonts.title, fontSize: 21, lineHeight: 27, marginTop: 1 },
  level: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 22 },
  onPhoto: { color: "#18251C" },
});
