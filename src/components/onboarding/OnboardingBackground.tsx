import type { ImageSource } from "expo-image";
import type { ReactNode } from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type Props = { children?: ReactNode; source: ImageSource };

export function OnboardingBackground({ children, source }: Props) {
  return (
    <View style={styles.container}>
      <Image contentFit="cover" source={source} style={StyleSheet.absoluteFill} transition={0} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
