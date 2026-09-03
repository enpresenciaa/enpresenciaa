import { Text } from "react-native";

import { SectionScreen } from "@/components/layout/SectionScreen";

export default function UrgentHelpRoute() {
  return (
    <SectionScreen title="Basta">
      <Text className="mt-4 max-w-md text-center text-sm text-text-secondary">
        Este espacio está en definición y no ofrece atención de emergencia. Si existe un riesgo inmediato, contacta a los servicios de emergencia de tu localidad.
      </Text>
    </SectionScreen>
  );
}
