import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";

const TAB_COLORS = {
  gold: "#7A6200",
  intense: "#098D26",
  soft: "#54DA72",
  text: "#364B26",
} as const;

type CircleVariant = "intense" | "soft";

function TabCircleIcon({ focused, variant }: { focused: boolean; variant: CircleVariant }) {
  if (focused) {
    return <View accessibilityRole="image" style={styles.selectedCircle} />;
  }

  return (
    <View
      accessibilityRole="image"
      style={[
        styles.ring,
        variant === "intense" ? styles.ringIntense : styles.ringSoft,
      ]}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="empezar"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_COLORS.gold,
        tabBarInactiveTintColor: TAB_COLORS.text,
        tabBarLabelStyle: {
          fontFamily: fonts.title,
          fontSize: 13,
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: "rgba(54, 75, 38, 0.12)",
          borderTopWidth: 1,
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="comunidad"
        options={{
          tabBarIcon: ({ focused }) => <TabCircleIcon focused={focused} variant="intense" />,
          title: "Comunidad",
        }}
      />
      <Tabs.Screen
        name="basta"
        options={{
          tabBarIcon: ({ focused }) => <TabCircleIcon focused={focused} variant="soft" />,
          title: "Basta",
        }}
      />
      <Tabs.Screen
        name="empezar"
        options={{
          tabBarIcon: ({ focused }) => <TabCircleIcon focused={focused} variant="intense" />,
          title: "Comenzar",
        }}
      />
      <Tabs.Screen
        name="para-ti"
        options={{
          tabBarIcon: ({ focused }) => <TabCircleIcon focused={focused} variant="soft" />,
          title: "Para ti",
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          tabBarIcon: ({ focused }) => <TabCircleIcon focused={focused} variant="intense" />,
          title: "YO",
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="camino" options={{ href: null }} />
      <Tabs.Screen name="ejercicios" options={{ href: null }} />
      <Tabs.Screen name="auth-inspector" options={{ href: null }} />
      <Tabs.Screen name="notificaciones" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 5,
    height: 24,
    width: 24,
  },
  ringIntense: {
    borderColor: TAB_COLORS.intense,
  },
  ringSoft: {
    borderColor: TAB_COLORS.soft,
  },
  selectedCircle: {
    backgroundColor: TAB_COLORS.gold,
    borderRadius: 13,
    height: 26,
    width: 26,
  },
});
