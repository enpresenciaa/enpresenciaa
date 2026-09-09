import type { Href } from "expo-router";
import { Redirect } from "expo-router";

export default function LegacyExercisesRoute() {
  return <Redirect href={"/(tabs)/para-ti/bitacora" as Href} />;
}
