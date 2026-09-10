import type { ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import type { NotificationItem } from "@/types/notification";
import { NotificationCard } from "./NotificationCard";

interface Props {
  header: ReactElement;
  notifications: NotificationItem[];
}

export function NotificationsList({ header, notifications }: Props) {
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={notifications}
      ItemSeparatorComponent={Separator}
      keyExtractor={item => item.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 110, paddingHorizontal: 18 },
  separator: { height: 11 },
});
