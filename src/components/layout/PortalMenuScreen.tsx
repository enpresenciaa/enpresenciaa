import type { ImageContentPosition, ImageSource } from "expo-image";
import type { StyleProp, TextStyle } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { colors, fonts } from "@/config/onboarding-theme";

type PortalMenuItem = {
  accessibilityLabel: string;
  disabled?: boolean;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  onPress: () => void;
};

type Props = {
  backgroundSource: ImageSource;
  contentPosition?: ImageContentPosition;
  items: PortalMenuItem[];
  overlayColor: string;
};

export function PortalMenuScreen({ backgroundSource, contentPosition = "center", items, overlayColor }: Props) {
  return (
    <OnboardingBackground contentPosition={contentPosition} source={backgroundSource}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.menu}>
            {items.map(item => (
              <Pressable
                accessibilityLabel={item.accessibilityLabel}
                accessibilityRole="button"
                accessibilityState={{ disabled: item.disabled }}
                disabled={item.disabled}
                key={item.label}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.button,
                  pressed && !item.disabled ? styles.buttonPressed : null,
                  item.disabled ? styles.buttonDisabled : null,
                ]}
              >
                <Text style={[styles.buttonLabel, item.labelStyle, item.disabled ? styles.buttonLabelDisabled : null]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "100%",
  },
  buttonDisabled: { opacity: 0.55 },
  buttonLabel: {
    color: "#D9C078",
    flexShrink: 1,
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
  },
  buttonLabelDisabled: { color: "rgba(217, 192, 120, 0.72)" },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  content: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 36,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  menu: { gap: 18, maxWidth: 360, width: "100%" },
  safeArea: { flex: 1 },
});
