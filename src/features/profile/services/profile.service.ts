import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { Profile, ProfileInsert, ProfileUpdate } from "@/types/database";

function firstString(...values: unknown[]): string | null {
  return values.find(value => typeof value === "string" && value.trim().length > 0) as string | undefined ?? null;
}

function getInitialProfile(user: User): ProfileInsert {
  return {
    avatar_url: firstString(user.user_metadata.avatar_url, user.user_metadata.picture),
    date_of_birth: toIsoDate(firstString(user.user_metadata.date_of_birth)),
    full_name: firstString(user.user_metadata.full_name, user.user_metadata.name)?.slice(0, 100) ?? null,
    id: user.id,
    phone: firstString(user.phone, user.user_metadata.phone),
  };
}

export function toDisplayDate(value: string | null): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
}

export function toIsoDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureProfile(user: User): Promise<Profile> {
  const existingProfile = await getProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const { error } = await supabase.from("profiles").upsert(getInitialProfile(user), {
    ignoreDuplicates: true,
    onConflict: "id",
  });

  if (error) {
    throw error;
  }

  const createdProfile = await getProfile(user.id);

  if (!createdProfile) {
    throw new Error("PROFILE_NOT_CREATED");
  }

  return createdProfile;
}

export async function updateProfile(userId: string, values: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").update(values).eq("id", userId).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}
