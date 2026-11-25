import { afterEach, describe, expect, it } from "vitest";

import { getAuth } from "@/shared/auth/server";

// No database needed: the secret check runs before Better Auth or the DB client is created.
const cache = globalThis as typeof globalThis & { flexptAuth?: unknown };

describe("Better Auth configuration", () => {
  const savedSecret = process.env.BETTER_AUTH_SECRET;
  const savedAuth = cache.flexptAuth;

  afterEach(() => {
    if (savedSecret === undefined) delete process.env.BETTER_AUTH_SECRET;
    else process.env.BETTER_AUTH_SECRET = savedSecret;
    cache.flexptAuth = savedAuth;
  });

  it("fails fast with a clear message when BETTER_AUTH_SECRET is missing", () => {
    delete process.env.BETTER_AUTH_SECRET;
    delete cache.flexptAuth;

    expect(() => getAuth()).toThrow(/BETTER_AUTH_SECRET is not set/);
  });
});
