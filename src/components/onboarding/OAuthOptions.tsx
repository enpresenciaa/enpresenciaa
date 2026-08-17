import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

export const oauthProviders = ["Google", "Apple", "Facebook"] as const;
export type OAuthProvider = typeof oauthProviders[number];

type Props = {
  disabled?: boolean;
  onProviderPress?: (provider: OAuthProvider) => void;
  separatorText: string;
  title?: string;
};

function OAuthLogo({ provider }: { provider: OAuthProvider }) {
  if (provider === "Apple") {
    return <FontAwesome6 color="#000000" name="apple" size={24} />;
  }

  if (provider === "Facebook") {
    return <FontAwesome6 color="#1877F2" name="facebook-f" size={24} />;
  }

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.googleLogo}>
      <Text style={[styles.googleLetter, styles.googleBlue]}>G</Text>
      <Text style={[styles.googleAccent, styles.googleRed]}>G</Text>
      <Text style={[styles.googleAccent, styles.googleYellow]}>G</Text>
      <Text style={[styles.googleAccent, styles.googleGreen]}>G</Text>
    </View>
  );
}

export function OAuthOptions({ disabled = false, onProviderPress, separatorText, title }: Props) {
  const unavailable = disabled || !onProviderPress;

  return (
    <View accessibilityLabel="Opciones de autenticación social" style={styles.block}>
      <View style={styles.separator}><View style={styles.line} /><Text style={styles.or}>{separatorText}</Text><View style={styles.line} /></View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.row}>
        {oauthProviders.map(provider => (
          <Pressable
            accessibilityLabel={`${provider}${unavailable ? ", próximamente" : ""}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: unavailable }}
            disabled={unavailable}
            key={provider}
            onPress={() => onProviderPress?.(provider)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <OAuthLogo provider={provider} />
            <Text style={styles.label}>{provider}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 13 },
  googleAccent: { left: 0, position: "absolute", top: 0 },
  googleBlue: { color: "#4285F4" },
  googleGreen: { color: "#34A853", height: 8, overflow: "hidden", top: 16 },
  googleLetter: { fontFamily: fonts.bodySemiBold, fontSize: 24, lineHeight: 27 },
  googleLogo: { height: 27, width: 23 },
  googleRed: { color: "#EA4335", height: 8, overflow: "hidden" },
  googleYellow: { color: "#FBBC05", height: 8, overflow: "hidden", top: 8 },
  label: { color: colors.text, fontFamily: fonts.body, fontSize: 11 },
  line: { backgroundColor: colors.border, flex: 1, height: StyleSheet.hairlineWidth },
  option: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 11, borderWidth: 1, flex: 1, gap: 4, justifyContent: "center", minHeight: 58 },
  or: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginHorizontal: 9 },
  pressed: { opacity: 0.65 },
  row: { flexDirection: "row", gap: 8 },
  separator: { alignItems: "center", flexDirection: "row", marginBottom: 9 },
  title: { color: colors.text, fontFamily: fonts.body, fontSize: 12, marginBottom: 9, textAlign: "center" },
});
