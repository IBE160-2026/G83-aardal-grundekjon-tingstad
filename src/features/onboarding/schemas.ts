import { z } from "zod";

import {
  EQUIPMENT,
  EXPERIENCES,
  MAIN_FOCUSES,
  MAX_LONGEST_RUN_KM,
  MIN_LONGEST_RUN_KM,
  type ProfileInput,
  RUNNING_GOALS,
} from "@/features/profile/api";

// Server-side validation of the onboarding answers (FR2, NFR9, AD-4). Only the defined options
// exist; a missing or unknown value is rejected. The profile's own schema validates the result
// once more when it is stored.

export const MESSAGES = {
  longestRun: `Skriv lengste løpetur som et tall mellom ${MIN_LONGEST_RUN_KM} og ${MAX_LONGEST_RUN_KM} km.`,
  checkAnswers: "Sjekk svarene dine og prøv igjen.",
  unexpected: "Vi fikk ikke laget planen. Prøv igjen om litt.",
} as const;

const sessionsPerWeek = z.int().min(2).max(5);

export const answersSchema = z.discriminatedUnion("focus", [
  z.strictObject({
    focus: z.literal("strength"),
    mainFocus: z.enum(MAIN_FOCUSES),
    experience: z.enum(EXPERIENCES),
    sessionsPerWeek,
    equipment: z.enum(EQUIPMENT),
  }),
  z.strictObject({
    focus: z.literal("running"),
    goal: z.enum(RUNNING_GOALS),
    // Typed by the user, so it arrives as text: «7,5» and «7.5» are the same.
    longestRun: z.string().max(20),
    sessionsPerWeek,
  }),
]);

export type OnboardingAnswers = z.infer<typeof answersSchema>;

/** Reads a distance typed with a decimal comma or point; null when it is not a plain number. */
export function parseKm(text: string): number | null {
  const normalised = text.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalised)) return null;
  return Number(normalised);
}

/**
 * The profile the answers make. Running onboarding does not ask about experience, but the profile
 * needs a value; the plan engine ignores it for running, so it is stored as `beginner`.
 * Returns null when the longest run is not a number between the limits.
 */
export function toProfile(answers: OnboardingAnswers): ProfileInput | null {
  if (answers.focus === "strength") return answers;
  const km = parseKm(answers.longestRun);
  if (km === null || km < MIN_LONGEST_RUN_KM || km > MAX_LONGEST_RUN_KM) return null;
  return {
    focus: "running",
    experience: "beginner",
    goal: answers.goal,
    longestRunKm: km,
    sessionsPerWeek: answers.sessionsPerWeek,
  };
}
