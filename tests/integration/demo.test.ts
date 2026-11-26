import { randomUUID } from "node:crypto";

import { isAPIError } from "better-auth/api";
import { eq, inArray, like } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { registerAction } from "@/features/account/api";
import { getProfile, saveProfile } from "@/features/profile/api";
import * as profileModule from "@/features/profile/profile";
import { startDemoAction } from "@/seed/actions";
import { startDemo } from "@/seed/demo";
import { DEMO_PROFILES } from "@/seed/demo-profiles";
import { getAuth } from "@/shared/auth/server";
import { isDemoSession } from "@/shared/auth/session";
import { getDb } from "@/shared/db/client";
import { account, profile, session, user } from "@/shared/db/schema";

// Story 1.4: «Prøv demo» builds a fresh demo user through Better Auth's sign-up, stores the
// Appendix B profile, and cleans up demo users older than 24 h. Runs against the compose
// Postgres (`docker compose up -d db && npm run db:migrate`); skipped without DATABASE_URL.
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

const DOMAIN = `run-${randomUUID().slice(0, 8)}.flexpt.test`;
const HOUR = 60 * 60 * 1000;

function profileForm(key: string): FormData {
  const data = new FormData();
  data.set("profile", key);
  return data;
}

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

/** The error a Better Auth call rejects with, or null when it succeeds. */
async function rejectionOf(run: Promise<unknown>): Promise<unknown> {
  return run.then(
    () => null,
    (reason: unknown) => reason,
  );
}

describe.skipIf(!DATABASE_URL)("demo users (Story 1.4)", () => {
  // Every demo user this suite creates, so afterAll removes them all.
  const created: string[] = [];

  const userRow = async (id: string) =>
    (await getDb().select().from(user).where(eq(user.id, id)))[0];
  const demoUserCount = async () =>
    (await getDb().select({ id: user.id }).from(user).where(eq(user.isDemo, true))).length;
  const backdate = (id: string, createdAt: Date) =>
    getDb().update(user).set({ createdAt }).where(eq(user.id, id));

  /** Starts a demo in a fresh browser and returns the new user's id. */
  async function demoUser(key: "A" | "B" | "C" | "D", now = new Date()): Promise<string> {
    jar.clear();
    const id = await startDemo(key, now);
    created.push(id);
    return id;
  }

  beforeEach(() => jar.clear());

  afterAll(async () => {
    if (created.length > 0) await getDb().delete(user).where(inArray(user.id, created));
    await getDb()
      .delete(user)
      .where(like(user.email, `%@${DOMAIN}`));
  });

  it("«Profil C» creates a signed-in demo user with profile C and goes to Uke", async () => {
    expect(await redirectOf(startDemoAction(profileForm("C")))).toBe("/uke");

    expect(await isDemoSession()).toBe(true);
    const signedIn = await getAuth().api.getSession({ headers: requestHeaders() });
    const id = signedIn!.user.id;
    created.push(id);

    const row = await userRow(id);
    expect(row.isDemo).toBe(true);
    expect(row.email).toMatch(/^demo-[0-9a-f-]{36}@demo\.flexpt\.invalid$/);
    expect(await getProfile(id)).toEqual({
      focus: "running",
      experience: "beginner",
      goal: "10k",
      longestRunKm: 3,
      sessionsPerWeek: 3,
    });
  });

  it.each([
    [
      "A",
      {
        focus: "strength",
        experience: "beginner",
        mainFocus: "full_body",
        sessionsPerWeek: 2,
        equipment: "gym",
      },
    ],
    [
      "B",
      {
        focus: "strength",
        experience: "experienced",
        mainFocus: "full_body",
        sessionsPerWeek: 5,
        equipment: "gym",
      },
    ],
    [
      "D",
      {
        focus: "running",
        experience: "experienced",
        goal: "half_marathon",
        longestRunKm: 15,
        sessionsPerWeek: 4,
      },
    ],
  ] as const)("profile %s stores the Appendix B values", async (key, expected) => {
    const id = await demoUser(key);
    expect(await getProfile(id)).toEqual(expected);
  });

  it("two visitors who both pick A get two users with their own profile rows", async () => {
    const first = await demoUser("A");
    const second = await demoUser("A");

    expect(first).not.toBe(second);
    const rows = await getDb()
      .select({ id: profile.id, userId: profile.userId })
      .from(profile)
      .where(inArray(profile.userId, [first, second]));
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.id)).size).toBe(2);
    expect(new Set(rows.map((row) => row.userId))).toEqual(new Set([first, second]));

    // Changing the second visitor's profile leaves the first one's untouched.
    await saveProfile(second, { ...DEMO_PROFILES.A.profile, sessionsPerWeek: 4 });
    expect(await getProfile(first)).toEqual(DEMO_PROFILES.A.profile);
    expect(await getProfile(second)).toMatchObject({ sessionsPerWeek: 4 });
    expect(await getProfile(`missing-${randomUUID()}`)).toBeNull();
  });

  it("the next demo start deletes only demo users older than 24 h", async () => {
    const now = new Date();
    const stale = await demoUser("B");
    const fresh = await demoUser("C");
    jar.clear();
    const email = `normal@${DOMAIN}`;
    const data = new FormData();
    data.set("email", email);
    data.set("password", "hemmelig1");
    await redirectOf(registerAction(null, data));
    const [normal] = await getDb().select().from(user).where(eq(user.email, email));

    await backdate(stale, new Date(now.getTime() - 25 * HOUR));
    await backdate(fresh, new Date(now.getTime() - 1 * HOUR));
    await backdate(normal.id, new Date(now.getTime() - 30 * 24 * HOUR));

    await demoUser("A", now);

    expect(await userRow(stale)).toBeUndefined();
    expect(await getProfile(stale)).toBeNull();
    expect(await getDb().select().from(session).where(eq(session.userId, stale))).toEqual([]);
    expect(await getDb().select().from(account).where(eq(account.userId, stale))).toEqual([]);
    expect(await userRow(fresh)).toBeDefined();
    expect(await getProfile(fresh)).not.toBeNull();
    expect(await userRow(normal.id)).toBeDefined();
  });

  it.each(["E", "x", ""])("an unknown profile %j creates no user", async (key) => {
    const before = await demoUserCount();

    expect(await startDemoAction(profileForm(key))).toEqual({
      ok: false,
      code: "invalid",
      message: "Velg en av profilene A–D.",
    });
    expect(await demoUserCount()).toBe(before);
    expect(await isDemoSession()).toBe(false);
  });

  it("a failed profile save leaves no demo user and no session", async () => {
    const before = await demoUserCount();
    const spy = vi
      .spyOn(profileModule, "saveProfile")
      .mockRejectedValueOnce(new Error("database down"));
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);

    try {
      expect(await startDemoAction(profileForm("A"))).toEqual({
        ok: false,
        code: "unexpected",
        message: "Vi fikk ikke startet demoen. Prøv igjen om litt.",
      });
    } finally {
      spy.mockRestore();
    }
    expect(await demoUserCount()).toBe(before);
    expect(await isDemoSession()).toBe(false);
  });

  it.each([
    ["a strength profile with a running goal", { ...DEMO_PROFILES.A.profile, goal: "10k" }],
    [
      "a running profile without longestRunKm",
      { focus: "running", experience: "beginner", goal: "10k", sessionsPerWeek: 3 },
    ],
    ["six sessions per week", { ...DEMO_PROFILES.B.profile, sessionsPerWeek: 6 }],
    ["a longest run of 0 km", { ...DEMO_PROFILES.C.profile, longestRunKm: 0 }],
    ["an unknown focus", { ...DEMO_PROFILES.A.profile, focus: "yoga" }],
  ])("saveProfile rejects %s and stores nothing", async (_name, input) => {
    const id = await demoUser("D");
    const stored = await getProfile(id);

    await expect(saveProfile(id, input)).rejects.toThrow();
    expect(await getProfile(id)).toEqual(stored);
  });

  it("a demo user cannot change the password", async () => {
    const id = await demoUser("A");
    const passwordOf = async () =>
      (
        await getDb()
          .select({ password: account.password })
          .from(account)
          .where(eq(account.userId, id))
      )[0].password;
    const before = await passwordOf();

    const error = await rejectionOf(
      getAuth().api.changePassword({
        body: { currentPassword: "gjetning1", newPassword: "nyttpassord1" },
        headers: requestHeaders(),
      }),
    );

    expect(isAPIError(error) && error.status).toBe("FORBIDDEN");
    expect(isAPIError(error) && error.body?.message).toBe(
      "Demobrukeren kan ikke endre e-post eller passord.",
    );
    expect(await passwordOf()).toBe(before);
  });

  it("a demo user cannot change the email", async () => {
    const id = await demoUser("D");
    const { email } = await userRow(id);

    const error = await rejectionOf(
      getAuth().api.changeEmail({
        body: { newEmail: `ny@${DOMAIN}` },
        headers: requestHeaders(),
      }),
    );

    expect(isAPIError(error) && error.status).toBe("FORBIDDEN");
    expect((await userRow(id)).email).toBe(email);
  });

  it("a registered user is not a demo user and may still change the password", async () => {
    const email = `vanlig@${DOMAIN}`;
    const data = new FormData();
    data.set("email", email);
    data.set("password", "hemmelig1");
    await redirectOf(registerAction(null, data));

    expect(await isDemoSession()).toBe(false);
    const [row] = await getDb().select().from(user).where(eq(user.email, email));
    expect(row.isDemo).toBe(false);

    const error = await rejectionOf(
      getAuth().api.changePassword({
        body: { currentPassword: "hemmelig1", newPassword: "nyttpassord1" },
        headers: requestHeaders(),
      }),
    );
    expect(error).toBeNull();
  });

  it("a sign-up request cannot make itself a demo user", async () => {
    const email = `lur@${DOMAIN}`;
    const error = await rejectionOf(
      getAuth().api.signUpEmail({
        body: { email, password: "hemmelig1", name: "", isDemo: true } as never,
        headers: requestHeaders(),
      }),
    );
    const [row] = await getDb().select().from(user).where(eq(user.email, email));
    // Better Auth 1.7 ignores an `input: false` field: the user is created as a normal user.
    expect(error).toBeNull();
    expect(row).toBeDefined();
    expect(row.isDemo).toBe(false);
  });
});
