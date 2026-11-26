import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/shared/db/client";
import { profile } from "@/shared/db/schema";

import { type ProfileInput, profileInputSchema } from "./schemas";

type ProfileRow = typeof profile.$inferSelect;

/** The stored profile in the same shape as the input; null fields of the other focus are left out. */
function toProfile(row: ProfileRow): ProfileInput {
  return profileInputSchema.parse(
    row.focus === "strength"
      ? {
          focus: row.focus,
          experience: row.experience,
          sessionsPerWeek: row.sessionsPerWeek,
          mainFocus: row.mainFocus,
          equipment: row.equipment,
        }
      : {
          focus: row.focus,
          experience: row.experience,
          sessionsPerWeek: row.sessionsPerWeek,
          goal: row.goal,
          longestRunKm: row.longestRunKm,
        },
  );
}

/**
 * Creates or replaces the user's profile (one row per user). The input is validated here, so a
 * caller can never store an inconsistent profile; invalid input throws a ZodError.
 */
export async function saveProfile(userId: string, input: unknown): Promise<ProfileInput> {
  const data = profileInputSchema.parse(input);
  const values = {
    focus: data.focus,
    experience: data.experience,
    sessionsPerWeek: data.sessionsPerWeek,
    mainFocus: data.focus === "strength" ? data.mainFocus : null,
    equipment: data.focus === "strength" ? data.equipment : null,
    goal: data.focus === "running" ? data.goal : null,
    longestRunKm: data.focus === "running" ? data.longestRunKm : null,
  };
  const [row] = await getDb()
    .insert(profile)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: profile.userId, set: { ...values, updatedAt: new Date() } })
    .returning();
  return toProfile(row);
}

/** The user's own profile, or null when the user has none yet. */
export async function getProfile(userId: string): Promise<ProfileInput | null> {
  const [row] = await getDb().select().from(profile).where(eq(profile.userId, userId)).limit(1);
  return row ? toProfile(row) : null;
}
