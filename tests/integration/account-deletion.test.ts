import { randomUUID } from "node:crypto";

import { eq, like, sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAccountAction, loginAction, registerAction } from "@/features/account/api";
import { MESSAGES } from "@/features/account/schemas";
import { ensureCurrentWeek } from "@/features/plan/api";
import { saveProfile } from "@/features/profile/api";
import { startDemo } from "@/seed/demo";
import { getAuth } from "@/shared/auth/server";
import * as dbClient from "@/shared/db/client";
import { getDb } from "@/shared/db/client";
import {
  account,
  planVersion,
  planWeek,
  profile,
  program,
  session,
  sessionSlot,
  user,
  userHint,
  versionSession,
} from "@/shared/db/schema";

// Story 1.5: «Slett» deletes the signed-in user and everything they own (FR16, NFR2, NFR9).
// Runs against the compose Postgres (`docker compose up -d db && npm run db:migrate`); skipped
// without DATABASE_URL.
//
// EVERY LATER STORY THAT ADDS A USER-OWNED TABLE EXTENDS THIS TEST: add the table to
// USER_OWNED_TABLES (with its user id column) and give the user a row in it in `signedInUser`.
// The guard test below fails until you do.
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

/** Every table with a foreign key to "user", and the column holding the user id. */
const USER_OWNED_TABLES = {
  session: session.userId,
  account: account.userId,
  profile: profile.userId,
  program: program.userId,
  plan_week: planWeek.userId,
  plan_version: planVersion.userId,
  session_slot: sessionSlot.userId,
  version_session: versionSession.userId,
  user_hint: userHint.userId,
} as const;

// A user with a profile and a plan for Monday 2026-11-23: profile A has two sessions (Tue, Thu).
const PLAN_DAY = new Date("2026-11-23T10:00:00Z");
const WITH_PLAN = {
  user: 1,
  session: 1,
  account: 1,
  profile: 1,
  program: 1,
  plan_week: 1,
  plan_version: 1,
  session_slot: 2,
  version_session: 2,
  user_hint: 1,
};
// A demo user has a profile but no plan yet; every plan table is empty.
const DEMO_ONLY = {
  ...WITH_PLAN,
  program: 0,
  plan_week: 0,
  plan_version: 0,
  session_slot: 0,
  version_session: 0,
  user_hint: 0,
};
const NOTHING = Object.fromEntries(Object.keys(WITH_PLAN).map((name) => [name, 0]));

const DOMAIN = `run-${randomUUID().slice(0, 8)}.flexpt.test`;
const PASSWORD = "hemmelig1";

function credentials(email: string, password = PASSWORD): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

describe.skipIf(!DATABASE_URL)("deleting the account (Story 1.5)", () => {
  /** The rows left for a user: in "user" and in every user-owned table. */
  async function rowsOf(userId: string): Promise<Record<string, number>> {
    const db = getDb();
    const counts: Record<string, number> = {
      user: (await db.select().from(user).where(eq(user.id, userId))).length,
    };
    for (const [name, column] of Object.entries(USER_OWNED_TABLES)) {
      counts[name] = (await db.select().from(column.table).where(eq(column, userId))).length;
    }
    return counts;
  }

  /** Registers in a fresh browser, gives the user a row in every user-owned table, returns the id. */
  async function signedInUser(): Promise<{ id: string; email: string }> {
    jar.clear();
    const email = `delete-${randomUUID().slice(0, 8)}@${DOMAIN}`;
    expect(await redirectOf(registerAction(null, credentials(email)))).toBe("/uke");
    const signedIn = await getAuth().api.getSession({ headers: requestHeaders() });
    const id = signedIn!.user.id;
    // session and account come from the sign-up; profile is added here.
    await saveProfile(id, {
      focus: "strength",
      experience: "beginner",
      mainFocus: "full_body",
      sessionsPerWeek: 2,
      equipment: "gym",
    });
    // The plan tables and a closed hint: program, week, version, two slots and their sessions.
    await ensureCurrentWeek(id, PLAN_DAY);
    await getDb().insert(userHint).values({ userId: id, hintKey: "welcome" });
    return { id, email };
  }

  const currentSession = () => getAuth().api.getSession({ headers: requestHeaders() });

  beforeEach(() => jar.clear());

  afterAll(async () => {
    await getDb()
      .delete(user)
      .where(like(user.email, `%@${DOMAIN}`));
  });

  it("covers every table that references the user, and each one cascades", async () => {
    const rows = await getDb().execute<{ table_name: string }>(sql`
      select distinct conrelid::regclass::text as table_name
      from pg_constraint
      where contype = 'f' and confrelid = '"user"'::regclass`);
    const tables = rows.map((row) => row.table_name.replaceAll('"', "")).sort();

    expect(tables).toEqual(Object.keys(USER_OWNED_TABLES).sort());
  });

  it("every foreign key on the way down from the user cascades, also through other tables", async () => {
    // Walks the foreign keys from "user" to the tables that hang off user-owned tables, so a later
    // table like sets → session log → plan cannot block or survive the user DELETE.
    const notCascading = await getDb().execute<{ fk: string }>(sql`
      with recursive owned(table_oid) as (
        select '"user"'::regclass::oid
        union
        select c.conrelid from pg_constraint c join owned o on c.confrelid = o.table_oid
        where c.contype = 'f'
      )
      select c.conname as fk from pg_constraint c join owned o on c.confrelid = o.table_oid
      where c.contype = 'f' and c.confdeltype <> 'c'`);

    expect(notCascading.map((row) => row.fk)).toEqual([]);
  });

  it("«Slett» deletes the user and every row they own, ends the session and goes to login", async () => {
    const { id } = await signedInUser();
    expect(await rowsOf(id)).toEqual(WITH_PLAN);

    expect(await redirectOf(deleteAccountAction())).toBe("/logg-inn");

    expect(await rowsOf(id)).toEqual(NOTHING);
    expect(await currentSession()).toBeNull();
    expect([...jar.keys()].filter((name) => name.includes("session_token"))).toEqual([]);
  });

  it("keeps the theme cookie: it belongs to the device, not the account", async () => {
    await signedInUser();
    jar.set("theme", "dark");

    await redirectOf(deleteAccountAction());

    expect(jar.get("theme")).toBe("dark");
  });

  it("a demo user can delete their account as well", async () => {
    jar.clear();
    const id = await startDemo("C", new Date());
    expect(await rowsOf(id)).toEqual(DEMO_ONLY);
    // After the first Uke visit the demo user has a plan too, and that goes with the account.
    await ensureCurrentWeek(id, PLAN_DAY);
    expect((await rowsOf(id)).plan_week).toBe(1);

    expect(await redirectOf(deleteAccountAction())).toBe("/logg-inn");

    expect(await rowsOf(id)).toEqual(NOTHING);
  });

  it("the deleted user can no longer log in", async () => {
    const { email } = await signedInUser();
    await redirectOf(deleteAccountAction());

    expect(await loginAction(null, credentials(email))).toMatchObject({
      ok: false,
      code: "invalid_credentials",
    });
    expect(await currentSession()).toBeNull();
  });

  it("pressing «Slett» twice gives one deletion and two redirects to login", async () => {
    const { id } = await signedInUser();

    const [first, second] = await Promise.all([
      redirectOf(deleteAccountAction()),
      redirectOf(deleteAccountAction()),
    ]);
    expect([first, second]).toEqual(["/logg-inn", "/logg-inn"]);
    expect(await rowsOf(id)).toEqual(NOTHING);

    // A later re-post without a session also just goes to login.
    expect(await redirectOf(deleteAccountAction())).toBe("/logg-inn");
  });

  it("deletes only the signed-in user, never another one", async () => {
    const other = await signedInUser();
    const { id } = await signedInUser();

    await redirectOf(deleteAccountAction());

    expect(await rowsOf(id)).toEqual(NOTHING);
    expect(await rowsOf(other.id)).toEqual(WITH_PLAN);
  });

  it("a database failure deletes nothing, keeps the session and returns an error", async () => {
    const { id } = await signedInUser();
    const realDb = getDb();
    const failing = new Proxy(realDb, {
      get: (target, property, receiver) =>
        property === "delete"
          ? () => ({ where: () => Promise.reject(new Error("database down")) })
          : Reflect.get(target, property, receiver),
    });
    const spy = vi.spyOn(dbClient, "getDb").mockReturnValue(failing);
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      expect(await deleteAccountAction()).toEqual({
        ok: false,
        code: "unexpected",
        message: MESSAGES.unexpected,
      });
      expect(logged).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      logged.mockRestore();
    }
    expect(await rowsOf(id)).toEqual(WITH_PLAN);
    expect((await currentSession())?.user.id).toBe(id);
  });
});
