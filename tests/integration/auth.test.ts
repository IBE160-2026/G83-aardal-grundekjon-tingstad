import { randomUUID } from "node:crypto";

import { inArray, like } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { loginAction, logoutAction, registerAction } from "@/features/account/api";
import { withUser } from "@/shared/auth/session";
import { getDb } from "@/shared/db/client";
import { user } from "@/shared/db/schema";
import { ok } from "@/shared/lib/result";

// Runs against the compose Postgres (`docker compose up -d db && npm run db:migrate`). Skipped
// locally without DATABASE_URL; CI always sets it, so it always runs there.
const DATABASE_URL = process.env.DATABASE_URL;
// Test-only value, not a secret: Better Auth needs one to sign the session cookie.
process.env.BETTER_AUTH_SECRET ??= "integration-test-only-not-a-secret";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";

// A cookie jar standing in for the browser: next/headers reads it and nextCookies() writes it.
const jar = new Map<string, string>();

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
    }),
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

// One address domain per run, so parallel runs and leftovers never collide.
const DOMAIN = `run-${randomUUID().slice(0, 8)}.flexpt.test`;
const address = (local: string) => `${local}@${DOMAIN}`;

function form(email: string, password: string): FormData {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
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

const hasSessionCookie = () => [...jar.keys()].some((name) => name.includes("session_token"));

describe.skipIf(!DATABASE_URL)("account: register, log in, log out (Story 1.2)", () => {
  // The client connects on first use, so nothing touches the database when the suite is skipped.
  const usersWith = (emails: string[]) =>
    getDb()
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(inArray(user.email, emails));

  beforeEach(() => jar.clear());

  afterAll(async () => {
    await getDb()
      .delete(user)
      .where(like(user.email, `%@${DOMAIN}`));
  });

  it("registers with a trimmed, lower-cased email, signs in and goes to Uke", async () => {
    const email = address("mari");

    expect(
      await redirectOf(registerAction(null, form(`  ${email.toUpperCase()}  `, "hemmelig1"))),
    ).toBe("/uke");

    expect(await usersWith([email])).toHaveLength(1);
    expect(hasSessionCookie()).toBe(true);
  });

  it.each([
    {
      email: "mari@eksempel",
      password: "hemmelig1",
      field: "email",
      message: "Skriv en gyldig e-postadresse.",
    },
    {
      email: null,
      password: "1234567",
      field: "password",
      message: "Passordet er for kort. Bruk minst 8 tegn.",
    },
    {
      email: null,
      password: "x".repeat(129),
      field: "password",
      message: "Passordet er for langt. Bruk høyst 128 tegn.",
    },
  ])(
    "rejects an invalid $field and creates nothing ($message)",
    async ({ email, password, field, message }) => {
      const target = email ?? address(`invalid-${password.length}`);

      const result = await registerAction(null, form(target, password));

      expect(result).toMatchObject({
        ok: false,
        code: "invalid_input",
        fieldErrors: { [field]: message },
      });
      expect(await usersWith([target])).toHaveLength(0);
      expect(hasSessionCookie()).toBe(false);
    },
  );

  it("refuses an email that is already in use, in any case", async () => {
    const email = address("kari");
    await redirectOf(registerAction(null, form(email, "hemmelig1")));
    jar.clear();

    const result = await registerAction(null, form(email.toUpperCase(), "annetpassord"));

    expect(result).toMatchObject({
      ok: false,
      code: "email_in_use",
      fieldErrors: { email: "Det finnes allerede en konto med denne e-postadressen." },
    });
    expect(await usersWith([email])).toHaveLength(1);
  });

  it("creates exactly one account when the same registration is sent twice at once", async () => {
    const email = address("dobbel");

    const results = await Promise.allSettled([
      registerAction(null, form(email, "hemmelig1")),
      registerAction(null, form(email, "hemmelig1")),
    ]);

    expect(await usersWith([email])).toHaveLength(1);
    const redirected = results.filter(
      (result) => result.status === "rejected" && result.reason instanceof RedirectError,
    );
    const refused = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    expect(redirected).toHaveLength(1);
    expect(refused).toMatchObject([{ ok: false, code: "email_in_use" }]);
  });

  it("answers an unknown email and a wrong password with the same message", async () => {
    const email = address("per");
    await redirectOf(registerAction(null, form(email, "hemmelig1")));
    jar.clear();

    const unknown = await loginAction(null, form(address("ukjent"), "hemmelig1"));
    const wrongPassword = await loginAction(null, form(email, "feilpassord"));

    const expected = {
      ok: false,
      code: "invalid_credentials",
      message: "Feil e-post eller passord.",
    };
    expect(unknown).toEqual(expected);
    expect(wrongPassword).toEqual(expected);
    expect(hasSessionCookie()).toBe(false);
  });

  it("logs in with the right password, in any case, and logs out again", async () => {
    const email = address("lise");
    await redirectOf(registerAction(null, form(email, "hemmelig1")));
    jar.clear();
    const whoAmI = withUser(async (userId: string) => ok(userId));
    const [{ id }] = await usersWith([email]);

    expect(await redirectOf(loginAction(null, form(email.toUpperCase(), "hemmelig1")))).toBe(
      "/uke",
    );
    expect(await whoAmI()).toEqual({ ok: true, data: id });

    expect(await redirectOf(logoutAction())).toBe("/logg-inn");
    expect(hasSessionCookie()).toBe(false);
    expect(await whoAmI()).toMatchObject({ ok: false, code: "unauthorized" });
  });

  it("withUser returns unauthorized and does not run the handler without a session", async () => {
    const handler = vi.fn(async (userId: string) => ok(userId));

    expect(await withUser(handler)()).toEqual({
      ok: false,
      code: "unauthorized",
      message: "Du må logge inn på nytt.",
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("withUser passes the signed-in user's id and the arguments to the handler", async () => {
    const email = address("ola");
    await redirectOf(registerAction(null, form(email, "hemmelig1")));
    const [{ id }] = await usersWith([email]);

    const action = withUser(async (userId: string, note: string) => ok({ userId, note }));

    expect(await action("hei")).toEqual({ ok: true, data: { userId: id, note: "hei" } });
  });
});
