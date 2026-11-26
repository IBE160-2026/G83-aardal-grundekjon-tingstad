import { randomUUID } from "node:crypto";

import { eq, like } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { registerAction } from "@/features/account/api";
import { completeOnboardingAction } from "@/features/onboarding/api";
import { completeOnboarding } from "@/features/onboarding/complete";
import { parseKm, toProfile } from "@/features/onboarding/schemas";
import { getProfile } from "@/features/profile/api";
import { getAuth } from "@/shared/auth/server";
import { getDb } from "@/shared/db/client";
import { planVersion, planWeek, profile, program, user } from "@/shared/db/schema";

// Story 2.4: onboarding stores the profile and the first plan (FR2, NFR9, AD-4). Runs against the
// compose Postgres (`docker compose up -d db && npm run db:migrate`); skipped without DATABASE_URL,
// but never skipped in CI.
const DATABASE_URL = process.env.DATABASE_URL;
if (process.env.CI && !DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in CI: the integration tests may not be skipped there.",
  );
}
process.env.BETTER_AUTH_SECRET ||= "integration-test-only-not-a-secret";
process.env.BETTER_AUTH_URL ||= "http://localhost:3000";

// A cookie jar standing in for the browser: next/headers reads it and nextCookies() writes it.
const jar = new Map<string, string>();
const requestHeaders = () =>
  new Headers({ cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; ") });

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders(),
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    has: (name: string) => jar.has(name),
    set: (name: string, value: string, options?: { maxAge?: number }) => {
      if (options?.maxAge === 0 || value === "") jar.delete(name);
      else jar.set(name, value);
    },
    delete: (name: string) => jar.delete(name),
  }),
}));

class RedirectError extends Error {
  constructor(readonly url: string) {
    super(`redirect to ${url}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectError(url);
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

/** Waits for an action that should end in a redirect, and returns where it went. */
async function redirectOf(run: Promise<unknown>): Promise<string> {
  const error = await run.then(
    () => null,
    (reason: unknown) => reason,
  );
  if (!(error instanceof RedirectError)) {
    throw new Error(`expected a redirect, got ${JSON.stringify(error)}`);
  }
  return error.url;
}

const DOMAIN = `onb-${randomUUID().slice(0, 8)}.flexpt.test`;

const STRENGTH = {
  focus: "strength",
  mainFocus: "upper_body",
  experience: "experienced",
  sessionsPerWeek: 4,
  equipment: "home",
} as const;
const RUNNING = {
  focus: "running",
  goal: "10k",
  longestRun: "7,5",
  sessionsPerWeek: 3,
} as const;

describe("reading and mapping the answers", () => {
  it("accepts a decimal comma and point, and rejects anything that is not a plain number", () => {
    expect(parseKm("7,5")).toBe(7.5);
    expect(parseKm(" 12.25 ")).toBe(12.25);
    expect(parseKm("3")).toBe(3);
    for (const text of ["", "abc", "7,5 km", "-3", "1e2", "7,5,2", "٣"]) {
      expect(parseKm(text), text).toBeNull();
    }
  });

  it("keeps a longest run only between 1 and 50 km", () => {
    const run = (longestRun: string) => toProfile({ ...RUNNING, longestRun });
    expect(run("1")).toMatchObject({ longestRunKm: 1 });
    expect(run("50")).toMatchObject({ longestRunKm: 50 });
    for (const text of ["0,5", "0", "50,1", "51", "abc", ""]) expect(run(text), text).toBeNull();
  });

  it("stores `beginner` for running, which does not ask about experience", () => {
    expect(toProfile(RUNNING)).toEqual({
      focus: "running",
      experience: "beginner",
      goal: "10k",
      longestRunKm: 7.5,
      sessionsPerWeek: 3,
    });
  });
});

describe.skipIf(!DATABASE_URL)("finishing onboarding (Story 2.4)", () => {
  /** Registers a new user in a fresh browser and returns the id. */
  async function newUser(): Promise<string> {
    jar.clear();
    const data = new FormData();
    data.set("email", `${randomUUID().slice(0, 8)}@${DOMAIN}`);
    data.set("password", "hemmelig1");
    expect(await redirectOf(registerAction(null, data))).toBe("/uke");
    const signedIn = await getAuth().api.getSession({ headers: requestHeaders() });
    return signedIn!.user.id;
  }

  async function rows(userId: string) {
    const db = getDb();
    return {
      profile: (await db.select().from(profile).where(eq(profile.userId, userId))).length,
      program: (await db.select().from(program).where(eq(program.userId, userId))).length,
      planWeek: (await db.select().from(planWeek).where(eq(planWeek.userId, userId))).length,
      planVersion: (await db.select().from(planVersion).where(eq(planVersion.userId, userId)))
        .length,
    };
  }

  beforeEach(() => jar.clear());

  afterAll(async () => {
    await getDb()
      .delete(user)
      .where(like(user.email, `%@${DOMAIN}`));
  });

  it("stores the strength profile, the program and the first week, then goes to Uke", async () => {
    const id = await newUser();

    expect(await redirectOf(completeOnboardingAction(STRENGTH))).toBe("/uke");

    expect(await getProfile(id)).toEqual({
      focus: "strength",
      experience: "experienced",
      mainFocus: "upper_body",
      sessionsPerWeek: 4,
      equipment: "home",
    });
    expect(await rows(id)).toEqual({ profile: 1, program: 1, planWeek: 1, planVersion: 1 });
  });

  it("stores the running profile with the longest run typed with a comma", async () => {
    const id = await newUser();

    expect(await redirectOf(completeOnboardingAction(RUNNING))).toBe("/uke");

    expect(await getProfile(id)).toEqual({
      focus: "running",
      experience: "beginner",
      goal: "10k",
      longestRunKm: 7.5,
      sessionsPerWeek: 3,
    });
    expect((await rows(id)).program).toBe(1);
  });

  it("creates one profile, one program and one week when the button is pressed twice (NFR9)", async () => {
    const id = await newUser();

    const results = await Promise.all([
      redirectOf(completeOnboardingAction(STRENGTH)),
      redirectOf(completeOnboardingAction(STRENGTH)),
      redirectOf(completeOnboardingAction(STRENGTH)),
    ]);

    expect(results).toEqual(["/uke", "/uke", "/uke"]);
    expect(await rows(id)).toEqual({ profile: 1, program: 1, planWeek: 1, planVersion: 1 });
  });

  it("never overwrites an existing profile: a later post changes nothing", async () => {
    const id = await newUser();
    await redirectOf(completeOnboardingAction(STRENGTH));

    expect(
      await redirectOf(completeOnboardingAction({ ...RUNNING, goal: "5k", longestRun: "2" })),
    ).toBe("/uke");

    expect((await getProfile(id))?.focus).toBe("strength");
    expect(await rows(id)).toEqual({ profile: 1, program: 1, planWeek: 1, planVersion: 1 });
  });

  it("rejects a longest run outside 1–50 km with the text under the field, and stores nothing", async () => {
    const id = await newUser();

    for (const longestRun of ["0,5", "51", "abc", "", "7,5 km"]) {
      const result = await completeOnboardingAction({ ...RUNNING, longestRun });
      expect(result, longestRun).toMatchObject({
        ok: false,
        code: "invalid_input",
        fieldErrors: { longestRun: expect.stringContaining("mellom 1 og 50 km") },
      });
    }
    expect(await rows(id)).toEqual({ profile: 0, program: 0, planWeek: 0, planVersion: 0 });
  });

  it("rejects missing and unknown values, and stores nothing", async () => {
    const id = await newUser();
    const bad: unknown[] = [
      null,
      "strength",
      {},
      { focus: "swimming", sessionsPerWeek: 3 },
      { ...STRENGTH, mainFocus: "arms" },
      { ...STRENGTH, experience: "pro" },
      { ...STRENGTH, equipment: "pool" },
      { ...STRENGTH, sessionsPerWeek: 1 },
      { ...STRENGTH, sessionsPerWeek: 6 },
      { ...STRENGTH, sessionsPerWeek: "3" },
      { ...STRENGTH, sessionsPerWeek: 2.5 },
      { ...STRENGTH, equipment: undefined },
      { ...STRENGTH, goal: "10k" },
      { ...RUNNING, goal: "marathon" },
      { ...RUNNING, goal: undefined },
      { ...RUNNING, mainFocus: "upper_body" },
      { ...STRENGTH, userId: "someone-else" },
    ];

    for (const answers of bad) {
      expect(await completeOnboardingAction(answers), JSON.stringify(answers)).toMatchObject({
        ok: false,
        code: "invalid_input",
      });
    }
    expect(await rows(id)).toEqual({ profile: 0, program: 0, planWeek: 0, planVersion: 0 });
  });

  it("does nothing without a session", async () => {
    jar.clear();

    expect(await completeOnboardingAction(STRENGTH)).toMatchObject({
      ok: false,
      code: "unauthorized",
    });
  });

  it("stores only for the signed-in user, never for another", async () => {
    const other = await newUser();
    const id = await newUser();

    await redirectOf(completeOnboardingAction(STRENGTH));

    expect(await rows(id)).toMatchObject({ profile: 1 });
    expect(await rows(other)).toEqual({ profile: 0, program: 0, planWeek: 0, planVersion: 0 });
  });

  it("completeOnboarding is also safe to call directly for a user who has a profile", async () => {
    const id = await newUser();
    await redirectOf(completeOnboardingAction(STRENGTH));

    expect(await completeOnboarding(id, { nonsense: true }, new Date())).toEqual({
      ok: true,
      data: null,
    });
  });
});
