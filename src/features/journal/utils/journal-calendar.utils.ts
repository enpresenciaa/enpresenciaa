import { JOURNAL_TIME_ZONE, sanitizeJournalSearch } from "./journal.utils";

type CalendarCompletion = {
  businessDate: string;
  completedAt: string;
  id: string;
};

function getMonthDate(month: string): Date {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month) || month.startsWith("0000")) {
    throw new Error("INVALID_JOURNAL_MONTH");
  }

  return new Date(`${month}-01T00:00:00.000Z`);
}

function getTimestampFraction(timestamp: string): number {
  return Number(`0.${timestamp.match(/\.(\d+)/)?.[1] ?? "0"}`);
}

export function getCurrentJournalDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: JOURNAL_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;
  const day = parts.find(part => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function getCurrentJournalMonth(date = new Date()): string {
  return getCurrentJournalDay(date).slice(0, 7);
}

export function shiftJournalMonth(month: string, delta: number): string {
  const date = getMonthDate(month);
  if (!Number.isInteger(delta)) {
    throw new TypeError("INVALID_JOURNAL_MONTH_SHIFT");
  }

  date.setUTCMonth(date.getUTCMonth() + delta);
  const year = date.getUTCFullYear();
  if (!Number.isFinite(year) || year < 1 || year > 9999) {
    throw new Error("INVALID_JOURNAL_MONTH");
  }

  return date.toISOString().slice(0, 7);
}

export function getJournalMonthBounds(month: string): { start: string; end: string } {
  getMonthDate(month);
  return { start: `${month}-01`, end: `${shiftJournalMonth(month, 1)}-01` };
}

export function getJournalMonthDays(month: string): (string | null)[] {
  const date = getMonthDate(month);
  // Monday is column zero, matching Journal's existing week filter.
  const leadingDays = (date.getUTCDay() + 6) % 7;
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  const daysInMonth = date.getUTCDate();
  const cells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from({ length: cells }, (_, index) => {
    const day = index - leadingDays + 1;
    return day >= 1 && day <= daysInMonth ? `${month}-${String(day).padStart(2, "0")}` : null;
  });
}

export function formatJournalMonth(month: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(getMonthDate(month));
}

export function formatJournalDay(day: string): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) {
    throw new Error("INVALID_JOURNAL_DAY");
  }

  // A server business date is a civil day, not a UTC timestamp to localize.
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  }).format(date);
}

export function getJournalCalendarQueryKey(userId: string | undefined, month: string, search: string) {
  return ["journal", userId, "calendar", month, JOURNAL_TIME_ZONE, sanitizeJournalSearch(search).toLocaleLowerCase("es-MX")] as const;
}

export function groupJournalCalendarEntries<T extends CalendarCompletion>(entries: readonly T[], month: string): Map<string, T[]> {
  const days = new Set(getJournalMonthDays(month).filter(day => day !== null));
  const sorted = entries.filter(entry => days.has(entry.businessDate)).sort((left, right) => {
    const dayOrder = left.businessDate.localeCompare(right.businessDate);
    const timeOrder = Date.parse(left.completedAt) - Date.parse(right.completedAt);
    // PostgreSQL timestamps can retain microseconds that Date.parse truncates.
    const fractionOrder = getTimestampFraction(left.completedAt) - getTimestampFraction(right.completedAt);
    return dayOrder || timeOrder || fractionOrder || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  });
  const grouped = new Map<string, T[]>();

  for (const entry of sorted) {
    const dayEntries = grouped.get(entry.businessDate);
    if (dayEntries) {
      dayEntries.push(entry);
    } else {
      grouped.set(entry.businessDate, [entry]);
    }
  }

  return grouped;
}
