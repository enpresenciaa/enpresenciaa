import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

interface Props {
  onPress?: () => void;
  unreadCount?: number;
}

export function NotificationButton({ onPress, unreadCount = 0 }: Props) {
  const content = (
    <>
      <Ionicons color={colors.text} name="notifications" size={28} />
      {unreadCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text></View> : null}
    </>
  );

  if (!onPress) {
    return <View accessibilityLabel={`Notificaciones, ${unreadCount} sin leer`} style={styles.button}>{content}</View>;
  }

  return (
    <Pressable accessibilityLabel={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ""}`} accessibilityRole="button" hitSlop={10} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", backgroundColor: "#B85B2B", borderColor: colors.background, borderRadius: 9, borderWidth: 2, height: 18, justifyContent: "center", minWidth: 18, paddingHorizontal: 3, position: "absolute", right: 0, top: 0 },
  badgeText: { color: "#FFFFFF", fontFamily: fonts.bodySemiBold, fontSize: 9, lineHeight: 11 },
  button: { alignItems: "center", height: 46, justifyContent: "center", position: "relative", width: 46 },
  pressed: { opacity: 0.6 },
});
