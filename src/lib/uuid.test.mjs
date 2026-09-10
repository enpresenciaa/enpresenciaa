import { describe, expect, test } from "bun:test";

import { createUuid } from "./uuid.ts";

describe("React Native compatible UUID", () => {
  test("creates RFC 4122 version 4 values without the Web Crypto global", () => {
    const value = createUuid();
    expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test("does not reuse an id across consecutive calls", () => {
    expect(createUuid()).not.toBe(createUuid());
  });
});
