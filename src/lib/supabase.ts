import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { env } from "@/config/env";
import { authStorage } from "@/lib/auth-storage";
import type { Database } from "@/types/database";

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: authStorage,
    },
  },
);

export function registerSupabaseAutoRefresh(): () => void {
  if (Platform.OS === "web") {
    return () => undefined;
  }

  function updateAutoRefresh(state: string) {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
      return;
    }

    supabase.auth.stopAutoRefresh();
  }

  updateAutoRefresh(AppState.currentState);
  const subscription = AppState.addEventListener("change", updateAutoRefresh);

  return () => {
    subscription.remove();
    supabase.auth.stopAutoRefresh();
  };
}
