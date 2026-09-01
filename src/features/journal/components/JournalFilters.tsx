import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { JournalFilter } from "@/features/journal/types";

const FILTERS: { label: string; value: JournalFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Esta semana", value: "week" },
  { label: "Este mes", value: "month" },
];

type JournalFiltersProps = {
  onChange: (filter: JournalFilter) => void;
  value: JournalFilter;
};

export function JournalFilters({ onChange, value }: JournalFiltersProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} horizontal showsHorizontalScrollIndicator={false}>
      {FILTERS.map(filter => {
        const selected = value === filter.value;
        return (
          <Pressable
            accessibilityLabel={`Filtrar por ${filter.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={filter.value}
            onPress={() => onChange(filter.value)}
            style={({ pressed }) => [styles.filter, selected && styles.filterSelected, pressed && styles.pressed]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 9, paddingVertical: 4 },
  filter: { alignItems: "center", borderColor: colors.border, borderRadius: 18, borderWidth: 1, justifyContent: "center", minHeight: 40, paddingHorizontal: 16 },
  filterSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  labelSelected: { color: colors.buttonText, fontFamily: fonts.bodySemiBold },
  pressed: { opacity: 0.7 },
});
