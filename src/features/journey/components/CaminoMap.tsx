import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
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
  JOURNEY_CAMERA_X_FOLLOW,
  JOURNEY_MAP_WIDTH_RATIO,
  JOURNEY_TOP_CAMERA_BLEND_DISTANCE,
  JOURNEY_TOP_LEVEL_VIEWPORT_ANCHOR,
  LEVEL_FOCUS_DURATION,
  LEVEL_FOCUS_SCALE,
  LEVEL_SNAP_FOCUS_DURATION,
  LEVEL_SNAP_FOCUS_SCALE,
  MAP_ASPECT_RATIO,
} from "@/features/journey/constants/map-layout.constants";
import type { JourneyPerspective, MapLevel } from "@/features/journey/types";
import { LevelOverlay } from "./LevelOverlay";
import { MapBackground } from "./MapBackground";
import { MapLoadingState } from "./MapLoadingState";

interface CaminoMapProps {
  currentLevelId?: string;
  levels: MapLevel[];
  onLevelFocusComplete: () => void;
  onPressLevel: (level: MapLevel) => void;
  perspective: JourneyPerspective;
  selectedLevelId?: string;
}

function getNodePositionX(level: MapLevel): number {
  return level.positionX + (level.nodeOffsetX ?? 0);
}

function getNodePositionY(level: MapLevel): number {
  return level.positionY + (level.nodeOffsetY ?? 0);
}

export function CaminoMap({
  currentLevelId,
  levels,
  onLevelFocusComplete,
  onPressLevel,
  perspective,
  selectedLevelId,
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
  const focusProgress = useSharedValue(0);
  const snapFocusProgress = useSharedValue(0);
  const snapTargetX = useSharedValue(0);
  const snapTargetY = useSharedValue(0);

  const orderedLevels = useMemo(() => [...levels].sort((a, b) => getNodePositionY(a) - getNodePositionY(b)), [levels]);
  const mapWidth = windowWidth * JOURNEY_MAP_WIDTH_RATIO;
  const mapHeight = mapWidth * MAP_ASPECT_RATIO;
  const contentHeight = mapHeight;
  const currentLevel = useMemo(() => levels.find(level => level.id === currentLevelId), [currentLevelId, levels]);
  const selectedLevel = useMemo(() => levels.find(level => level.id === selectedLevelId), [levels, selectedLevelId]);
  const maximumOffset = Math.max(0, contentHeight - viewportHeight);
  const currentOffset = currentLevel ?
      Math.max(0, Math.min(maximumOffset, mapHeight * getNodePositionY(currentLevel) - viewportHeight * CURRENT_LEVEL_VIEWPORT_ANCHOR)) :
    maximumOffset;
  const scenePrepared = imageReady && !mapFailed && viewportHeight > 0;
  const levelYs = orderedLevels.map(level => mapHeight * getNodePositionY(level));
  const levelSnapOffsets = useMemo(() => {
    const offsets = orderedLevels.map(level => Math.max(
      0,
      Math.min(
        maximumOffset,
        mapHeight * getNodePositionY(level) - viewportHeight * CURRENT_LEVEL_VIEWPORT_ANCHOR,
      ),
    ));

    return offsets.filter((offset, index) => index === 0 || Math.abs(offset - offsets[index - 1]) > 1);
  }, [mapHeight, maximumOffset, orderedLevels, viewportHeight]);
  const cameraXs = orderedLevels.map(level => {
    const softenedPositionX = 0.5 + (getNodePositionX(level) - 0.5) * JOURNEY_CAMERA_X_FOLLOW;
    return windowWidth / 2 - mapWidth * softenedPositionX;
  });
  const topCameraPositionX = orderedLevels.length > 1 ?
      (getNodePositionX(orderedLevels[0]) + getNodePositionX(orderedLevels[1])) / 2 :
    orderedLevels.length > 0 ? getNodePositionX(orderedLevels[0]) : 0.5;
  const topCameraX = windowWidth / 2 - mapWidth * topCameraPositionX;
  const topLevelY = orderedLevels.length > 0 ? mapHeight * getNodePositionY(orderedLevels[0]) : 0;
  const selectedX = selectedLevel ? mapWidth * getNodePositionX(selectedLevel) : mapWidth / 2;
  const selectedY = selectedLevel ? mapHeight * getNodePositionY(selectedLevel) : mapHeight / 2;

  useDerivedValue(() => {
    if (introRunning.value) {
      scrollTo(scrollRef, 0, introOffset.value, false);
    }
  });

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const sceneStyle = useAnimatedStyle(() => {
    const cameraY = scrollY.value + viewportHeight * CURRENT_LEVEL_VIEWPORT_ANCHOR;
    const pathX = levelYs.length > 1 ?
        interpolate(cameraY, levelYs, cameraXs, Extrapolation.CLAMP) :
        (windowWidth - mapWidth) / 2;
    const topBlend = Math.min(1, scrollY.value / Math.max(1, viewportHeight * JOURNEY_TOP_CAMERA_BLEND_DISTANCE));
    const journeyX = interpolate(topBlend, [0, 1], [topCameraX, pathX]);
    const topCameraY = viewportHeight * JOURNEY_TOP_LEVEL_VIEWPORT_ANCHOR - topLevelY;
    const journeyY = interpolate(topBlend, [0, 1], [topCameraY, 0]);
    const focusX = windowWidth / 2 - selectedX * LEVEL_FOCUS_SCALE;
    const focusY = scrollY.value + viewportHeight * 0.48 - selectedY * LEVEL_FOCUS_SCALE;
    const snapFocusX = windowWidth / 2 - snapTargetX.value * LEVEL_SNAP_FOCUS_SCALE;
    const snapFocusY = scrollY.value + viewportHeight * CURRENT_LEVEL_VIEWPORT_ANCHOR - snapTargetY.value * LEVEL_SNAP_FOCUS_SCALE;
    const snappedX = interpolate(snapFocusProgress.value, [0, 1], [journeyX, snapFocusX]);
    const snappedY = interpolate(snapFocusProgress.value, [0, 1], [journeyY, snapFocusY]);
    const snappedScale = interpolate(snapFocusProgress.value, [0, 1], [1, LEVEL_SNAP_FOCUS_SCALE]);

    return {
      transform: [
        { translateX: interpolate(focusProgress.value, [0, 1], [snappedX, focusX]) },
        { translateY: interpolate(focusProgress.value, [0, 1], [snappedY, focusY]) },
        { scale: interpolate(focusProgress.value, [0, 1], [snappedScale, LEVEL_FOCUS_SCALE]) },
      ],
      transformOrigin: [0, 0, 0],
    };
  }, [cameraXs, levelYs, mapWidth, selectedX, selectedY, topCameraX, topLevelY, viewportHeight, windowWidth]);

  useEffect(() => {
    if (!scenePrepared || preparedOnceRef.current) {
      return;
    }
    preparedOnceRef.current = true;
    introOffset.set(0);
    scrollRef.current?.scrollTo({ animated: false, y: reduceMotion ? currentOffset : 0 });
  }, [currentOffset, introOffset, reduceMotion, scenePrepared, scrollRef]);

  useEffect(() => {
    if (perspective !== "level-focus" || !selectedLevel) {
      focusProgress.set(0);
      return;
    }
    snapFocusProgress.set(0);
    focusProgress.set(withTiming(
      1,
      { duration: reduceMotion ? 80 : LEVEL_FOCUS_DURATION, easing: Easing.out(Easing.cubic) },
      finished => {
        if (finished) {
          runOnJS(onLevelFocusComplete)();
        }
      },
    ));
  }, [focusProgress, onLevelFocusComplete, perspective, reduceMotion, selectedLevel, snapFocusProgress]);

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

  function handleScrollBeginDrag() {
    snapFocusProgress.set(withTiming(0, {
      duration: reduceMotion ? 60 : LEVEL_SNAP_FOCUS_DURATION / 2,
      easing: Easing.out(Easing.quad),
    }));
  }

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (orderedLevels.length === 0) {
      return;
    }

    const cameraY = event.nativeEvent.contentOffset.y + viewportHeight * CURRENT_LEVEL_VIEWPORT_ANCHOR;
    const closestLevel = orderedLevels.reduce((closest, level) => (
      Math.abs(mapHeight * getNodePositionY(level) - cameraY) < Math.abs(mapHeight * getNodePositionY(closest) - cameraY) ? level : closest
    ));

    snapTargetX.set(mapWidth * getNodePositionX(closestLevel));
    snapTargetY.set(mapHeight * getNodePositionY(closestLevel));
    snapFocusProgress.set(withTiming(1, {
      duration: reduceMotion ? 80 : LEVEL_SNAP_FOCUS_DURATION,
      easing: Easing.out(Easing.cubic),
    }));
  }

  const scrollEnabled = revealComplete && introComplete && perspective === "journey";

  return (
    <View onLayout={handleLayout} style={styles.container}>
      {viewportHeight > 0 ? (
        <Animated.ScrollView
          bounces={false}
          contentContainerStyle={{ height: contentHeight }}
          decelerationRate="fast"
          disableIntervalMomentum
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={scrollHandler}
          onScrollBeginDrag={handleScrollBeginDrag}
          ref={scrollRef}
          scrollEnabled={scrollEnabled}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToOffsets={levelSnapOffsets}
          style={styles.scroll}
        >
          <View style={{ height: contentHeight, overflow: "hidden", width: windowWidth }}>
            <Animated.View
              pointerEvents={perspective === "journey" && revealComplete ? "auto" : "none"}
              style={[styles.scene, { height: mapHeight, width: mapWidth }, sceneStyle]}
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
            </Animated.View>
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
  scene: { left: 0, position: "absolute", top: 0 },
  scroll: { backgroundColor: colors.background, flex: 1 },
});
