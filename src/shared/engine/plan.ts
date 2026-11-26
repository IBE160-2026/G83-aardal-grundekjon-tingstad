// The plan engine (AD-2): a pure function from plain data to a week of sessions. No database,
// clock, network or framework; the caller passes the profile, the library and the dates.

import { addDays, isoWeekday, weekStart, type CalendarDate } from "../lib/dates";

import type { Exercise, MovementPattern } from "./exercise";
import {
  BASE_SLOTS,
  DAY_PATTERNS,
  DISTANCE_STEP_KM,
  EASY_SHORT_SHARE_OF_LONG,
  EXTRA_SLOT,
  GOAL_DISTANCE_KM,
  MAIN_FOCUS_BODY_PARTS,
  MAIN_FOCUS_EXTRA_SETS,
  MIN_EASY_SHORT_KM,
  PATTERN_BODY_PART,
  PATTERN_FALLBACK,
  RUN_TYPES,
  STARTING_VOLUME,
  STRENGTH_TEMPLATES,
  type Equipment,
  type Experience,
  type MainFocus,
  type RunType,
  type RunningGoal,
  type SessionsPerWeek,
  type StrengthTemplate,
  type Weekday,
} from "./plan-constants";

export type StrengthProfile = {
  focus: "strength";
  experience: Experience;
  sessionsPerWeek: SessionsPerWeek;
  mainFocus: MainFocus;
  equipment: Equipment;
};

export type RunningProfile = {
  focus: "running";
  experience: Experience;
  sessionsPerWeek: SessionsPerWeek;
  goal: RunningGoal;
  longestRunKm: number;
};

export type EngineProfile = StrengthProfile | RunningProfile;

export type PlannedExercise = {
  exerciseId: string;
  pattern: MovementPattern;
  sets: number;
  reps: number;
  bodyweight: boolean;
  /** No load is set before the user has logged the exercise (R6). */
  load: null;
};

export type StrengthSession = {
  kind: "strength";
  date: CalendarDate;
  weekday: Weekday;
  template: StrengthTemplate;
  exercises: PlannedExercise[];
};

export type RunSession = {
  kind: "run";
  date: CalendarDate;
  weekday: Weekday;
  runType: RunType;
  distanceKm: number;
};

export type PlannedSession = StrengthSession | RunSession;

export type WeekPlan = {
  weekStart: CalendarDate;
  sessions: PlannedSession[];
  /** Running only: the fast short run's fixed distance, set once (R7) and stored on the program. */
  fastShortRunKm: number | null;
};

export type FirstWeekInput = {
  profile: EngineProfile;
  exercises: readonly Exercise[];
  /** The day the program starts. Days before it are not planned. */
  programStart: CalendarDate;
  /** Today in Europe/Oslo. Days before it are not planned. */
  today: CalendarDate;
};

/** Rounds a distance down to the nearest 0.5 km. */
export function floorToStep(km: number): number {
  // Tiny epsilon: 0.3 * 10 style floating point errors must not lose a whole step.
  return Math.floor(km / DISTANCE_STEP_KM + 1e-9) * DISTANCE_STEP_KM;
}

/** First-week run distances (Appendix A, Starting volume). */
export function startingRunDistances(profile: RunningProfile) {
  const longKm = floorToStep(Math.min(profile.longestRunKm, GOAL_DISTANCE_KM[profile.goal]));
  const easyKm = Math.min(
    longKm,
    Math.max(MIN_EASY_SHORT_KM, floorToStep(longKm * EASY_SHORT_SHARE_OF_LONG)),
  );
  return { longKm, easyShortKm: easyKm, fastShortKm: easyKm };
}

/**
 * Generates the first week of a program: the sessions from `max(programStart, today)` to Sunday
 * in the week of `programStart`. Throws a RangeError if `today` is in another week.
 */
export function generateFirstWeek(input: FirstWeekInput): WeekPlan {
  const { profile, exercises, programStart, today } = input;
  const start = weekStart(programStart);
  if (weekStart(today) !== start) {
    throw new RangeError("today must be in the week of the program start");
  }
  const from = today > programStart ? today : programStart;
  const pattern = DAY_PATTERNS[profile.sessionsPerWeek];
  const dates = pattern.map((weekday) => addDays(start, weekday - 1));

  const sessions =
    profile.focus === "strength"
      ? strengthSessions(profile, exercises, dates)
      : runSessions(profile, dates);

  return {
    weekStart: start,
    sessions: sessions.filter((session) => session.date >= from),
    fastShortRunKm: profile.focus === "running" ? startingRunDistances(profile).fastShortKm : null,
  };
}

function weekdayOf(date: CalendarDate): Weekday {
  return isoWeekday(date) as Weekday;
}

function runSessions(profile: RunningProfile, dates: readonly CalendarDate[]): RunSession[] {
  const { longKm, easyShortKm, fastShortKm } = startingRunDistances(profile);
  const distance: Record<RunType, number> = {
    long: longKm,
    easy_short: easyShortKm,
    fast_short: fastShortKm,
  };
  return RUN_TYPES[profile.sessionsPerWeek].map((runType, index) => ({
    kind: "run",
    date: dates[index],
    weekday: weekdayOf(dates[index]),
    runType,
    distanceKm: distance[runType],
  }));
}

function strengthSessions(
  profile: StrengthProfile,
  library: readonly Exercise[],
  dates: readonly CalendarDate[],
): StrengthSession[] {
  const templates = STRENGTH_TEMPLATES[profile.sessionsPerWeek];
  let upperSessions = 0;
  return templates.map((template, index) => {
    // Biceps and triceps alternate between upper sessions; every other slot is fixed per template.
    const arm: MovementPattern = upperSessions % 2 === 0 ? "biceps" : "triceps";
    if (template === "upper") upperSessions += 1;
    return {
      kind: "strength",
      date: dates[index],
      weekday: weekdayOf(dates[index]),
      template,
      exercises: fillSlots(profile, library, template, arm),
    };
  });
}

/** The slots of a session: base slots, plus the extra slot for experienced users. */
function slotsFor(
  profile: StrengthProfile,
  template: StrengthTemplate,
  arm: MovementPattern,
): MovementPattern[] {
  const slots = [...BASE_SLOTS[template]];
  if (profile.experience === "experienced") {
    const extra = EXTRA_SLOT[template];
    if (extra === "alternating-arm") slots.push(arm);
    else if (typeof extra === "string") slots.push(extra);
    else slots.push(extra[profile.mainFocus]);
  }
  return slots;
}

/** Exercises for one pattern where the user trains: `gym` ones first for the gym, then `both`. */
function candidates(
  library: readonly Exercise[],
  pattern: MovementPattern,
  equipment: Equipment,
): Exercise[] {
  const matching = library.filter((e) => e.pattern === pattern);
  const both = matching.filter((e) => e.location === "both");
  if (equipment === "home") return both;
  return [...matching.filter((e) => e.location === "gym"), ...both];
}

function fillSlots(
  profile: StrengthProfile,
  library: readonly Exercise[],
  template: StrengthTemplate,
  arm: MovementPattern,
): PlannedExercise[] {
  const volume = STARTING_VOLUME[profile.experience];
  const focusParts = MAIN_FOCUS_BODY_PARTS[profile.mainFocus];
  const chosen: PlannedExercise[] = [];

  for (const slot of slotsFor(profile, template, arm)) {
    // No exercise for the pattern (for example calf at home): use the fallback pattern, else skip.
    const patterns = [slot, PATTERN_FALLBACK[slot]].filter((p): p is MovementPattern => !!p);
    let exercise: Exercise | undefined;
    for (const pattern of patterns) {
      exercise = candidates(library, pattern, profile.equipment).find(
        (e) => !chosen.some((c) => c.exerciseId === e.id),
      );
      if (exercise) break;
    }
    if (!exercise) continue;

    const bodyPart = PATTERN_BODY_PART[exercise.pattern];
    const extraSet = bodyPart !== null && focusParts.includes(bodyPart) ? MAIN_FOCUS_EXTRA_SETS : 0;
    chosen.push({
      exerciseId: exercise.id,
      pattern: exercise.pattern,
      sets: volume.sets + extraSet,
      reps: exercise.bodyweight ? volume.repsBodyweight : volume.repsWithLoad,
      bodyweight: exercise.bodyweight,
      load: null,
    });
  }
  return chosen;
}
