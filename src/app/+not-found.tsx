import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground text-lg">This screen does not exist.</Text>
        <Link href="/" className="mt-4 text-primary">
          <Text>Go to home</Text>
        </Link>
      </View>
    </>
  );
}
