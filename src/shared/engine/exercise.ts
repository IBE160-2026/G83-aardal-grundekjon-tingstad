import { z } from "zod";

/** The 11 Session slots / movement patterns from PRD Appendix A. */
export const MOVEMENT_PATTERNS = [
  "squat",
  "hinge",
  "single-leg",
  "calf",
  "horizontal-push",
  "vertical-push",
  "horizontal-pull",
  "vertical-pull",
  "biceps",
  "triceps",
  "core",
] as const;

export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

/** `gym` = only at a gym; `both` = gym and home (bodyweight, R5). */
export const LOCATIONS = ["gym", "both"] as const;

export type ExerciseLocation = (typeof LOCATIONS)[number];

const nonEmpty = z.string().trim().min(1);

/**
 * One entry of `data/exercises/exercises.json` (Story 2.1). A bodyweight exercise has no load,
 * so the log stores `null` for its weight; only `both` (home) exercises are bodyweight.
 */
export const exerciseSchema = z
  .object({
    id: nonEmpty,
    source: z.enum(["free-exercise-db", "custom"]),
    nameNo: nonEmpty,
    nameEn: nonEmpty,
    pattern: z.enum(MOVEMENT_PATTERNS),
    location: z.enum(LOCATIONS),
    bodyweight: z.boolean(),
    primaryMuscles: z.array(nonEmpty).min(1),
    secondaryMuscles: z.array(nonEmpty),
    sourceEquipment: nonEmpty.nullable(),
    level: z.enum(["beginner", "intermediate", "expert"]),
  })
  .strict();

export type Exercise = z.infer<typeof exerciseSchema>;

/** The whole library file: the exercises, the Norwegian muscle names and the known home gaps. */
export const exerciseLibrarySchema = z
  .object({
    source: nonEmpty,
    knownHomeGaps: z.array(z.enum(MOVEMENT_PATTERNS)),
    muscleNamesNo: z.record(nonEmpty, nonEmpty),
    exercises: z.array(exerciseSchema).min(30).max(50),
  })
  .strict();

export type ExerciseLibrary = z.infer<typeof exerciseLibrarySchema>;

/** Movement patterns that have fewer than `min` exercises for the given place to train. */
export function patternGaps(
  exercises: readonly Exercise[],
  place: "gym" | "home",
  min = 2,
): MovementPattern[] {
  // A gym user can use every exercise; a home user only those marked `both`.
  const usable = exercises.filter((e) => place === "gym" || e.location === "both");
  return MOVEMENT_PATTERNS.filter(
    (pattern) => usable.filter((e) => e.pattern === pattern).length < min,
  );
}
