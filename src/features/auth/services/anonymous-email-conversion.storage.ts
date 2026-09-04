import { z } from "zod";

import { secureStorage } from "@/lib/auth-storage";

const pendingConversionSchema = z.object({
  email: z.string().email(),
  requestedAt: z.string().datetime(),
  userId: z.string().uuid(),
});

export type PendingAnonymousEmailConversion = z.infer<typeof pendingConversionSchema>;

const storageKey = "auth.anonymous-email-conversion";

export async function getPendingAnonymousEmailConversion(): Promise<PendingAnonymousEmailConversion | null> {
  const stored = await secureStorage.getItem(storageKey);

  if (!stored) {
    return null;
  }

  try {
    const result = pendingConversionSchema.safeParse(JSON.parse(stored));

    if (result.success) {
      return result.data;
    }
  } catch {
    // Invalid conversion state must not influence another authentication attempt.
  }

  await clearPendingAnonymousEmailConversion();
  return null;
}

export async function setPendingAnonymousEmailConversion(
  conversion: Omit<PendingAnonymousEmailConversion, "requestedAt">,
): Promise<void> {
  const value = pendingConversionSchema.parse({
    ...conversion,
    requestedAt: new Date().toISOString(),
  });
  await secureStorage.setItem(storageKey, JSON.stringify(value));
}

export async function clearPendingAnonymousEmailConversion(): Promise<void> {
  await secureStorage.removeItem(storageKey);
}
