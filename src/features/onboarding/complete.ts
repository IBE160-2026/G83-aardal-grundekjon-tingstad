import "server-only";

import { ensureCurrentWeek } from "@/features/plan/api";
import { getProfile, saveProfile } from "@/features/profile/api";
import { type ActionResult, fail, ok } from "@/shared/lib/result";

import { answersSchema, MESSAGES, toProfile } from "./schemas";

/**
 * Finishes onboarding for a user: validates the answers, stores the profile through `profile.api`
 * and creates the program and first week through `plan.api` (idempotent). A user who already has
 * a profile is left alone: onboarding never overwrites it (Story 2.6 edits it), so pressing the
 * last button twice, or re-posting it, changes nothing.
 */
export async function completeOnboarding(
  userId: string,
  answers: unknown,
  now: Date,
): Promise<ActionResult<null>> {
  if (await getProfile(userId)) return ok(null);

  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success) return fail("invalid_input", MESSAGES.checkAnswers);

  const profile = toProfile(parsed.data);
  if (!profile) {
    return fail("invalid_input", MESSAGES.longestRun, { longestRun: MESSAGES.longestRun });
  }

  await saveProfile(userId, profile);
  await ensureCurrentWeek(userId, now);
  return ok(null);
}
