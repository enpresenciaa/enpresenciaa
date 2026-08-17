import * as Linking from "expo-linking";

import Env from "../../../../app-env";

export const AUTH_CALLBACK_PATH = "auth/callback";

export function getAuthRedirectUrl(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH, {
    scheme: Env.SCHEME,
  });
}
