import { afterEach, describe, expect, it } from "vitest";

import { getAuth, resolveBaseUrl } from "@/shared/auth/server";

describe("resolveBaseUrl", () => {
  it("uses BETTER_AUTH_URL when it is set", () => {
    expect(
      resolveBaseUrl({
        BETTER_AUTH_URL: "https://flexpt.example",
        VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app",
      }),
    ).toBe("https://flexpt.example");
  });

  it("falls back to Vercel's production host with https", () => {
    expect(resolveBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app" })).toBe(
      "https://app.vercel.app",
    );
  });

  it("is undefined locally, so Better Auth infers it", () => {
    expect(resolveBaseUrl({})).toBeUndefined();
  });

  it("treats an empty BETTER_AUTH_URL as not set", () => {
    expect(resolveBaseUrl({ BETTER_AUTH_URL: "" })).toBeUndefined();
  });
});

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
