import { PortalMenuScreen } from "@/components/layout/PortalMenuScreen";
import { StyleSheet } from "react-native";

import { fonts } from "@/config/onboarding-theme";

const background = require("../../../../assets/images/Imág. ¿YASENTISTE EL CAMBIO.jpg");

type Props = {
  onConsultationsPress: () => void;
  onInstagramPress: () => void;
  onNotificationsPress: () => void;
};

export function CommunityScreen({ onConsultationsPress, onInstagramPress, onNotificationsPress }: Props) {
  return (
    <PortalMenuScreen
      backgroundSource={background}
      items={[
        { accessibilityLabel: "Abrir Instagram", label: "Instagram", labelStyle: styles.instagramLabel, onPress: onInstagramPress },
        { accessibilityLabel: "Abrir Consultas", label: "Consultas", onPress: onConsultationsPress },
        { accessibilityLabel: "Abrir Notificaciones", label: "Notificaciones", onPress: onNotificationsPress },
      ]}
      overlayColor="rgba(24, 37, 28, 0.12)"
    />
  );
}

const styles = StyleSheet.create({
  instagramLabel: {
    color: "#FFFFFF",
    fontFamily: fonts.instagram,
    // The script face runs smaller than Alice; this matches the visual size of the other labels.
    fontSize: 30,
    lineHeight: 36,
  },
});
