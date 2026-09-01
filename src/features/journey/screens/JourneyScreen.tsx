import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/config/onboarding-theme";
import { env } from "@/config/env";
import { BillingTestCheckout } from "@/features/billing/components/BillingTestCheckout";
import { isStripeTestCheckoutVisible } from "@/features/billing/utils/billing.utils";
import { CaminoMap } from "@/features/journey/components/CaminoMap";
import { canOpenLevel, CURRENT_LEVEL_ID, journeyLevels } from "@/features/journey/mocks/journey.mock";
import type { MapLevel } from "@/features/journey/types";

export function JourneyScreen() {
  const router = useRouter();
  const showStripeTestCheckout = isStripeTestCheckoutVisible(__DEV__, env.enableStripeTestCheckout);

  function handlePressLevel(level: MapLevel) {
    if (!canOpenLevel(level)) {
      return;
    }
    router.push({ pathname: "/camino/nivel/[levelId]", params: { levelId: level.id } } as unknown as Href);
  }

  return (
    <View style={styles.screen}>
      <CaminoMap
        currentLevelId={CURRENT_LEVEL_ID}
        levels={journeyLevels}
        onPressLevel={handlePressLevel}
      />
      {showStripeTestCheckout ? (
        <SafeAreaView edges={["top", "left", "right"]} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View pointerEvents="box-none" style={styles.headerRow}>
            <BillingTestCheckout />
          </View>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { alignItems: "center", gap: 8, justifyContent: "center", paddingHorizontal: 14, paddingTop: 8 },
  screen: { backgroundColor: colors.background, flex: 1 },
});
