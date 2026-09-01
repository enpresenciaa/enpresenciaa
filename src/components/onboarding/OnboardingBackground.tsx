import type { ImageContentPosition, ImageSource } from "expo-image";
import type { ReactNode } from "react";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/config/onboarding-theme";

type Props = {
  backgroundColor?: string;
  children?: ReactNode;
  contentFit?: "contain" | "cover";
  contentPosition?: ImageContentPosition;
  source: ImageSource;
};

export function OnboardingBackground({ backgroundColor, children, contentFit = "cover", contentPosition = "center", source }: Props) {
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const fallbackColor = backgroundColor ?? colors.background;

  return (
    <View style={[styles.container, { backgroundColor: fallbackColor }]}>
      <Image
        contentFit={contentFit}
        contentPosition={contentPosition}
        onDisplay={() => setIsBackgroundReady(true)}
        onError={() => setIsBackgroundReady(true)}
        source={source}
        style={StyleSheet.absoluteFill}
        transition={0}
      />
      {isBackgroundReady ? children : (
        <View pointerEvents="none" style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
