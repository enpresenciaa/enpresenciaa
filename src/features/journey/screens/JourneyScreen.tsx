import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FlatList as FlatListType, LayoutChangeEvent } from "react-native";
import { FlatList, PixelRatio, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import { JourneySegment } from "@/features/journey/components/JourneySegment";
import type { JourneyFavoriteChange } from "@/features/journey/components/JourneySegment";
import { useJourney, useSetExerciseFavorite } from "@/features/journey/hooks/useJourney";
import type { JourneySegment as JourneySegmentModel } from "@/features/journey/utils/journey-segments";
import { createJourneySegments, JOURNEY_EXERCISES_PER_SEGMENT } from "@/features/journey/utils/journey-segments";

const JOURNEY_BACKGROUND_ASPECT_RATIO = 900 / 1900;
const SEGMENT_OVERLAP = 1 / PixelRatio.get();

const backgrounds = [
  require("../../../../assets/images/CAMINO OBS. VENADO.png"),
  require("../../../../assets/images/CAMINO 1.png"),
  require("../../../../assets/images/CAMINO 2 CONEJO.png"),
  require("../../../../assets/images/CAMINO VENADO.png"),
] as const;

const emptyJourneyPreviewSegments: JourneySegmentModel[] = backgrounds.map((_, backgroundVariant) => ({
  backgroundVariant,
  exercises: [],
  key: `journey-empty-preview-${backgroundVariant}`,
}));

export function JourneyScreen() {
  const router = useRouter();
  const journey = useJourney();
  const favorite = useSetExerciseFavorite();
  // Stays pending until the journey refetch settles, so the star never flickers back.
  const pendingFavorite = favorite.isPending ? favorite.variables : null;
  const listRef = useRef<FlatListType<ReturnType<typeof createJourneySegments>[number]>>(null);
  const [listWidth, setListWidth] = useState(0);
  const exercises = useMemo(() => journey.data?.exercises ?? [], [journey.data?.exercises]);
  const segments = useMemo(() => createJourneySegments(exercises), [exercises]);
  const visibleSegments = segments.length > 0 ? segments : emptyJourneyPreviewSegments;
  const segmentHeight = listWidth > 0 ? PixelRatio.roundToNearestPixel(listWidth / JOURNEY_BACKGROUND_ASPECT_RATIO) : 0;
  const segmentStride = segmentHeight > 0 ? segmentHeight - SEGMENT_OVERLAP : 0;
  const currentExerciseIndex = exercises.findIndex(item => item.status === "available" || item.status === "locked_today");
  const initialSegmentIndex = segments.length === 0 ?
    0 :
      Math.min(
        Math.floor((currentExerciseIndex >= 0 ? currentExerciseIndex : exercises.length - 1) / JOURNEY_EXERCISES_PER_SEGMENT),
        segments.length - 1,
      );

  const handleListLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = PixelRatio.roundToNearestPixel(event.nativeEvent.layout.width);
    setListWidth(currentWidth => currentWidth === nextWidth ? currentWidth : nextWidth);
  }, []);

  const { isPending: isFavoritePending, mutate: setFavorite } = favorite;
  const handleToggleFavorite = useCallback((change: JourneyFavoriteChange) => {
    if (!isFavoritePending) {
      setFavorite(change);
    }
  }, [isFavoritePending, setFavorite]);

  const handleOpenExercise = useCallback((exerciseId: string) => {
    router.push({ pathname: "/exercise/[exerciseId]", params: { exerciseId } } as Href);
  }, [router]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      {journey.isPending ? <State icon="hourglass-outline" message="Preparando tu camino…" /> : null}
      {journey.isError ? <State action={() => void journey.refetch()} icon="cloud-offline-outline" message="No pudimos cargar tu camino. Revisa tu conexión." /> : null}
      {journey.isSuccess ? (
        <View onLayout={handleListLayout} style={styles.listContainer}>
          {listWidth > 0 && segmentStride > 0 ? (
            <FlatList
              data={visibleSegments}
              decelerationRate="fast"
              extraData={pendingFavorite}
              getItemLayout={(_, index) => ({ index, length: segmentStride, offset: segmentStride * index })}
              initialNumToRender={3}
              initialScrollIndex={initialSegmentIndex}
              inverted
              keyExtractor={segment => segment.key}
              maxToRenderPerBatch={3}
              onScrollToIndexFailed={({ index }) => {
                listRef.current?.scrollToOffset({ animated: false, offset: index * segmentStride });
              }}
              ref={listRef}
              renderItem={({ item }) => (
                <View style={{ marginBottom: -SEGMENT_OVERLAP }}>
                  <JourneySegment
                    backgroundSource={backgrounds[item.backgroundVariant]}
                    height={segmentHeight}
                    onOpenExercise={handleOpenExercise}
                    onToggleFavorite={handleToggleFavorite}
                    pendingFavorite={pendingFavorite}
                    segment={item}
                    width={listWidth}
                  />
                </View>
              )}
              showsVerticalScrollIndicator={false}
              windowSize={5}
            />
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function State({ action, icon, message }: { action?: () => void; icon: keyof typeof Ionicons.glyphMap; message: string }) {
  return (
    <View style={styles.state}>
      <Ionicons color={colors.primary} name={icon} size={40} />
      <Text style={styles.stateText}>{message}</Text>
      {action ? <Pressable accessibilityRole="button" onPress={action} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { backgroundColor: "#17261D", flex: 1 },
  retry: { backgroundColor: colors.primary, borderRadius: 22, marginTop: 18, paddingHorizontal: 24, paddingVertical: 11 },
  retryText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 14 },
  screen: { backgroundColor: colors.background, flex: 1 },
  state: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  stateText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 320, textAlign: "center" },
});
