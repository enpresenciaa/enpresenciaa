import { Image } from "expo-image";
import { StyleSheet } from "react-native";

const caminoBackground = require("../../../../assets/images/CaminoBG2.png");

interface MapBackgroundProps {
  height: number;
  onError: () => void;
  onReady: () => void;
  width: number;
}

export function MapBackground({ height, onError, onReady, width }: MapBackgroundProps) {
  return (
    <Image
      accessibilityLabel="Mapa del camino entre montañas"
      contentFit="contain"
      onDisplay={onReady}
      onError={onError}
      source={caminoBackground}
      style={[styles.image, { height, width }]}
      transition={0}
    />
  );
}

const styles = StyleSheet.create({
  image: { left: 0, position: "absolute", top: 0 },
});
