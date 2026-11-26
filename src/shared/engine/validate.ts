// The engine's validator (AD-2): checks a generated week against R1–R5, R7 and R9 and returns
// every broken rule. An empty list means the week is valid. Pure, like the rest of the engine.

import { addDays, weekStart, type CalendarDate } from "../lib/dates";

import type { Exercise } from "./exercise";
import type { EngineProfile, PlannedSession, RunSession, StrengthSession, WeekPlan } from "./plan";
import {
  DAY_PATTERNS,
  MAX_RUN_INCREASE,
  RUN_TYPES,
  STRENGTH_TEMPLATES,
  TEMPLATE_BODY_PARTS,
  type BodyPart,
} from "./plan-constants";

export const MAX_CONSECUTIVE_TRAINING_DAYS = 3;
export const MIN_SESSIONS_PER_BODY_PART = 2;

export type ValidationContext = {
  profile: EngineProfile;
  exercises: readonly Exercise[];
  /** The first day that may hold a session; a week from its Monday on is a full week. */
  from: CalendarDate;
};

const isRun = (s: PlannedSession): s is RunSession => s.kind === "run";
const isStrength = (s: PlannedSession): s is StrengthSession => s.kind === "strength";
const isHardRun = (s: RunSession) => s.runType === "long" || s.runType === "fast_short";

/** Returns the broken rules of a week, each as a short English sentence starting with the rule. */
export function validateWeek(plan: WeekPlan, context: ValidationContext): string[] {
  const { profile, exercises, from } = context;
  const problems: string[] = [];
  const sessions = [...plan.sessions].sort((a, b) => a.date.localeCompare(b.date));
  const fullWeek = from <= plan.weekStart;

  // R9 and R1: the day pattern for the chosen session count, from `from` onward.
  const expectedDates = DAY_PATTERNS[profile.sessionsPerWeek]
    .map((weekday) => addDays(plan.weekStart, weekday - 1))
    .filter((date) => date >= from);
  if (sessions.map((s) => s.date).join() !== expectedDates.join()) {
    problems.push(
      `R9: days ${sessions.map((s) => s.date).join(",")} do not match ${expectedDates.join(",")}`,
    );
  }
  if (sessions.some((s) => weekStart(s.date) !== plan.weekStart)) {
    problems.push("R9: a session is outside the plan week");
  }

  // R2: a rest day, and at most three training days in a row.
  const trained = new Set(sessions.map((s) => s.date));
  const days = Array.from({ length: 7 }, (_, i) => addDays(plan.weekStart, i));
  if (fullWeek && days.every((d) => trained.has(d))) problems.push("R2: no rest day");
  let streak = 0;
  for (const day of days) {
    streak = trained.has(day) ? streak + 1 : 0;
    if (streak > MAX_CONSECUTIVE_TRAINING_DAYS) {
      problems.push(`R2: more than ${MAX_CONSECUTIVE_TRAINING_DAYS} training days in a row`);
      break;
    }
  }

  // R3: no heavy work for the same body part, and no two hard runs, on consecutive days.
  for (let i = 1; i < sessions.length; i++) {
    const [a, b] = [sessions[i - 1], sessions[i]];
    if (addDays(a.date, 1) !== b.date) continue;
    if (isStrength(a) && isStrength(b)) {
      const shared = TEMPLATE_BODY_PARTS[a.template].filter((p) =>
        TEMPLATE_BODY_PARTS[b.template].includes(p),
      );
      if (shared.length > 0)
        problems.push(`R3: ${shared.join("/")} trained on ${a.date} and ${b.date}`);
    }
    if (isRun(a) && isRun(b) && isHardRun(a) && isHardRun(b)) {
      problems.push(`R3: hard runs on ${a.date} and ${b.date}`);
    }
  }

  if (profile.focus === "strength") {
    problems.push(...validateStrength(profile, sessions.filter(isStrength), exercises, fullWeek));
    if (sessions.some(isRun)) problems.push("R4: running and strength are not combined");
  } else {
    problems.push(...validateRunning(profile, sessions.filter(isRun), fullWeek));
    if (sessions.some(isStrength)) problems.push("R4: running and strength are not combined");
  }
  return problems;
}

function validateStrength(
  profile: Extract<EngineProfile, { focus: "strength" }>,
  sessions: StrengthSession[],
  library: readonly Exercise[],
  fullWeek: boolean,
): string[] {
  const problems: string[] = [];

  // R1: each major muscle group at least twice a week (full week only).
  if (fullWeek) {
    for (const part of ["legs", "push", "pull"] as BodyPart[]) {
      const count = sessions.filter((s) => TEMPLATE_BODY_PARTS[s.template].includes(part)).length;
      if (count < MIN_SESSIONS_PER_BODY_PART) problems.push(`R1: ${part} trained ${count} time(s)`);
    }
    // R4: the template for the session count.
    const templates = sessions.map((s) => s.template).join();
    if (templates !== STRENGTH_TEMPLATES[profile.sessionsPerWeek].join()) {
      problems.push(`R4: templates ${templates} do not match the session count`);
    }
  }

  // R5: only library exercises that fit where the user trains, none twice in a session.
  for (const session of sessions) {
    const ids = session.exercises.map((e) => e.exerciseId);
    if (new Set(ids).size !== ids.length) problems.push(`R5: repeated exercise on ${session.date}`);
    for (const planned of session.exercises) {
      const exercise = library.find((e) => e.id === planned.exerciseId);
      if (!exercise) problems.push(`R5: ${planned.exerciseId} is not in the library`);
      else if (profile.equipment === "home" && exercise.location !== "both") {
        problems.push(`R5: ${exercise.id} cannot be done at home`);
      }
      if (planned.load !== null)
        problems.push(`R6: ${planned.exerciseId} has a load before logging`);
    }
  }
  return problems;
}

function validateRunning(
  profile: Extract<EngineProfile, { focus: "running" }>,
  sessions: RunSession[],
  fullWeek: boolean,
): string[] {
  const problems: string[] = [];
  const types = RUN_TYPES[profile.sessionsPerWeek];

  // R4: the long run is on the last training day, and the types follow the session count.
  if (fullWeek && sessions.map((s) => s.runType).join() !== types.join()) {
    problems.push("R4: run types do not match the session count");
  }
  const last = sessions[sessions.length - 1];
  if (last && last.runType !== "long" && sessions.some((s) => s.runType === "long")) {
    problems.push("R4: the long run is not on the last training day");
  }

  // R7: no planned run is more than 10 % above the user's longest run.
  const limit = profile.longestRunKm * MAX_RUN_INCREASE;
  for (const run of sessions) {
    if (run.distanceKm > limit)
      problems.push(`R7: ${run.distanceKm} km on ${run.date} is too long`);
    if (run.distanceKm <= 0) problems.push(`R7: no distance on ${run.date}`);
  }
  return problems;
}
