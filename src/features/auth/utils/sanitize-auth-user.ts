import type { User, UserIdentity } from "@supabase/supabase-js";

type SanitizedMetadataValue = boolean | number | string | string[] | null;

export interface SanitizedIdentity {
  createdAt: string | null;
  data: Record<string, SanitizedMetadataValue>;
  id: string;
  lastSignInAt: string | null;
  provider: string;
  updatedAt: string | null;
}

export interface SanitizedAuthUser {
  appMetadata: Record<string, SanitizedMetadataValue>;
  createdAt: string;
  email: string | null;
  emailConfirmedAt: string | null;
  id: string;
  identities: SanitizedIdentity[];
  lastSignInAt: string | null;
  normalized: {
    avatarUrl: string | null;
    displayName: string | null;
    onboardingCompleted: boolean;
    primaryProvider: string | null;
    providers: string[];
  };
  phone: string | null;
  updatedAt: string | null;
  userMetadata: Record<string, SanitizedMetadataValue>;
}

const appMetadataKeys = ["provider", "providers"] as const;
const userMetadataKeys = [
  "avatar_url",
  "email",
  "email_verified",
  "family_name",
  "full_name",
  "given_name",
  "iss",
  "name",
  "onboarding_completed",
  "phone",
  "phone_verified",
  "picture",
  "provider_id",
  "sub",
] as const;
const identityDataKeys = [
  "avatar_url",
  "email",
  "email_verified",
  "family_name",
  "full_name",
  "given_name",
  "name",
  "phone",
  "phone_verified",
  "picture",
  "provider_id",
  "sub",
] as const;

function sanitizeValue(value: unknown): SanitizedMetadataValue | undefined {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.every(item => typeof item === "string")) {
    return value;
  }

  return undefined;
}

function pickMetadata(source: Record<string, unknown>, keys: readonly string[]): Record<string, SanitizedMetadataValue> {
  return keys.reduce<Record<string, SanitizedMetadataValue>>((result, key) => {
    const value = sanitizeValue(source[key]);

    if (value !== undefined) {
      result[key] = value;
    }

    return result;
  }, {});
}

function sanitizeIdentity(identity: UserIdentity): SanitizedIdentity {
  return {
    createdAt: identity.created_at ?? null,
    data: pickMetadata(identity.identity_data ?? {}, identityDataKeys),
    id: identity.id,
    lastSignInAt: identity.last_sign_in_at ?? null,
    provider: identity.provider,
    updatedAt: identity.updated_at ?? null,
  };
}

function firstString(...values: unknown[]): string | null {
  return values.find(value => typeof value === "string" && value.trim().length > 0) as string | undefined ?? null;
}

export function sanitizeAuthUser(user: User): SanitizedAuthUser {
  const providers = Array.isArray(user.app_metadata.providers) ?
      user.app_metadata.providers.filter((provider): provider is string => typeof provider === "string") :
      [];

  return {
    appMetadata: pickMetadata(user.app_metadata, appMetadataKeys),
    createdAt: user.created_at,
    email: user.email ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    id: user.id,
    identities: (user.identities ?? []).map(sanitizeIdentity),
    lastSignInAt: user.last_sign_in_at ?? null,
    normalized: {
      avatarUrl: firstString(user.user_metadata.avatar_url, user.user_metadata.picture),
      displayName: firstString(user.user_metadata.full_name, user.user_metadata.name),
      onboardingCompleted: user.user_metadata.onboarding_completed === true,
      primaryProvider: typeof user.app_metadata.provider === "string" ? user.app_metadata.provider : null,
      providers,
    },
    phone: firstString(user.phone),
    updatedAt: user.updated_at ?? null,
    userMetadata: pickMetadata(user.user_metadata, userMetadataKeys),
  };
}
