import { z } from "zod";

export type GuestTrialStatus = {
  advancesLimit: number;
  advancesUsed: number;
  endsAt: string | null;
  isExpired: boolean;
  isGuest: boolean;
  startedAt: string | null;
};

const guestTrialRowSchema = z.object({
  advances_limit: z.number().int(),
  advances_used: z.number().int(),
  ends_at: z.string().nullable(),
  is_expired: z.boolean(),
  is_guest: z.boolean(),
  started_at: z.string().nullable(),
});

export function getGuestTrialQueryKey(userId: string | undefined) {
  return ["guest-trial", userId] as const;
}

/** get_guest_trial returns a single-row table; anything else is a contract error. */
export function parseGuestTrialRows(rows: unknown): GuestTrialStatus {
  const [row] = z.array(guestTrialRowSchema).length(1).parse(rows);
  return {
    advancesLimit: row.advances_limit,
    advancesUsed: row.advances_used,
    endsAt: row.ends_at,
    isExpired: row.is_guest && row.is_expired,
    isGuest: row.is_guest,
    startedAt: row.started_at,
  };
}

export function isGuestTrialExpiredError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("GUEST_TRIAL_EXPIRED");
}
