import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

type Props = {
  /** Modality indicator, e.g. "Audio". */
  label: string;
  /** Published content name, shown under the indicator when the modality has no inner title. */
  title?: string;
};

export function ExerciseContentHeading({ label, title }: Props) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.label}>{label}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 18, width: "100%" },
  label: { color: colors.text, fontFamily: fonts.titleBold, fontSize: 30, lineHeight: 38, textAlign: "center" },
  title: { color: "#6F756C", fontFamily: fonts.titleItalic, fontSize: 19, lineHeight: 26, marginTop: 6, textAlign: "center" },
});
