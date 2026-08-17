import { useCSSVariable } from "uniwind";

type ThemeColorName =
  | "background" |
  "backgroundElement" |
  "foreground" |
  "text" |
  "textSecondary" |
  "primary" |
  "primaryForeground" |
  "muted" |
  "mutedForeground" |
  "card" |
  "cardForeground" |
  "border" |
  "destructive" |
  "success" |
  "warning";

const colorToVariable: Record<ThemeColorName, string> = {
  background: "--color-background",
  backgroundElement: "--color-background-element",
  foreground: "--color-foreground",
  text: "--color-text",
  textSecondary: "--color-text-secondary",
  primary: "--color-primary",
  primaryForeground: "--color-primary-foreground",
  muted: "--color-muted",
  mutedForeground: "--color-muted-foreground",
  card: "--color-card",
  cardForeground: "--color-card-foreground",
  border: "--color-border",
  destructive: "--color-destructive",
  success: "--color-success",
  warning: "--color-warning",
};

export function useThemeColor(colorName: ThemeColorName): string {
  return useCSSVariable(colorToVariable[colorName]) as string;
}

export function useThemeColors(): Record<ThemeColorName, string> {
  const variables = Object.values(colorToVariable);
  const values = useCSSVariable(variables) as string[];

  const colorNames = Object.keys(colorToVariable) as ThemeColorName[];
  return colorNames.reduce(
    (acc, name, index) => {
      acc[name] = values[index];
      return acc;
    },
    {} as Record<ThemeColorName, string>,
  );
}
