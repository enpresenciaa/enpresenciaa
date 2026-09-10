import type { Href } from "expo-router";
import { Redirect } from "expo-router";

export default function LegacyHomeRoute() {
  return <Redirect href={"/(tabs)/empezar" as Href} />;
}
