"use server";

import { revalidatePath } from "next/cache";

import { getUserId } from "@/shared/auth/session";

import { dismissHint, WELCOME_HINT } from "./hints";

/**
 * Closes the welcome hint on Uke for the signed-in user. The user id comes only from the session;
 * without one nothing happens. A plain form action, so it also works without JavaScript.
 */
export async function dismissWelcomeHintAction(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await dismissHint(userId, WELCOME_HINT);
  revalidatePath("/uke");
}
