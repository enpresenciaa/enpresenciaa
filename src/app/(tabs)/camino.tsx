import type { Href } from "expo-router";
import { Redirect } from "expo-router";

export default function LegacyJourneyRoute() {
  return <Redirect href={"/(tabs)/empezar/camino" as Href} />;
}
