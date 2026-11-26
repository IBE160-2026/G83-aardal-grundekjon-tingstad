import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/shared/db/client";
import { userHint } from "@/shared/db/schema";

export const WELCOME_HINT = "welcome";

/** True when the user has closed the hint. The closing is remembered per user (UX-DR12). */
export async function isHintDismissed(userId: string, hintKey: string): Promise<boolean> {
  const rows = await getDb()
    .select({ key: userHint.hintKey })
    .from(userHint)
    .where(and(eq(userHint.userId, userId), eq(userHint.hintKey, hintKey)))
    .limit(1);
  return rows.length > 0;
}

/** Remembers that the user closed the hint. Closing twice has no extra effect. */
export async function dismissHint(userId: string, hintKey: string): Promise<void> {
  await getDb().insert(userHint).values({ userId, hintKey }).onConflictDoNothing();
}
