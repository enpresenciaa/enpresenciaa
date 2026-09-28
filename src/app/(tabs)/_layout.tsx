import { Tabs } from "expo-router";
import { Vibration } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { colors, fonts } from "@/config/onboarding-theme";

// Android honours the duration; iOS ignores it and plays its fixed system vibration.
const BASTA_VIBRATION_MS = 2000;

const TAB_COLORS = {
  gold: "#7A6200",
  text: "#364B26",
} as const;

const TAB_ICON_SIZE = 28;
// Traced from the approved mock (240×240 box): two open rings with opposite, parallel
// cuts and a filled centre dot, all drawn with the same stroke width and round ends.
const TAB_ICON_STROKE = 13;
const INNER_RING_PATH = "M203.0 120.7 A83 83 0 1 1 192.2 79.1";
const OUTER_RING_PATH = "M12.6 148.1 A111 111 0 1 1 40.6 197.6";
const TAB_ICON_PALETTE = {
  active: { dot: "#F3DE8A", stroke: "#7A6200" },
  inactive: { dot: "#CFF19F", stroke: "#4F7D5D" },
} as const;

function TabRingIcon({ focused }: { focused: boolean }) {
  const palette = focused ? TAB_ICON_PALETTE.active : TAB_ICON_PALETTE.inactive;

  return (
    <Svg accessibilityElementsHidden height={TAB_ICON_SIZE} importantForAccessibility="no-hide-descendants" viewBox="0 0 240 240" width={TAB_ICON_SIZE}>
      <Path d={OUTER_RING_PATH} fill="none" stroke={palette.stroke} strokeLinecap="round" strokeWidth={TAB_ICON_STROKE} />
      <Path d={INNER_RING_PATH} fill="none" stroke={palette.stroke} strokeLinecap="round" strokeWidth={TAB_ICON_STROKE} />
      <Circle cx={120} cy={120} fill={palette.dot} r={35} stroke={palette.stroke} strokeWidth={TAB_ICON_STROKE} />
    </Svg>
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
        listeners={{ tabPress: () => Vibration.vibrate(BASTA_VIBRATION_MS) }}
        name="basta"
        options={{
          tabBarIcon: ({ focused }) => <TabRingIcon focused={focused} />,
          title: "Basta",
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          tabBarIcon: ({ focused }) => <TabRingIcon focused={focused} />,
          title: "Comunidad",
        }}
      />
      <Tabs.Screen
        name="empezar"
        options={{
          tabBarIcon: ({ focused }) => <TabRingIcon focused={focused} />,
          title: "Comenzar",
        }}
      />
      <Tabs.Screen
        name="para-ti"
        options={{
          tabBarIcon: ({ focused }) => <TabRingIcon focused={focused} />,
          title: "Para ti",
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          tabBarIcon: ({ focused }) => <TabRingIcon focused={focused} />,
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
