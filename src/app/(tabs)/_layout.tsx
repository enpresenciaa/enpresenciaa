import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useThemeColors } from "@/config/theme";

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      initialRouteName="empezar"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 14, fontWeight: "700" },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1, height: 72, paddingTop: 6 },
      }}
    >
      <Tabs.Screen name="comunidad" options={{ title: "Comunidad", tabBarIcon: ({ color, focused, size }) => <Ionicons color={color} name={focused ? "people" : "people-outline"} size={size} /> }} />
      <Tabs.Screen name="basta" options={{ title: "Basta", tabBarIcon: ({ color, focused, size }) => <Ionicons color={color} name={focused ? "hand-left" : "hand-left-outline"} size={size} /> }} />
      <Tabs.Screen name="empezar" options={{ title: "Empezar", tabBarIcon: ({ color, focused, size }) => <Ionicons color={color} name={focused ? "play-circle" : "play-circle-outline"} size={size} /> }} />
      <Tabs.Screen name="para-ti" options={{ title: "Para ti", tabBarIcon: ({ color, focused, size }) => <Ionicons color={color} name={focused ? "book" : "book-outline"} size={size} /> }} />
      <Tabs.Screen name="yo" options={{ title: "Yo", tabBarIcon: ({ color, focused, size }) => <Ionicons color={color} name={focused ? "person" : "person-outline"} size={size} /> }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="camino" options={{ href: null }} />
      <Tabs.Screen name="ejercicios" options={{ href: null }} />
      <Tabs.Screen name="auth-inspector" options={{ href: null }} />
      <Tabs.Screen name="notificaciones" options={{ href: null }} />
    </Tabs>
  );
}
