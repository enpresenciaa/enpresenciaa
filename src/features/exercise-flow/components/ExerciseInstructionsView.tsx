import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/onboarding/AppButton";
import { colors, fonts } from "@/config/onboarding-theme";
import { ExerciseDoorHeader } from "@/features/exercise-flow/components/ExerciseDoorHeader";
import { ExerciseFlowBackButton } from "@/features/exercise-flow/components/ExerciseFlowBackButton";
import type { ExerciseFlowModel } from "@/features/exercise-flow/exercise-flow.types";

const MIN_THUMB_HEIGHT = 36;

type Props = {
  model: ExerciseFlowModel;
  onBack: () => void;
  onStart: () => void;
};

export function ExerciseInstructionsView({ model, onBack, onStart }: Props) {
  const [scroll, setScroll] = useState({ contentHeight: 0, offset: 0, viewportHeight: 0 });
  const canScroll = scroll.contentHeight > scroll.viewportHeight + 1 && scroll.viewportHeight > 0;
  const thumbHeight = canScroll ? Math.max(MIN_THUMB_HEIGHT, (scroll.viewportHeight / scroll.contentHeight) * scroll.viewportHeight) : 0;
  const maxOffset = scroll.contentHeight - scroll.viewportHeight;
  const thumbTop = canScroll ? (Math.min(Math.max(scroll.offset, 0), maxOffset) / maxOffset) * (scroll.viewportHeight - thumbHeight) : 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ExerciseFlowBackButton onPress={onBack} />
      <ExerciseDoorHeader model={model} />

      <View style={styles.scrollArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          onContentSizeChange={(_, height) => setScroll(value => ({ ...value, contentHeight: height }))}
          onLayout={(event) => {
            const viewportHeight = event.nativeEvent.layout.height;
            setScroll(value => ({ ...value, viewportHeight }));
          }}
          onScroll={(event) => {
            const offset = event.nativeEvent.contentOffset.y;
            setScroll(value => ({ ...value, offset }));
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.guideHeading}>Frase Guía</Text>
          <Text style={styles.guide}>{model.guidePhrase}</Text>

          <Text accessibilityRole="header" style={styles.instructionsHeading}>Instrucciones</Text>
          <Text style={styles.instructions}>{model.instructions}</Text>

          <View style={styles.footer}><AppButton onPress={onStart}>Comenzar</AppButton></View>
        </ScrollView>

        {canScroll ? (
          <View pointerEvents="none" style={styles.scrollTrack}>
            <View style={[styles.scrollThumb, { height: thumbHeight, transform: [{ translateY: thumbTop }] }]} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const muted = "#6F756C";

const styles = StyleSheet.create({
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 560, paddingBottom: 28, paddingHorizontal: 22, paddingTop: 8, width: "100%" },
  // Sits at the bottom when the text is short and keeps a minimum gap when it scrolls.
  footer: { marginTop: "auto", paddingTop: 48, width: "100%" },
  guide: { color: muted, fontFamily: fonts.titleItalic, fontSize: 20, lineHeight: 28, marginTop: 24, textAlign: "center" },
  guideHeading: { color: colors.text, fontFamily: fonts.titleItalic, fontSize: 21, lineHeight: 28, textAlign: "center" },
  instructions: { color: muted, fontFamily: fonts.titleItalic, fontSize: 18, letterSpacing: 0.5, lineHeight: 26, marginTop: 18, textAlign: "justify" },
  instructionsHeading: { color: colors.text, fontFamily: fonts.titleBold, fontSize: 34, lineHeight: 42, marginTop: 32, textAlign: "center" },
  screen: { backgroundColor: colors.background, flex: 1 },
  scrollArea: { flex: 1, marginTop: 12 },
  scrollThumb: { backgroundColor: colors.primary, borderRadius: 3, width: "100%" },
  scrollTrack: { backgroundColor: "#C9CFC3", borderRadius: 3, bottom: 0, position: "absolute", right: 6, top: 0, width: 6 },
});
