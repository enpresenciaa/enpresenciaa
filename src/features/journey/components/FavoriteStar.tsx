import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const STAR_SIZE = 40;
const STAR_HALO_SIZE = STAR_SIZE + 6;
export const FAVORITE_STAR_TOUCH_SIZE = STAR_HALO_SIZE;
// Plump five-point star in a 24×24 box with curved tips (quadratic corners).
const STAR_PATH = "M10.96 5.03 Q12.00 3.20 13.04 5.03 L14.38 7.41 Q15.06 8.59 16.39 8.87 L19.07 9.41 Q21.13 9.83 19.71 11.39 L17.87 13.40 Q16.95 14.41 17.10 15.76 L17.41 18.47 Q17.64 20.57 15.72 19.69 L13.24 18.56 Q12.00 18.00 10.76 18.56 L8.28 19.69 Q6.36 20.57 6.59 18.47 L6.90 15.76 Q7.05 14.41 6.13 13.40 L4.29 11.39 Q2.87 9.83 4.93 9.41 L7.61 8.87 Q8.94 8.59 9.62 7.41 Z";
const STAR_COLORS = {
  activeFill: "#FFD21F",
  inactiveFill: "#D3D1CB",
  // Dark goldenrod lightened halfway toward white.
  stroke: "#DCC285",
} as const;

/** The star shape alone, for static uses such as filter labels. */
export function FavoriteStarIcon({ active = true, size = 16 }: { active?: boolean; size?: number }) {
  return (
    <Svg accessibilityElementsHidden height={size} importantForAccessibility="no-hide-descendants" viewBox="0 0 24 24" width={size}>
      <Path
        d={STAR_PATH}
        fill={active ? STAR_COLORS.activeFill : STAR_COLORS.inactiveFill}
        stroke={STAR_COLORS.stroke}
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </Svg>
  );
}

type Props = {
  disabled?: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
  /** What the star refers to, used in its accessibility label, e.g. "ejercicio 3". */
  subject: string;
};

export function FavoriteStar({ disabled = false, isFavorite, onToggle, style, subject }: Props) {
  return (
    <Pressable
      accessibilityLabel={isFavorite ? `Quitar ${subject} de favoritos` : `Agregar ${subject} a favoritos`}
      accessibilityRole="button"
      accessibilityState={{ busy: disabled, checked: isFavorite }}
      disabled={disabled}
      hitSlop={10}
      onPress={onToggle}
      style={({ pressed }) => [styles.star, style, pressed ? styles.pressed : null]}
    >
      <View style={styles.halo} />
      <Svg height={STAR_SIZE} viewBox="0 0 24 24" width={STAR_SIZE}>
        <Path
          d={STAR_PATH}
          fill={isFavorite ? STAR_COLORS.activeFill : STAR_COLORS.inactiveFill}
          stroke={STAR_COLORS.stroke}
          strokeLinejoin="round"
          strokeWidth={1.2}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Very subtle rounded backdrop for contrast on busy backgrounds.
  halo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: STAR_HALO_SIZE / 2,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  star: {
    alignItems: "center",
    height: STAR_HALO_SIZE,
    justifyContent: "center",
    width: STAR_HALO_SIZE,
  },
});
