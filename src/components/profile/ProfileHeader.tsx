import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

type ProfileHeaderProps = {
  avatarUrl: string | null;
  createdAt: string | null;
  displayName: string;
};

function formatJourneyDate(value: string | null): string {
  if (!value) {
    return "hoy";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "hoy";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date).replaceAll(" de ", " ");
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("") || "YO";
}

export function ProfileHeader({ avatarUrl, createdAt, displayName }: ProfileHeaderProps) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.avatarFrame}>
          {avatarUrl ? (
            <Image
              accessibilityLabel={`Foto de perfil de ${displayName}`}
              contentFit="cover"
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              transition={150}
            />
          ) : (
            <Text style={styles.initials}>{getInitials(displayName)}</Text>
          )}
        </View>
        <View style={styles.copy}>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.name}>{displayName}</Text>
          <Text style={styles.journey}>Tu camino desde {formatJourneyDate(createdAt)}</Text>
        </View>
      </View>
      <View style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  avatar: { height: "100%", width: "100%" },
  avatarFrame: { alignItems: "center", backgroundColor: "#D7D7D7", borderRadius: 45, height: 90, justifyContent: "center", overflow: "hidden", width: 90 },
  copy: { flex: 1, minWidth: 0 },
  divider: { backgroundColor: colors.primary, height: 3, marginBottom: 25 },
  header: { alignItems: "center", flexDirection: "row", gap: 18, paddingBottom: 20, paddingHorizontal: 18, paddingTop: 8 },
  initials: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 26 },
  journey: { color: colors.text, fontFamily: fonts.body, fontSize: 13, marginTop: 7 },
  name: { color: colors.text, fontFamily: fonts.title, fontSize: 30 },
});
