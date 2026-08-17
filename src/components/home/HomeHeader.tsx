import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { NotificationButton } from "./NotificationButton";

export function HomeHeader({ name }: { name: string }) {
  return (
    <Text
      accessibilityRole="header"
      style={styles.greeting}
    >
      ¡Hola, {name}!
    </Text>
  );
}

interface MotivationRowProps {
  motivation: string;
  onNotificationsPress: () => void;
  unreadCount?: number;
}

export function MotivationRow({
  motivation,
  onNotificationsPress,
  unreadCount = 0,
}: MotivationRowProps) {
  return (
    <View style={styles.motivationRow}>
      <Text style={styles.motivation}>
        {motivation}
      </Text>

      <NotificationButton onPress={onNotificationsPress} unreadCount={unreadCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 34,
    lineHeight: 42,
  },

  motivationRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
  },

  motivation: {
    color: "black",
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 21,
    paddingRight: 18,
  },

});
