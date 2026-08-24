import type { ImageContentPosition, ImageSource } from "expo-image";
import type { ReactNode } from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type Props = {
  backgroundColor?: string;
  children?: ReactNode;
  contentFit?: "contain" | "cover";
  contentPosition?: ImageContentPosition;
  source: ImageSource;
};

export function OnboardingBackground({ backgroundColor, children, contentFit = "cover", contentPosition = "center", source }: Props) {
  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : undefined]}>
      <Image contentFit={contentFit} contentPosition={contentPosition} source={source} style={StyleSheet.absoluteFill} transition={0} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
