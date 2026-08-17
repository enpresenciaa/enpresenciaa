import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

export const moods = [
  { color: "#D64545", icon: "emoticon-cry-outline", label: "Muy triste", value: "very-sad" },
  { color: "#E98232", icon: "emoticon-sad-outline", label: "Triste", value: "sad" },
  { color: "#E5BB32", icon: "emoticon-neutral-outline", label: "Serio", value: "neutral" },
  { color: "#9BCB3B", icon: "emoticon-happy-outline", label: "Feliz", value: "happy" },
  { color: "#3F9142", icon: "emoticon-excited-outline", label: "Muy feliz", value: "very-happy" },
] as const;

export type Mood = typeof moods[number]["value"];
type Props = { error?: string; onChange: (value: Mood) => void; value?: Mood };

export function MoodSelector({ error, onChange, value }: Props) {
  return (
    <View>
      <View accessibilityRole="radiogroup" style={styles.row}>
        {moods.map(mood => {
          const selected = mood.value === value;
          return (
            <Pressable
              accessibilityLabel={mood.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              hitSlop={6}
              key={mood.value}
              onPress={() => onChange(mood.value)}
              style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color={mood.color} name={mood.icon} size={46} />
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// TODO(design): sustituir iconos emocionales por assets oficiales.
const styles = StyleSheet.create({
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 10, textAlign: "center" },
  option: { alignItems: "center", flex: 1, justifyContent: "center", minHeight: 64 },
  pressed: { opacity: 0.65 },
  row: { alignItems: "center", flexDirection: "row", gap: 4 },
  selected: { transform: [{ scale: 1.18 }] },
});
