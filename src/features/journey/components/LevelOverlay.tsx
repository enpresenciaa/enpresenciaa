import { StyleSheet, View } from "react-native";

import { LevelNode } from "@/features/journey/components/LevelNode";
import type { MapLevel } from "@/features/journey/types";

interface LevelOverlayProps {
  currentLevelId?: string;
  levels: MapLevel[];
  mapHeight: number;
  mapWidth: number;
  onPressLevel: (level: MapLevel) => void;
}

export function LevelOverlay({ currentLevelId, levels, mapHeight, mapWidth, onPressLevel }: LevelOverlayProps) {
  return (
    <View pointerEvents="box-none" style={[styles.overlay, { height: mapHeight, width: mapWidth }]}>
      {levels.map(level => (
        <LevelNode
          isCurrent={level.id === currentLevelId}
          key={level.id}
          level={level}
          onPress={() => onPressLevel(level)}
          x={mapWidth * (level.positionX + (level.nodeOffsetX ?? 0))}
          y={mapHeight * (level.positionY + (level.nodeOffsetY ?? 0))}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { left: 0, position: "absolute", top: 0 },
});
