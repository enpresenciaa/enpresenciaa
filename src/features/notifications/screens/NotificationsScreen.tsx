import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { colors } from "@/config/onboarding-theme";
import { homeMock } from "@/mocks/home";
import { getUnreadNotificationsCount, notificationsMock } from "@/mocks/notifications";

const background = require("../../../../assets/images/Imág. NOTIFICACIONES.jpg");

export function NotificationsScreen() {
  const orderedNotifications = [...notificationsMock].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = getUnreadNotificationsCount();

  const header = (
    <NotificationsHeader unreadCount={unreadCount} userName={homeMock.user.name} />
  );

  return (
    <View style={styles.screen}>
      <Image contentFit="cover" source={background} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <NotificationsList header={header} notifications={orderedNotifications} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { backgroundColor: colors.background, flex: 1 },
});
