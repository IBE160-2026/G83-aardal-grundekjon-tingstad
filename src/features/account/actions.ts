"use server";

import { isAPIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/shared/auth/server";
import { getDb } from "@/shared/db/client";
import { user } from "@/shared/db/schema";
import { type ActionResult, fail } from "@/shared/lib/result";

import { fieldErrorsOf, loginSchema, MESSAGES, PASSWORD_MAX, registerSchema } from "./schemas";

/** State of the login and registration forms: null before the first submit. */
export type AuthFormState = ActionResult<null> | null;

const HOME_PATH = "/uke";
const LOGIN_PATH = "/logg-inn";

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
  if (password.length > PASSWORD_MAX) return wrongLogin;

  try {
    await getAuth().api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (error) {
    if (isAPIError(error) && error.statusCode < 500) return wrongLogin;
    console.error("Login failed", errorCode(error) ?? error);
    return fail<null>("unexpected", MESSAGES.unexpected);
  }
  redirect(HOME_PATH);
}

/** Ends the session, clears cached app pages and goes to the login screen. */
export async function logoutAction(): Promise<void> {
  try {
    await getAuth().api.signOut({ headers: await headers() });
  } catch (error) {
    // No valid session to end: the user is already logged out.
    if (!isAPIError(error)) throw error;
  }
  revalidatePath("/", "layout");
  redirect(LOGIN_PATH);
}
