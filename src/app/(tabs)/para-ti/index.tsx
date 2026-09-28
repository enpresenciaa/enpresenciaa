import type { Href } from "expo-router";
import { useRouter } from "expo-router";

import { PortalMenuScreen } from "@/components/layout/PortalMenuScreen";

const background = require("../../../../assets/images/Camino COMUNIDAD.png");

export default function ForYouRoute() {
  const router = useRouter();

  return (
    <PortalMenuScreen
      backgroundSource={background}
      contentPosition="top"
      items={[
        { accessibilityLabel: "Abrir Bitácora", label: "Bitácora", onPress: () => router.push("/(tabs)/para-ti/bitacora" as Href) },
        { accessibilityLabel: "Abrir Guías", label: "Guías", onPress: () => router.push("/(tabs)/para-ti/guias" as Href) },
      ]}
      overlayColor="rgba(253, 248, 236, 0.08)"
    />
  );
}
