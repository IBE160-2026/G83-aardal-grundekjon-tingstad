import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import { and, eq, lt } from "drizzle-orm";
import { headers } from "next/headers";

import { getAuth } from "@/shared/auth/server";
import { getDb } from "@/shared/db/client";
import { user } from "@/shared/db/schema";

// Demo users (Story 1.4, AD-16): one fresh user per «Prøv demo», deleted 24 h later.

export const DEMO_EMAIL_DOMAIN = "demo.flexpt.invalid";
export const DEMO_USER_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes demo users created more than 24 h before `now`, with everything they own (sessions,
 * accounts and profile go by ON DELETE CASCADE). Normal users are never touched. Returns how
 * many were deleted.
 */
export async function deleteStaleDemoUsers(now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - DEMO_USER_LIFETIME_MS);
  const deleted = await getDb()
    .delete(user)
    .where(and(eq(user.isDemo, true), lt(user.createdAt, cutoff)))
    .returning({ id: user.id });
  return deleted.length;
}

/**
 * Creates a demo user through Better Auth's own sign-up, which also signs them in (the session
 * cookie is set by nextCookies(), no bypass), then marks the user as demo. The address and the
 * random password are never shown. Returns the new user's id.
 */
export async function signUpDemoUser(): Promise<string> {
  const email = `demo-${randomUUID()}@${DEMO_EMAIL_DOMAIN}`;
  const password = randomBytes(24).toString("base64url");
  const { user: created } = await getAuth().api.signUpEmail({
    body: { email, password, name: "" },
    headers: await headers(),
  });
  try {
    await getDb().update(user).set({ isDemo: true }).where(eq(user.id, created.id));
  } catch (error) {
    // Never leave an ordinary signed-in user with an unknown password behind; the session goes
    // with the user (ON DELETE CASCADE).
    await getDb().delete(user).where(eq(user.id, created.id));
    throw error;
  }
  return created.id;
}

/** Deletes one demo user with everything they own. Never touches a normal user. */
export async function deleteDemoUser(userId: string): Promise<void> {
  await getDb()
    .delete(user)
    .where(and(eq(user.id, userId), eq(user.isDemo, true)));
}
