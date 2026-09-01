import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/config/onboarding-theme";
import { CloudReveal } from "@/features/journey/components/CloudReveal";
import {
  CINEMATIC_ENTRY_DURATION,
  CURRENT_LEVEL_VIEWPORT_ANCHOR,
  JOURNEY_MAP_WIDTH_RATIO,
  MAP_ASPECT_RATIO,
} from "@/features/journey/constants/map-layout.constants";
import type { MapLevel } from "@/features/journey/types";
import { LevelOverlay } from "./LevelOverlay";
import { MapBackground } from "./MapBackground";
import { MapLoadingState } from "./MapLoadingState";

interface CaminoMapProps {
  currentLevelId?: string;
  levels: MapLevel[];
  onPressLevel: (level: MapLevel) => void;
}

function getNodePositionY(level: MapLevel): number {
  return level.positionY + (level.nodeOffsetY ?? 0);
}

export function CaminoMap({
  currentLevelId,
  levels,
  onPressLevel,
}: CaminoMapProps) {
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const reduceMotion = useReducedMotion();
  const preparedOnceRef = useRef(false);
  const [imageReady, setImageReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollY = useSharedValue(0);
  const introOffset = useSharedValue(0);
  const introRunning = useSharedValue(false);

  const mapWidth = windowWidth * JOURNEY_MAP_WIDTH_RATIO;
  const mapHeight = mapWidth * MAP_ASPECT_RATIO;
  const contentHeight = mapHeight;
  const currentLevel = useMemo(() => levels.find(level => level.id === currentLevelId), [currentLevelId, levels]);
  const maximumOffset = Math.max(0, contentHeight - viewportHeight);
  const currentOffset = currentLevel ?
      Math.max(0, Math.min(maximumOffset, mapHeight * getNodePositionY(currentLevel) - viewportHeight * CURRENT_LEVEL_VIEWPORT_ANCHOR)) :
    maximumOffset;
  const scenePrepared = imageReady && !mapFailed && viewportHeight > 0;
  const centeredCameraX = (windowWidth - mapWidth) / 2;

  useDerivedValue(() => {
    if (introRunning.value) {
      scrollTo(scrollRef, 0, introOffset.value, false);
    }
  });

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (!scenePrepared || preparedOnceRef.current) {
      return;
    }
    preparedOnceRef.current = true;
    introOffset.set(0);
    scrollRef.current?.scrollTo({ animated: false, y: reduceMotion ? currentOffset : 0 });
  }, [currentOffset, introOffset, reduceMotion, scenePrepared, scrollRef]);

  const startCinematicEntry = useCallback(() => {
    setRevealComplete(true);
    if (reduceMotion) {
      scrollRef.current?.scrollTo({ animated: false, y: currentOffset });
      setIntroComplete(true);
      return;
    }
    introRunning.set(true);
    introOffset.set(withTiming(
      currentOffset,
      { duration: CINEMATIC_ENTRY_DURATION, easing: Easing.bezier(0.18, 0.78, 0.24, 1) },
      () => {
        introRunning.value = false;
        runOnJS(setIntroComplete)(true);
      },
    ));
  }, [currentOffset, introOffset, introRunning, reduceMotion, scrollRef]);

  function handleLayout(event: LayoutChangeEvent) {
    setViewportHeight(event.nativeEvent.layout.height);
  }

  function handleMapError() {
    setMapFailed(true);
    setImageReady(false);
  }

  const scrollEnabled = revealComplete && introComplete;

  return (
    <View onLayout={handleLayout} style={styles.container}>
      {viewportHeight > 0 ? (
        <Animated.ScrollView
          bounces={false}
          contentContainerStyle={{ height: contentHeight }}
          decelerationRate="fast"
          onScroll={scrollHandler}
          overScrollMode="never"
          ref={scrollRef}
          scrollEnabled={scrollEnabled}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={{ height: contentHeight, overflow: "hidden", width: windowWidth }}>
            <View
              pointerEvents={revealComplete ? "auto" : "none"}
              style={[styles.scene, { height: mapHeight, left: centeredCameraX, width: mapWidth }]}
            >
              <MapBackground height={mapHeight} onError={handleMapError} onReady={() => setImageReady(true)} width={mapWidth} />
              {scenePrepared && !mapFailed ? (
                <LevelOverlay
                  currentLevelId={currentLevelId}
                  levels={levels}
                  mapHeight={mapHeight}
                  mapWidth={mapWidth}
                  onPressLevel={onPressLevel}
                />
              ) : null}
            </View>
          </View>
        </Animated.ScrollView>
      ) : null}
      {!scenePrepared && !mapFailed ? <MapLoadingState /> : null}
      {mapFailed ? <MapLoadingState error /> : null}
      {scenePrepared && !mapFailed && !revealComplete ? (
        <CloudReveal onRevealComplete={startCinematicEntry} reduceMotion={reduceMotion} reveal />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, overflow: "hidden" },
  scene: { position: "absolute", top: 0 },
  scroll: { backgroundColor: colors.background, flex: 1 },
});
