import { createMMKV } from "react-native-mmkv";
import type { UniwindConfig } from "uniwind";
import type { StateStorage } from "zustand/middleware";

export const storage = createMMKV({ id: "subscribed-storage" });

export const zustandStorage: StateStorage = {
  getItem: name => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: name => storage.remove(name),
};

export const THEME_KEY = "app-theme";
export const ONBOARDING_COMPLETED_KEY = "onboarding-completed";

export type AppTheme = UniwindConfig["themes"][number] | "system";

export function getPersistedTheme(): AppTheme | null {
  return (storage.getString(THEME_KEY) as AppTheme) ?? null;
}
export const persistTheme = (theme: AppTheme) => storage.set(THEME_KEY, theme);

export function getPersistedOnboardingCompleted(): boolean {
  return storage.getBoolean(ONBOARDING_COMPLETED_KEY) === true;
}

export function persistOnboardingCompleted(): void {
  storage.set(ONBOARDING_COMPLETED_KEY, true);
}
