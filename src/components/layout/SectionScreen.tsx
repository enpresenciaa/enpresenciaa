import type { ReactNode } from "react";
import type { ImageSource } from "expo-image";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SectionScreenProps = {
  backgroundSource?: ImageSource;
  children?: ReactNode;
  title: string;
};

export function SectionScreen({ backgroundSource, children, title }: SectionScreenProps) {
  return (
    <View className="flex-1 bg-background">
      {backgroundSource ? <Image contentFit="cover" source={backgroundSource} style={StyleSheet.absoluteFill} /> : null}
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-3 text-sm font-medium text-text-secondary">Vista actual: {title}</Text>
          <Text className="text-3xl font-semibold text-text">{title}</Text>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
