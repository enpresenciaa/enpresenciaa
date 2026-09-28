import type { Href } from "expo-router";
import { useRouter } from "expo-router";

import { CommunityScreen } from "@/features/community/screens/CommunityScreen";

export default function CommunityRoute() {
  const router = useRouter();

  return (
    <CommunityScreen
      onConsultationsPress={() => router.push("/(tabs)/comunidad/consultas" as Href)}
      onInstagramPress={() => router.push("/(tabs)/comunidad/instagram" as Href)}
      onNotificationsPress={() => router.push("/(tabs)/comunidad/notificaciones" as Href)}
    />
  );
}
