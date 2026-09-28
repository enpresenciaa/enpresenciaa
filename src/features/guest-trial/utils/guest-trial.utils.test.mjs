import { describe, expect, test } from "bun:test";

import { isGuestTrialExpiredError, parseGuestTrialRows } from "./guest-trial.utils.ts";

const row = {
  advances_limit: 15,
  advances_used: 3,
  ends_at: "2026-10-12T21:00:00+00:00",
  is_expired: false,
  is_guest: true,
  started_at: "2026-09-27T21:00:00+00:00",
};

describe("guest trial", () => {
  test("maps the single RPC row", () => {
    expect(parseGuestTrialRows([row])).toEqual({
      advancesLimit: 15,
      advancesUsed: 3,
      endsAt: "2026-10-12T21:00:00+00:00",
      isExpired: false,
      isGuest: true,
      startedAt: "2026-09-27T21:00:00+00:00",
    });
  });

  test("an account is never reported as expired", () => {
    expect(parseGuestTrialRows([{ ...row, is_expired: true, is_guest: false }]).isExpired).toBe(false);
    expect(parseGuestTrialRows([{ ...row, is_expired: true }]).isExpired).toBe(true);
  });

  test("a guest without activity has not started", () => {
    const status = parseGuestTrialRows([{ ...row, advances_used: 0, ends_at: null, started_at: null }]);
    expect(status.startedAt).toBeNull();
    expect(status.isExpired).toBe(false);
  });

  test("rejects malformed or multi-row responses", () => {
    expect(() => parseGuestTrialRows([])).toThrow();
    expect(() => parseGuestTrialRows([row, row])).toThrow();
    expect(() => parseGuestTrialRows([{ ...row, is_expired: "no" }])).toThrow();
  });

  test("recognises the server rejection", () => {
    expect(isGuestTrialExpiredError(new Error("GUEST_TRIAL_EXPIRED"))).toBe(true);
    expect(isGuestTrialExpiredError(new Error("DAILY_ADVANCE_LIMIT_REACHED"))).toBe(false);
    expect(isGuestTrialExpiredError("GUEST_TRIAL_EXPIRED")).toBe(false);
  });
});
