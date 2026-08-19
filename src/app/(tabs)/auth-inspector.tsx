import { Redirect } from "expo-router";

import { AuthProviderInspectorScreen } from "@/features/auth/screens/AuthProviderInspectorScreen";

export default function AuthInspectorRoute() {
  if (!__DEV__) {
    return <Redirect href="/(tabs)/yo" />;
  }

  return <AuthProviderInspectorScreen />;
}
