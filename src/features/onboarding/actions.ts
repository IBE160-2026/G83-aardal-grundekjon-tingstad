"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserId, UNAUTHORIZED_MESSAGE } from "@/shared/auth/session";
import { type ActionResult, fail } from "@/shared/lib/result";

import { completeOnboarding } from "./complete";
import { MESSAGES } from "./schemas";

/**
 * The last onboarding button: stores the profile and the first plan, then goes to Uke. The user id
 * comes only from the session. A validation error comes back as a result and keeps the user in
 * the flow; success never returns because it redirects.
 */
export async function completeOnboardingAction(answers: unknown): Promise<ActionResult<null>> {
  const userId = await getUserId();
  if (!userId) return fail("unauthorized", UNAUTHORIZED_MESSAGE);

  let result: ActionResult<null>;
  try {
    result = await completeOnboarding(userId, answers, new Date());
  } catch (error) {
    console.error("Onboarding failed", error);
    return fail("unexpected", MESSAGES.unexpected);
  }
  if (!result.ok) return result;

  revalidatePath("/", "layout");
  redirect("/uke");
}
