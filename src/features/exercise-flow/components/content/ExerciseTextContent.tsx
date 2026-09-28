import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseContentHeading } from "@/features/exercise-flow/components/content/ExerciseContentHeading";

type Props = {
  text: string;
  title: string;
};

export function ExerciseTextContent({ text, title }: Props) {
  return (
    <>
      <ExerciseContentHeading label="Texto" />
      <View style={styles.surface}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 18, paddingHorizontal: 20, paddingVertical: 18, width: "100%" },
  text: { color: "#6F756C", fontFamily: fonts.titleItalic, fontSize: 17, lineHeight: 25, marginTop: 10, textAlign: "justify" },
  title: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 21, textAlign: "center" },
});
