// The fixed numbers and tables of the plan engine (PRD Appendix A: R4, R9, Starting volume).
// They are named constants so each one has a test (NFR6) and later stories reuse them.

import type { MovementPattern } from "./exercise";

export type SessionsPerWeek = 2 | 3 | 4 | 5;
export type Experience = "beginner" | "experienced";
export type MainFocus = "upper_body" | "lower_body" | "full_body";
export type Equipment = "gym" | "home";
export type RunningGoal = "5k" | "10k" | "half_marathon";

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** R9: fixed day patterns by session count. */
export const DAY_PATTERNS: Record<SessionsPerWeek, readonly Weekday[]> = {
  2: [2, 4],
  3: [1, 3, 6],
  4: [1, 3, 5, 7],
  5: [1, 2, 4, 5, 6],
};

export type StrengthTemplate = "full_body" | "upper" | "lower" | "push" | "pull" | "legs";

/** R4: strength template per training day, by session count. */
export const STRENGTH_TEMPLATES: Record<SessionsPerWeek, readonly StrengthTemplate[]> = {
  2: ["full_body", "full_body"],
  3: ["full_body", "full_body", "full_body"],
  4: ["upper", "lower", "upper", "lower"],
  5: ["lower", "upper", "push", "pull", "legs"],
};

export type RunType = "easy_short" | "fast_short" | "long";

/** R4: run type per training day, by session count; the long run is always on the last day. */
export const RUN_TYPES: Record<SessionsPerWeek, readonly RunType[]> = {
  2: ["easy_short", "long"],
  3: ["easy_short", "fast_short", "long"],
  4: ["easy_short", "fast_short", "easy_short", "long"],
  5: ["easy_short", "fast_short", "fast_short", "easy_short", "long"],
};

/** Starting volume, strength (Appendix A). Reps are a fixed number, not a range. */
export const STARTING_VOLUME: Record<
  Experience,
  { sets: number; repsWithLoad: number; repsBodyweight: number }
> = {
  beginner: { sets: 3, repsWithLoad: 10, repsBodyweight: 10 },
  experienced: { sets: 4, repsWithLoad: 8, repsBodyweight: 12 },
};

/** Exercises in the main-focus body part get one extra set. */
export const MAIN_FOCUS_EXTRA_SETS = 1;

/** Slots for beginners, filled in this order, one exercise per slot (Session slots). */
export const BASE_SLOTS: Record<StrengthTemplate, readonly MovementPattern[]> = {
  full_body: ["squat", "hinge", "horizontal-push", "horizontal-pull"],
  upper: ["horizontal-push", "horizontal-pull", "vertical-push", "vertical-pull"],
  lower: ["squat", "hinge", "single-leg", "core"],
  push: ["horizontal-push", "vertical-push", "triceps"],
  pull: ["vertical-pull", "horizontal-pull", "biceps"],
  legs: ["squat", "hinge", "single-leg"],
};

/** The extra slot for experienced users. A full-body session depends on the main focus. */
export const EXTRA_SLOT: Record<
  StrengthTemplate,
  MovementPattern | Record<MainFocus, MovementPattern> | "alternating-arm"
> = {
  full_body: { upper_body: "vertical-pull", lower_body: "single-leg", full_body: "core" },
  upper: "alternating-arm",
  lower: "calf",
  push: "horizontal-push",
  pull: "horizontal-pull",
  legs: "calf",
};

/** The other pattern of the same kind in the same body part, used when a pattern has no exercise. */
export const PATTERN_FALLBACK: Partial<Record<MovementPattern, MovementPattern>> = {
  "vertical-push": "horizontal-push",
  "horizontal-push": "vertical-push",
  "vertical-pull": "horizontal-pull",
  "horizontal-pull": "vertical-pull",
  biceps: "horizontal-pull",
  triceps: "horizontal-push",
  calf: "single-leg",
};

export type BodyPart = "legs" | "push" | "pull";

/** Body part each pattern trains. `core` trains neither, so it never counts and gets no extra set. */
export const PATTERN_BODY_PART: Record<MovementPattern, BodyPart | null> = {
  squat: "legs",
  hinge: "legs",
  "single-leg": "legs",
  calf: "legs",
  "horizontal-push": "push",
  "vertical-push": "push",
  triceps: "push",
  "horizontal-pull": "pull",
  "vertical-pull": "pull",
  biceps: "pull",
  core: null,
};

/** Body parts a template trains, for R1 and R3. */
export const TEMPLATE_BODY_PARTS: Record<StrengthTemplate, readonly BodyPart[]> = {
  full_body: ["legs", "push", "pull"],
  upper: ["push", "pull"],
  lower: ["legs"],
  push: ["push"],
  pull: ["pull"],
  legs: ["legs"],
};

/** Body parts of the main focus; full body has none, so it gives no extra set. */
export const MAIN_FOCUS_BODY_PARTS: Record<MainFocus, readonly BodyPart[]> = {
  upper_body: ["push", "pull"],
  lower_body: ["legs"],
  full_body: [],
};

// Running (Appendix A, Starting volume).
export const GOAL_DISTANCE_KM: Record<RunningGoal, number> = {
  "5k": 5,
  "10k": 10,
  half_marathon: 21.1,
};
export const DISTANCE_STEP_KM = 0.5;
export const EASY_SHORT_SHARE_OF_LONG = 0.5;
export const MIN_EASY_SHORT_KM = 2;
/** R7: no planned run is more than 10 % above the longest run. */
export const MAX_RUN_INCREASE = 1.1;
