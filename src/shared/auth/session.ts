import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { type ActionResult, fail } from "../lib/result";
import { getAuth } from "./server";

export const LOGIN_PATH = "/logg-inn";
export const UNAUTHORIZED_MESSAGE = "Du må logge inn på nytt.";

/**
 * The signed-in user's id, or null when there is no valid session. Cached per request, so the
 * layout and the page share one session lookup.
 */
export const getUserId = cache(async (): Promise<string | null> => {
  // Read the request first: it marks the page as dynamic before Better Auth is created, so
  // `next build` never needs the runtime secret or database.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  return session?.user.id ?? null;
});

/** The signed-in user's id. Redirects to the login screen when there is no valid session. */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) redirect(LOGIN_PATH);
  return userId;
}

/**
 * Wraps a server action so it runs only for a signed-in user, who is passed in as the first
 * argument. Without a session it returns `{ ok: false, code: "unauthorized" }` and the
 * handler does not run.
 */
export function withUser<Args extends unknown[], T>(
  handler: (userId: string, ...args: Args) => Promise<ActionResult<T>>,
): (...args: Args) => Promise<ActionResult<T>> {
  return async (...args: Args) => {
    const userId = await getUserId();
    if (!userId) return fail("unauthorized", UNAUTHORIZED_MESSAGE);
    return handler(userId, ...args);
  };
}
