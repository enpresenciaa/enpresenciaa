import { View } from "react-native";

import { GuestTrialGate } from "@/features/guest-trial/components/GuestTrialGate";
import { useGuestTrial } from "@/features/guest-trial/hooks/useGuestTrial";
import { JourneyScreen } from "@/features/journey/screens/JourneyScreen";

export default function JourneyRoute() {
  const guestTrial = useGuestTrial();

  // The Camino stays visible; an expired guest sees how to continue on top of it.
  return (
    <View style={{ flex: 1 }}>
      <JourneyScreen />
      {guestTrial.data?.isExpired ? <GuestTrialGate variant="banner" /> : null}
    </View>
  );
}
