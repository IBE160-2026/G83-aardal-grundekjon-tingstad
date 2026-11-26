"use server";

import { isAPIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth, MAX_PASSWORD_LENGTH } from "@/shared/auth/server";
import { getUserId, LOGIN_PATH } from "@/shared/auth/session";
import { getDb } from "@/shared/db/client";
import { user } from "@/shared/db/schema";
import { type ActionResult, fail } from "@/shared/lib/result";

import { fieldErrorsOf, loginSchema, MESSAGES, registerSchema } from "./schemas";

/** State of the login and registration forms: null before the first submit. */
export type AuthFormState = ActionResult<null> | null;

const HOME_PATH = "/uke";

function readCredentials(formData: FormData) {
  return { email: formData.get("email"), password: formData.get("password") };
}

function errorCode(error: unknown): string | undefined {
  return isAPIError(error) ? error.body?.code : undefined;
}

async function emailExists(email: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return rows.length > 0;
}

const emailInUse = () =>
  fail<null>("email_in_use", MESSAGES.emailInUse, { email: MESSAGES.emailInUse });

/**
 * Creates the account, signs the user in and goes to Uke. The email is trimmed and lower-cased.
 * Better Auth requires a name; none is collected (UX-DR21 handles a missing name), so it is "".
 */
export async function registerAction(_previous: AuthFormState, formData: FormData) {
  const parsed = registerSchema.safeParse(readCredentials(formData));
  if (!parsed.success) {
    return fail<null>("invalid_input", MESSAGES.checkFields, fieldErrorsOf(parsed.error));
  }
  const { email, password } = parsed.data;

  try {
    await getAuth().api.signUpEmail({
      body: { email, password, name: "" },
      headers: await headers(),
    });
  } catch (error) {
    const code = errorCode(error);
    if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
      return emailInUse();
    }
    // A concurrent sign-up with the same email loses on the unique constraint and surfaces as a
    // generic failure: if the account now exists, answer as for an email that is in use.
    if (await emailExists(email).catch(() => false)) return emailInUse();
    console.error("Registration failed", code ?? error);
    return fail<null>("unexpected", MESSAGES.unexpected);
  }
  redirect(HOME_PATH);
}

/** Signs the user in and goes to Uke. Unknown email and wrong password get the same answer. */
export async function loginAction(_previous: AuthFormState, formData: FormData) {
  const parsed = loginSchema.safeParse(readCredentials(formData));
  if (!parsed.success) {
    return fail<null>("invalid_input", MESSAGES.checkFields, fieldErrorsOf(parsed.error));
  }
  const { email, password } = parsed.data;
  const wrongLogin = fail<null>("invalid_credentials", MESSAGES.wrongLogin);
  if (password.length > MAX_PASSWORD_LENGTH) return wrongLogin;

  try {
    await getAuth().api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) return wrongLogin;
    console.error("Login failed", errorCode(error) ?? error);
    return fail<null>("unexpected", MESSAGES.unexpected);
  }
  redirect(HOME_PATH);
}

/** Ends the session (and its cookie). No valid session to end means already logged out. */
async function endSession(): Promise<void> {
  try {
    await getAuth().api.signOut({ headers: await headers() });
  } catch (error) {
    if (!isAPIError(error)) throw error;
  }
}

/** Ends the session, clears cached app pages and goes to the login screen. */
export async function logoutAction(): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
  redirect(LOGIN_PATH);
}

/**
 * Deletes the signed-in user for good (Story 1.5, FR16) and goes to the login screen. The user id
 * comes only from the session, so nobody can delete another user. One DELETE on the user row:
 * sessions, accounts, the profile and every later user-owned table go with it (ON DELETE CASCADE).
 * Without a session (a second press, or already deleted) it just goes to the login screen.
 */
export async function deleteAccountAction(): Promise<ActionResult<null>> {
  const userId = await getUserId();
  if (userId) {
    try {
      await getDb().delete(user).where(eq(user.id, userId));
    } catch (error) {
      console.error("Account deletion failed", error);
      return fail<null>("unexpected", MESSAGES.unexpected);
    }
  }
  // The session row is gone with the user; this clears the cookie.
  await endSession();
  revalidatePath("/", "layout");
  redirect(LOGIN_PATH);
}
