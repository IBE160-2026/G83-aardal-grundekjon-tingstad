import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { exerciseLibrarySchema } from "@/shared/engine/exercise";
import {
  generateFirstWeek,
  type EngineProfile,
  type RunSession,
  type StrengthSession,
  type WeekPlan,
} from "@/shared/engine/plan";
import type { SessionsPerWeek } from "@/shared/engine/plan-constants";
import { validateWeek } from "@/shared/engine/validate";
import { addDays } from "@/shared/lib/dates";

const { exercises } = exerciseLibrarySchema.parse(
  JSON.parse(readFileSync(new URL("../../data/exercises/exercises.json", import.meta.url), "utf8")),
);

const MONDAY = "2026-11-23";
const SESSIONS: SessionsPerWeek[] = [2, 3, 4, 5];

const profiles: EngineProfile[] = [];
for (const experience of ["beginner", "experienced"] as const) {
  for (const sessionsPerWeek of SESSIONS) {
    for (const mainFocus of ["upper_body", "lower_body", "full_body"] as const) {
      for (const equipment of ["gym", "home"] as const) {
        profiles.push({ focus: "strength", experience, sessionsPerWeek, mainFocus, equipment });
      }
    }
    for (const goal of ["5k", "10k", "half_marathon"] as const) {
      for (const longestRunKm of [1, 2, 3, 7.3, 15, 50]) {
        profiles.push({ focus: "running", experience, sessionsPerWeek, goal, longestRunKm });
      }
    }
  }
}

const generate = (profile: EngineProfile, from: string) =>
  generateFirstWeek({ profile, exercises, programStart: from, today: from });
const check = (profile: EngineProfile, plan: WeekPlan, from = MONDAY) =>
  validateWeek(plan, { profile, exercises, from });

describe("validateWeek on every generated week", () => {
  it("finds no rule break for any combination of focus, goal, experience, sessions and place", () => {
    expect(profiles.length).toBe(48 + 144);
    for (const profile of profiles) {
      const plan = generate(profile, MONDAY);
      expect(check(profile, plan), JSON.stringify(profile)).toEqual([]);
    }
  });

  it("finds no rule break when the program starts on any day of the week", () => {
    for (const profile of profiles) {
      for (let day = 0; day < 7; day++) {
        const from = addDays(MONDAY, day);
        const plan = generate(profile, from);
        expect(check(profile, plan, from), `${JSON.stringify(profile)} from ${from}`).toEqual([]);
      }
    }
  });
});

describe("validateWeek on broken weeks", () => {
  const strength: EngineProfile = {
    focus: "strength",
    experience: "beginner",
    sessionsPerWeek: 4,
    mainFocus: "full_body",
    equipment: "gym",
  };
  const running: EngineProfile = {
    focus: "running",
    experience: "beginner",
    sessionsPerWeek: 3,
    goal: "10k",
    longestRunKm: 5,
  };
  const fresh = (profile: EngineProfile) => generate(profile, MONDAY);
  const moveTo = (plan: WeekPlan, index: number, date: string): WeekPlan => ({
    ...plan,
    sessions: plan.sessions.map((s, i) => (i === index ? { ...s, date } : s)),
  });

  it("reports the same body part on consecutive days (R3)", () => {
    // Upper on Mon and lower moved next to... upper Fri to Tue: upper Mon, upper Tue.
    const plan = moveTo(fresh(strength), 2, addDays(MONDAY, 1));
    expect(check(strength, plan).join("\n")).toMatch(/R3/);
  });

  it("reports two hard runs on consecutive days (R3)", () => {
    const plan = moveTo(fresh(running), 1, addDays(MONDAY, 4));
    expect(check(running, plan).join("\n")).toMatch(/R3: hard runs/);
  });

  it("reports days that are not the R9 pattern", () => {
    const plan = moveTo(fresh(strength), 0, addDays(MONDAY, 1));
    expect(check(strength, plan).join("\n")).toMatch(/R9/);
  });

  it("reports no rest day and more than three training days in a row (R2)", () => {
    const base = fresh(strength);
    const template = base.sessions[0] as StrengthSession;
    const sessions = Array.from({ length: 7 }, (_, i) => ({
      ...template,
      date: addDays(MONDAY, i),
    }));
    const problems = check(strength, { ...base, sessions }).join("\n");
    expect(problems).toMatch(/R2: no rest day/);
    expect(problems).toMatch(/R2: more than 3 training days/);
  });

  it("reports a muscle group trained fewer than twice (R1)", () => {
    const base = fresh({ ...strength, sessionsPerWeek: 5 });
    const sessions = base.sessions.filter((s) => (s as StrengthSession).template !== "legs");
    expect(check({ ...strength, sessionsPerWeek: 5 }, { ...base, sessions }).join("\n")).toMatch(
      /R1: legs/,
    );
  });

  it("reports an exercise that is not in the library or cannot be done at home (R5)", () => {
    const home: EngineProfile = { ...strength, equipment: "home" };
    const gymOnly = exercises.find((e) => e.location === "gym")!;
    const base = generate(home, MONDAY);
    const [first, ...rest] = base.sessions as StrengthSession[];
    const withGym = {
      ...first,
      exercises: [{ ...first.exercises[0], exerciseId: gymOnly.id }, ...first.exercises.slice(1)],
    };
    const withMissing = {
      ...first,
      exercises: [
        { ...first.exercises[0], exerciseId: "no-such-exercise" },
        ...first.exercises.slice(1),
      ],
    };
    expect(check(home, { ...base, sessions: [withGym, ...rest] }).join("\n")).toMatch(
      /R5: .* cannot be done at home/,
    );
    expect(check(home, { ...base, sessions: [withMissing, ...rest] }).join("\n")).toMatch(
      /R5: no-such-exercise is not in the library/,
    );
  });

  it("reports a planned load before logging (R6)", () => {
    const base = fresh(strength);
    const [first, ...rest] = base.sessions as StrengthSession[];
    const loaded = {
      ...first,
      exercises: [{ ...first.exercises[0], load: 20 as never }, ...first.exercises.slice(1)],
    };
    expect(check(strength, { ...base, sessions: [loaded, ...rest] }).join("\n")).toMatch(/R6/);
  });

  it("reports a run more than 10 % above the longest run (R7)", () => {
    const base = fresh(running);
    const sessions = (base.sessions as RunSession[]).map((s) =>
      s.runType === "long" ? { ...s, distanceKm: 5.6 } : s,
    );
    expect(check(running, { ...base, sessions }).join("\n")).toMatch(/R7: 5.6 km/);
  });

  it("reports a long run that is not on the last training day (R4)", () => {
    const base = fresh(running);
    const sessions = (base.sessions as RunSession[]).map((s, i) =>
      i === 2
        ? { ...s, runType: "easy_short" as const }
        : i === 0
          ? { ...s, runType: "long" as const }
          : s,
    );
    expect(check(running, { ...base, sessions }).join("\n")).toMatch(/R4/);
  });
});
