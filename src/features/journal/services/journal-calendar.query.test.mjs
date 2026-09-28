import { describe, expect, test } from "bun:test";
import { createClient } from "@supabase/supabase-js";

import { queryJournalMonth } from "./journal-calendar.query.ts";

const USER_A = "00000000-0000-4000-8000-000000000001";
const USER_B = "00000000-0000-4000-8000-000000000002";

function completion(index, overrides = {}) {
  return {
    business_date: "2026-09-01",
    completed_at: "2026-09-02T00:30:00+00:00",
    duration_seconds: 60,
    emotional_score: 3,
    exercise: {
      content_type: "audio",
      level: { name: "Presencia", number: 1 },
      name: "Respiración consciente",
      position: 2,
    },
    exercise_id: "00000000-0000-4000-8000-000000000003",
    id: `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    reflection: null,
    repetition_number: 1,
    user_id: USER_A,
    ...overrides,
  };
}

// Exercise the installed Supabase query builder against an in-memory HTTP
// transport. This verifies requests and pagination, not remote RLS policies.
function transport(rows, { maxRows = 500, onRequest, errorBody } = {}) {
  const requests = [];
  const client = createClient("https://journal-test.invalid", "public-test-key", {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        requests.push({ init, url });
        onRequest?.(requests.length, init);
        if (errorBody) {
          return new Response(JSON.stringify(errorBody), { status: 403 });
        }

        const search = url.searchParams;
        const [lower, upper] = search.getAll("business_date");
        const matching = rows.filter(row =>
          `eq.${row.user_id}` === search.get("user_id") &&
          row.business_date >= lower.slice(4) &&
          row.business_date < upper.slice(3))
          .sort((left, right) =>
            Date.parse(left.completed_at) - Date.parse(right.completed_at) ||
            left.id.localeCompare(right.id));
        const offset = Number(search.get("offset"));
        const page = matching.slice(offset, offset + Math.min(Number(search.get("limit")), maxRows));
        const range = page.length ? `${offset}-${offset + page.length - 1}` : "*";
        return new Response(JSON.stringify(page), {
          headers: { "Content-Range": `${range}/${matching.length}`, "Content-Type": "application/json" },
          status: 200,
        });
      },
    },
  });
  return { client, requests };
}

function monthParams(overrides = {}) {
  return { month: "2026-09", search: "", userId: USER_A, ...overrides };
}

describe("journal monthly query", () => {
  test("fetches only the requested business month, with relations and an identity filter", async () => {
    const source = transport([
      completion(1, { business_date: "2026-08-31" }),
      completion(2),
      completion(3, { business_date: "2026-09-30", completed_at: "2026-10-01T01:00:00+00:00" }),
      completion(4, { business_date: "2026-10-01" }),
      completion(5, { user_id: USER_B }),
    ]);
    const entries = await queryJournalMonth(source.client, monthParams());

    expect(entries.map(entry => entry.businessDate)).toEqual(["2026-09-01", "2026-09-30"]);
    expect(entries[1].completedAt).toBe("2026-10-01T01:00:00+00:00");
    expect(entries[0]).toMatchObject({
      contentType: "audio",
      exercisePosition: 2,
      levelNumber: 1,
      reflectionText: null,
      status: "completed",
    });
    expect(source.requests).toHaveLength(1);
    const { url } = source.requests[0];
    expect(url.pathname).toBe("/rest/v1/exercise_completions");
    expect(url.searchParams.getAll("business_date")).toEqual(["gte.2026-09-01", "lt.2026-10-01"]);
    expect(url.searchParams.get("select")).toContain("exercise:exercises!inner(");
    expect(url.searchParams.get("select")).toContain("level:levels!inner(");
    expect(url.searchParams.get("select")).toContain("reflection:completion_reflections(reflection_text)");
    expect(url.searchParams.get("order")).toBe("completed_at.asc,id.asc");
    expect(url.searchParams.has("completed_at")).toBe(false);
  });

  test("loads more than 1000 completions without truncating or duplicating entries", async () => {
    const source = transport(Array.from({ length: 1003 }, (_, index) => completion(index + 1)));
    const entries = await queryJournalMonth(source.client, monthParams());
    expect(entries).toHaveLength(1003);
    expect(new Set(entries.map(entry => entry.id)).size).toBe(1003);
    expect(source.requests.map(({ url }) => url.searchParams.get("offset"))).toEqual(["0", "500", "1000"]);
  });

  test("respects a server row limit lower than the requested page size", async () => {
    const source = transport(Array.from({ length: 7 }, (_, index) => completion(index + 1)), { maxRows: 3 });
    const entries = await queryJournalMonth(source.client, monthParams());
    expect(entries).toHaveLength(7);
    expect(source.requests.map(({ url }) => url.searchParams.get("offset"))).toEqual(["0", "3", "6"]);
  });

  test("preserves sanitized search across either exercise or level, without joining names", async () => {
    const source = transport([completion(1)]);
    expect(await queryJournalMonth(source.client, monthParams({ search: " %RESPIRACIÓN% " }))).toHaveLength(1);
    expect(await queryJournalMonth(source.client, monthParams({ search: "presencia" }))).toHaveLength(1);
    expect(await queryJournalMonth(source.client, monthParams({ search: "consciente Presencia" }))).toHaveLength(0);
    expect(await queryJournalMonth(source.client, monthParams({ search: "%%%" }))).toHaveLength(1);
    expect(source.requests.every(({ url }) => !url.searchParams.has("or"))).toBe(true);
  });

  test("filters after pagination so a nonmatching first page does not hide later matches", async () => {
    const source = transport([
      completion(1),
      completion(2, { exercise: { content_type: "text", level: { name: "Calma", number: 2 }, name: "Pausa", position: 1 } }),
    ], { maxRows: 1 });
    const entries = await queryJournalMonth(source.client, monthParams({ search: "calma" }));
    expect(entries.map(entry => entry.exerciseName)).toEqual(["Pausa"]);
    expect(source.requests).toHaveLength(2);
  });

  test("a month without completions resolves empty in one request", async () => {
    const source = transport([]);
    expect(await queryJournalMonth(source.client, monthParams())).toEqual([]);
    expect(source.requests).toHaveLength(1);
  });

  test("missing identity and invalid month never issue a request", async () => {
    const source = transport([]);
    await expect(queryJournalMonth(source.client, monthParams({ userId: "" }))).rejects.toThrow("AUTH_SESSION_REQUIRED");
    await expect(queryJournalMonth(source.client, monthParams({ month: "2026-13" }))).rejects.toThrow();
    expect(source.requests).toHaveLength(0);
  });

  test("passes cancellation to the HTTP request and stops before the next page", async () => {
    const controller = new AbortController();
    const source = transport([completion(1), completion(2)], {
      maxRows: 1,
      onRequest: (_number, init) => {
        expect(init.signal).toBeDefined();
        controller.abort();
      },
    });
    await expect(queryJournalMonth(source.client, monthParams({ signal: controller.signal }))).rejects.toThrow("JOURNAL_MONTH_ABORTED");
    expect(source.requests).toHaveLength(1);
    await expect(queryJournalMonth(source.client, monthParams({ signal: controller.signal }))).rejects.toThrow("JOURNAL_MONTH_ABORTED");
    expect(source.requests).toHaveLength(1);
  });

  test("rejects incomplete completion contracts without exposing received payloads", async () => {
    const source = transport([completion(1, { completed_at: null, reflection: { reflection_text: "SYNTHETIC_PRIVATE_TEST_VALUE" } })]);
    await expect(queryJournalMonth(source.client, monthParams())).rejects.toThrow("INVALID_JOURNAL_MONTH_RESPONSE");
  });

  test("returns a safe error when the API fails", async () => {
    const source = transport([], { errorBody: { code: "42501", message: "SYNTHETIC_PRIVATE_TEST_VALUE" } });
    await expect(queryJournalMonth(source.client, monthParams())).rejects.toThrow("JOURNAL_MONTH_QUERY_FAILED");
  });
});
