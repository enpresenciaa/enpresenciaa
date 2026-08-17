import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useThemeColors } from "@/config/theme";

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "home" : "home-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="camino"
        options={{
          title: "Camino",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "paper-plane" : "paper-plane-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ejercicios"
        options={{
          title: "Bítacora",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "list" : "list-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="para-ti"
        options={{
          title: "Para Ti",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "people" : "people-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          title: "Yo",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "person" : "person-outline"} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{ href: null }}
      />
    </Tabs>
  );
}
