import type { PropsWithChildren } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import { FontAwesome6 } from "@expo/vector-icons";

const landscape = require("../../../assets/images/Imág. PÁG PRINCIPAL.jpg");

export function HomeBackground({ children }: PropsWithChildren) {
  return (
    <ImageBackground
      source={landscape}
      resizeMode="cover"
      style={styles.background}
    >
      <View pointerEvents="none" />

      {children}
    </ImageBackground>
  );
}

export function HomeHeroSection({ days }: { days: number }) {
  return (
    <View style={styles.hero}>
      <View
        accessibilityLabel={`Racha actual: ${days} días`}
        style={styles.streakCard}
      >
        <FontAwesome6
          color="#FF7628"
          name="fire-flame-curved"
          size={52}
        />

        <View style={styles.streakContent}>
          <Text style={styles.label}>Racha actual</Text>

          <Text style={styles.value}>
            {days} días
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },


  hero: {
    flex: 1,
    justifyContent: "flex-start",
    paddingVertical: 30,
  },

  streakCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(250, 250, 250, 0.05)", //"rgba(253,248,236,0.93)"
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "90%",

    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  streakContent: {
    marginLeft: 14,
  },

  label: {
    color: colors.primary,
    fontFamily: fonts.title,
    fontSize: 28,
    lineHeight: 20,
  },

  value: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 27,
    lineHeight: 32,
  },
});