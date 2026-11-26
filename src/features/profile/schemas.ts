import { z } from "zod";

// The training profile (FR2, Story 1.4). Server-side validation of every profile write (AD-4):
// the fields that belong to the chosen focus are required, the other focus's fields are absent.

export const EXPERIENCES = ["beginner", "experienced"] as const;
export const MAIN_FOCUSES = ["upper_body", "lower_body", "full_body"] as const;
export const EQUIPMENT = ["gym", "home"] as const;
export const RUNNING_GOALS = ["5k", "10k", "half_marathon"] as const;

export const MIN_SESSIONS_PER_WEEK = 2;
export const MAX_SESSIONS_PER_WEEK = 5;
// The longest run is 1–50 km (PRD Appendix A, Starting volume).
export const MIN_LONGEST_RUN_KM = 1;
export const MAX_LONGEST_RUN_KM = 50;

const shared = {
  experience: z.enum(EXPERIENCES),
  sessionsPerWeek: z.int().min(MIN_SESSIONS_PER_WEEK).max(MAX_SESSIONS_PER_WEEK),
};

export const strengthProfileSchema = z.strictObject({
  focus: z.literal("strength"),
  ...shared,
  mainFocus: z.enum(MAIN_FOCUSES),
  equipment: z.enum(EQUIPMENT),
});

export const runningProfileSchema = z.strictObject({
  focus: z.literal("running"),
  ...shared,
  goal: z.enum(RUNNING_GOALS),
  longestRunKm: z.number().min(MIN_LONGEST_RUN_KM).max(MAX_LONGEST_RUN_KM),
});

export const profileInputSchema = z.discriminatedUnion("focus", [
  strengthProfileSchema,
  runningProfileSchema,
]);

export type ProfileInput = z.infer<typeof profileInputSchema>;
