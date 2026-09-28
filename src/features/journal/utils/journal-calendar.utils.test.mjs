import { execFileSync } from "node:child_process";
import process from "node:process";
import { describe, expect, test } from "bun:test";

import {
  formatJournalDay,
  formatJournalMonth,
  getCurrentJournalDay,
  getCurrentJournalMonth,
  getJournalCalendarQueryKey,
  getJournalMonthBounds,
  getJournalMonthDays,
  groupJournalCalendarEntries,
  shiftJournalMonth,
} from "./journal-calendar.utils.ts";

describe("journal month grid", () => {
  test("places a Sunday start after six blank Monday-first cells", () => {
    const days = getJournalMonthDays("2026-02");
    expect(days.slice(0, 7)).toEqual([null, null, null, null, null, null, "2026-02-01"]);
    expect(days.filter(Boolean)).toHaveLength(28);
    expect(days).toHaveLength(35);
    expect(days.at(-1)).toBeNull();
  });

  test("starts a Monday month in the first cell and keeps complete weeks", () => {
    const days = getJournalMonthDays("2026-06");
    expect(days[0]).toBe("2026-06-01");
    expect(days[29]).toBe("2026-06-30");
    expect(days.slice(30)).toEqual([null, null, null, null, null]);
  });

  test("aligns an intermediate weekday and supports six calendar rows", () => {
    expect(getJournalMonthDays("2026-09").slice(0, 3)).toEqual([null, "2026-09-01", "2026-09-02"]);
    expect(getJournalMonthDays("2026-08")).toHaveLength(42);
  });

  test("handles February and the Gregorian leap-year century rule", () => {
    expect(getJournalMonthDays("2024-02").filter(Boolean)).toHaveLength(29);
    expect(getJournalMonthDays("2025-02").filter(Boolean)).toHaveLength(28);
    expect(getJournalMonthDays("2000-02").filter(Boolean)).toHaveLength(29);
    expect(getJournalMonthDays("2100-02").filter(Boolean)).toHaveLength(28);
    expect(getJournalMonthDays("2024-02")).toContain("2024-02-29");
  });
});

describe("journal month navigation and business dates", () => {
  test("crosses years in both directions with an exclusive end date", () => {
    expect(shiftJournalMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftJournalMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftJournalMonth("2026-09", 12)).toBe("2027-09");
    expect(getJournalMonthBounds("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
    expect(getJournalMonthBounds("2024-02")).toEqual({ start: "2024-02-01", end: "2024-03-01" });
  });

  test("rejects ambiguous month inputs and noninteger navigation", () => {
    for (const month of ["2026-2", "2026-00", "2026-13", "2026-02-01", "0000-01", "invalid"]) {
      expect(() => getJournalMonthBounds(month)).toThrow("INVALID_JOURNAL_MONTH");
    }
    expect(() => shiftJournalMonth("2026-02", 0.5)).toThrow("INVALID_JOURNAL_MONTH_SHIFT");
  });

  test("changes month at Mexico City midnight, including a year boundary", () => {
    expect(getCurrentJournalDay(new Date("2026-09-01T05:59:59.999Z"))).toBe("2026-08-31");
    expect(getCurrentJournalDay(new Date("2026-09-01T06:00:00.000Z"))).toBe("2026-09-01");
    expect(getCurrentJournalMonth(new Date("2026-09-01T05:59:59.999Z"))).toBe("2026-08");
    expect(getCurrentJournalMonth(new Date("2026-09-01T06:00:00.000Z"))).toBe("2026-09");
    expect(getCurrentJournalMonth(new Date("2027-01-01T05:59:59.999Z"))).toBe("2026-12");
  });

  test("formats Spanish labels without moving the authoritative day", () => {
    expect(formatJournalMonth("2026-09")).toBe("septiembre de 2026");
    expect(formatJournalDay("2026-09-01")).toBe("martes, 1 de septiembre de 2026");
    expect(formatJournalDay("2024-02-29")).toBe("jueves, 29 de febrero de 2024");
    expect(() => formatJournalDay("2026-02-29")).toThrow("INVALID_JOURNAL_DAY");
  });

  test("device time zones do not change the business month, grid or civil-day label", () => {
    const moduleUrl = new URL("./journal-calendar.utils.ts", import.meta.url).href;
    const script = `import { getCurrentJournalMonth, getJournalMonthDays, formatJournalDay } from ${JSON.stringify(moduleUrl)};
      const now = new Date("2026-09-01T05:59:59.999Z");
      console.log(JSON.stringify({
        localMonth: new Intl.DateTimeFormat("en-CA", { month: "2-digit" }).format(now),
        month: getCurrentJournalMonth(now),
        firstDay: getJournalMonthDays("2026-09")[1],
        label: formatJournalDay("2026-09-01")
      }));`;
    const runInZone = timeZone => JSON.parse(execFileSync(process.execPath, ["--eval", script], {
      encoding: "utf8",
      env: { ...process.env, TZ: timeZone },
    }));
    const west = runInZone("America/Los_Angeles");
    const east = runInZone("Asia/Tokyo");
    expect(west.localMonth).toBe("08");
    expect(east.localMonth).toBe("09");
    expect(west.month).toBe("2026-08");
    expect(east.month).toBe(west.month);
    expect(east.firstDay).toBe(west.firstDay);
    expect(east.label).toBe(west.label);
  });
});

describe("journal calendar activity and cache", () => {
  test("groups by the exact server day and excludes other months", () => {
    const entries = [
      { businessDate: "2026-08-31", completedAt: "2026-09-01T04:00:00Z", id: "previous" },
      { businessDate: "2026-09-01", completedAt: "2026-09-02T00:30:00Z", id: "current" },
      { businessDate: "2026-10-01", completedAt: "2026-10-01T07:00:00Z", id: "next" },
    ];
    const grouped = groupJournalCalendarEntries(entries, "2026-09");
    expect([...grouped.keys()]).toEqual(["2026-09-01"]);
    expect(grouped.get("2026-09-01")).toEqual([entries[1]]);
    expect(grouped.has("2026-09-02")).toBe(false);
    expect(groupJournalCalendarEntries([], "2026-09").size).toBe(0);
  });

  test("keeps repeated completions, orders by actual time then ID and preserves input", () => {
    const entries = [
      { businessDate: "2026-09-02", completedAt: "2026-09-02T18:00:00Z", id: "following-day" },
      { businessDate: "2026-09-01", completedAt: "2026-09-01T20:00:00Z", id: "later" },
      { businessDate: "2026-09-01", completedAt: "2026-09-01T12:00:00-06:00", id: "tie-b" },
      { businessDate: "2026-09-01", completedAt: "2026-09-01T18:00:00Z", id: "tie-a" },
    ];
    const originalIds = entries.map(entry => entry.id);
    const grouped = groupJournalCalendarEntries(entries, "2026-09");
    expect([...grouped.keys()]).toEqual(["2026-09-01", "2026-09-02"]);
    expect(grouped.get("2026-09-01").map(entry => entry.id)).toEqual(["tie-a", "tie-b", "later"]);
    expect(entries.map(entry => entry.id)).toEqual(originalIds);
  });

  test("isolates month, user and sanitized search under the shared invalidation prefix", () => {
    const key = getJournalCalendarQueryKey("user-a", "2026-09", "  RESPIRACIÓN,   presencia%  ");
    expect(key).toEqual(["journal", "user-a", "calendar", "2026-09", "America/Mexico_City", "respiración presencia"]);
    expect(key).toEqual(getJournalCalendarQueryKey("user-a", "2026-09", "respiración presencia"));
    expect(key).not.toEqual(getJournalCalendarQueryKey("user-b", "2026-09", "respiración presencia"));
    expect(key).not.toEqual(getJournalCalendarQueryKey("user-a", "2026-08", "respiración presencia"));
    expect(key).not.toEqual(getJournalCalendarQueryKey("user-a", "2026-09", "respiración"));
    expect(key.slice(0, 2)).toEqual(["journal", "user-a"]);
  });

  test("preserves server microsecond chronology before applying the ID tie-breaker", () => {
    const grouped = groupJournalCalendarEntries([
      { businessDate: "2026-09-01", completedAt: "2026-09-01T18:00:00.000002Z", id: "a-later" },
      { businessDate: "2026-09-01", completedAt: "2026-09-01T18:00:00.000001Z", id: "z-earlier" },
    ], "2026-09");
    expect(grouped.get("2026-09-01").map(entry => entry.id)).toEqual(["z-earlier", "a-later"]);
  });
});
