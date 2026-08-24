import type { User } from "@supabase/supabase-js";

import { sanitizeAuthUser } from "@/features/auth/utils/sanitize-auth-user";
import type { Profile } from "@/types/database";

export type ProfileDisplayData = {
  avatarUrl: string | null;
  createdAt: string | null;
  displayName: string;
  email: string;
};

export function getProfileDisplayData(user: User | null, profile: Profile | null | undefined): ProfileDisplayData {
  const authUser = user ? sanitizeAuthUser(user) : null;

  return {
    avatarUrl: profile?.avatar_url ?? authUser?.normalized.avatarUrl ?? null,
    createdAt: profile?.created_at ?? authUser?.createdAt ?? null,
    displayName: profile?.full_name ?? authUser?.normalized.displayName ?? authUser?.email?.split("@")[0] ?? "Usuario",
    email: authUser?.email ?? "",
  };
}
