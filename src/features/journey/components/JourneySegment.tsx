import type { ImageSource } from "expo-image";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { FAVORITE_STAR_TOUCH_SIZE, FavoriteStar } from "@/features/journey/components/FavoriteStar";
import type { JourneyExerciseState, JourneyExerciseStatus } from "@/features/journey/domain/journey.types";
import type { JourneySegment as JourneySegmentModel } from "@/features/journey/utils/journey-segments";

// Width of the visible cave drawing; its height follows each drawing's real proportion.
const CAVE_VISIBLE_WIDTH = 76;
type CaveIcon = {
  source: ImageSource;
  /** Intrinsic PNG size. */
  size: { height: number; width: number };
  /** Opaque bounds inside the PNG; the files carry uneven transparent margins. */
  visible: { bottom: number; left: number; right: number; top: number };
};

const journeyNodeIcons: readonly CaveIcon[] = [
  { size: { height: 153, width: 167 }, source: require("../../../../assets/images/CUEVA CAMINO1.png"), visible: { bottom: 121, left: 35, right: 134, top: 40 } },
  { size: { height: 160, width: 192 }, source: require("../../../../assets/images/CUEVA CAMINO1.1.png"), visible: { bottom: 143, left: 25, right: 164, top: 25 } },
  { size: { height: 181, width: 195 }, source: require("../../../../assets/images/CUEVA CAMINO2.png"), visible: { bottom: 149, left: 19, right: 154, top: 33 } },
  { size: { height: 164, width: 188 }, source: require("../../../../assets/images/CUEVA CAMINO2.2.png"), visible: { bottom: 147, left: 18, right: 153, top: 25 } },
];

// Caves alternate within their family (1 ↔ 1.1, 2 ↔ 2.2); the family follows the background.
function getCaveIcon(backgroundVariant: number, globalPosition: number) {
  const familyStart = backgroundVariant < 2 ? 0 : 2;
  return journeyNodeIcons[familyStart + (globalPosition % 2 === 1 ? 0 : 1)];
}

function getCaveLayout(icon: CaveIcon) {
  const visibleWidth = icon.visible.right - icon.visible.left + 1;
  const visibleHeight = icon.visible.bottom - icon.visible.top + 1;
  const scale = CAVE_VISIBLE_WIDTH / visibleWidth;

  return {
    frame: { height: visibleHeight * scale, width: CAVE_VISIBLE_WIDTH },
    image: {
      height: icon.size.height * scale,
      left: -icon.visible.left * scale,
      top: -icon.visible.top * scale,
      width: icon.size.width * scale,
    },
  };
}

export const JOURNEY_STATUS_LABELS: Record<JourneyExerciseStatus, string> = {
  available: "Disponible",
  completed: "Completado",
  future: "Próximamente",
  locked_today: "Disponible mañana",
};

type JourneySlot = { x: number; y: number };

// Path centreline measured on the 900×1900 backgrounds; the four variants share the same path.
const PATH_SLOTS: readonly JourneySlot[] = [
  { x: 0.602, y: 0.86 },
  { x: 0.556, y: 0.68 },
  { x: 0.581, y: 0.49 },
  { x: 0.484, y: 0.31 },
  { x: 0.658, y: 0.13 },
];

export const JOURNEY_SLOT_PATTERNS: readonly (readonly JourneySlot[])[] = [PATH_SLOTS, PATH_SLOTS, PATH_SLOTS, PATH_SLOTS];

export type JourneyFavoriteChange = { exerciseId: string; isFavorite: boolean };

type Props = {
  backgroundSource: ImageSource;
  height: number;
  onOpenExercise: (exerciseId: string) => void;
  onToggleFavorite: (change: JourneyFavoriteChange) => void;
  /** Favourite change awaiting the server; shown optimistically. */
  pendingFavorite: JourneyFavoriteChange | null;
  segment: JourneySegmentModel;
  width: number;
};

function JourneyExerciseNode({ exercise, icon, onOpen }: {
  exercise: JourneyExerciseState;
  icon: CaveIcon;
  onOpen: () => void;
}) {
  const layout = getCaveLayout(icon);
  const canOpen = exercise.status === "available" || exercise.status === "completed";

  return (
    <Pressable
      accessibilityHint={canOpen ? "Abre el detalle del ejercicio" : undefined}
      accessibilityLabel={`Ejercicio ${exercise.globalPosition}: ${exercise.title}, ${JOURNEY_STATUS_LABELS[exercise.status]}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !canOpen }}
      disabled={!canOpen}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.exerciseButton,
        layout.frame,
        styles[`exerciseButton_${exercise.status}`],
        pressed && canOpen ? styles.pressed : null,
      ]}
    >
      <Image accessible={false} contentFit="fill" source={icon.source} style={[styles.exerciseIcon, layout.image]} transition={0} />
      <Text style={[styles.position, exercise.status === "available" ? styles.positionAvailable : null]}>{exercise.globalPosition}</Text>
    </Pressable>
  );
}

export function JourneySegment({ backgroundSource, height, onOpenExercise, onToggleFavorite, pendingFavorite, segment, width }: Props) {
  const slots = JOURNEY_SLOT_PATTERNS[segment.backgroundVariant] ?? JOURNEY_SLOT_PATTERNS[0];

  return (
    <View style={[styles.segment, { height, width }]}>
      <Image accessible={false} contentFit="cover" source={backgroundSource} style={StyleSheet.absoluteFill} transition={0} />
      {segment.exercises.map(({ exercise, slotIndex }) => {
        const slot = slots[slotIndex];
        const icon = getCaveIcon(segment.backgroundVariant, exercise.globalPosition);
        const { frame } = getCaveLayout(icon);
        const isPending = pendingFavorite?.exerciseId === exercise.id;
        const isFavorite = isPending ? pendingFavorite.isFavorite : exercise.isFavorite;
        return (
          <View
            key={exercise.id}
            style={[
              styles.node,
              {
                // Centre the visible drawing on the path, not the padded PNG.
                left: slot.x * width - frame.width / 2,
                top: slot.y * height - frame.height / 2,
              },
            ]}
          >
            <JourneyExerciseNode
              exercise={exercise}
              icon={icon}
              onOpen={() => onOpenExercise(exercise.id)}
            />
            <FavoriteStar
              disabled={pendingFavorite !== null}
              isFavorite={isFavorite}
              onToggle={() => onToggleFavorite({ exerciseId: exercise.id, isFavorite: !isFavorite })}
              style={styles.star}
              subject={`ejercicio ${exercise.globalPosition}`}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseButton: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  exerciseButton_available: { opacity: 1 },
  exerciseButton_completed: { opacity: 1 },
  exerciseButton_future: { opacity: 0.58 },
  exerciseButton_locked_today: { opacity: 0.58 },
  exerciseIcon: { position: "absolute" },
  node: { position: "absolute" },
  position: { color: colors.buttonText, fontFamily: fonts.bodySemiBold, fontSize: 14, textShadowColor: "#182119", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 2 },
  positionAvailable: { color: colors.buttonText },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  segment: { backgroundColor: "#17261D", position: "relative" },
  // Top-right corner, set apart from the cave so it doesn't cover the drawing.
  star: {
    position: "absolute",
    right: -FAVORITE_STAR_TOUCH_SIZE * 0.72,
    top: -FAVORITE_STAR_TOUCH_SIZE * 0.58,
  },
});
