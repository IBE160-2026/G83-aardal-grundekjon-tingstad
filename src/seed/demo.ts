import "server-only";

import { deleteDemoUser, deleteStaleDemoUsers, signUpDemoUser } from "@/features/account/api";
import { saveProfile } from "@/features/profile/api";

import { DEMO_PROFILES, type DemoProfileKey } from "./demo-profiles";

/**
 * Builds a fresh demo user for profile `key` and signs them in (AD-16): first deletes demo
 * users older than 24 h before `now`, then signs up a new demo user and stores the profile.
 * If storing the profile fails, the new user is deleted again. The e2e tests get their demo fixtures through the same function. Returns the new user's id.
 */
export async function startDemo(key: DemoProfileKey, now: Date): Promise<string> {
  await deleteStaleDemoUsers(now);
  const userId = await signUpDemoUser();
  try {
    await saveProfile(userId, DEMO_PROFILES[key].profile);
  } catch (error) {
    // A failed start leaves no user and no valid session, so «Prøv demo» can be tried again.
    await deleteDemoUser(userId);
    throw error;
  }
  return userId;
}
