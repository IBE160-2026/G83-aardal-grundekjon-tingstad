import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { exerciseLibrarySchema } from "@/shared/engine/exercise";
import {
  floorToStep,
  generateFirstWeek,
  startingRunDistances,
  type EngineProfile,
  type RunningProfile,
  type RunSession,
  type StrengthProfile,
  type StrengthSession,
} from "@/shared/engine/plan";
import {
  BASE_SLOTS,
  DAY_PATTERNS,
  RUN_TYPES,
  STARTING_VOLUME,
  STRENGTH_TEMPLATES,
} from "@/shared/engine/plan-constants";

const { exercises } = exerciseLibrarySchema.parse(
  JSON.parse(readFileSync(new URL("../../data/exercises/exercises.json", import.meta.url), "utf8")),
);

// Monday 23 November 2026.
const MONDAY = "2026-11-23";

const week = (profile: EngineProfile, programStart = MONDAY, today = programStart) =>
  generateFirstWeek({ profile, exercises, programStart, today });

const strengthSessions = (profile: StrengthProfile, programStart = MONDAY) =>
  week(profile, programStart).sessions as StrengthSession[];
const runs = (profile: RunningProfile, programStart = MONDAY) =>
  week(profile, programStart).sessions as RunSession[];

const profileA: StrengthProfile = {
  focus: "strength",
  experience: "beginner",
  mainFocus: "full_body",
  sessionsPerWeek: 2,
  equipment: "gym",
};
const profileB: StrengthProfile = {
  ...profileA,
  experience: "experienced",
  sessionsPerWeek: 5,
};
const profileC: RunningProfile = {
  focus: "running",
  experience: "beginner",
  goal: "10k",
  longestRunKm: 3,
  sessionsPerWeek: 3,
};
const profileD: RunningProfile = {
  focus: "running",
  experience: "experienced",
  goal: "half_marathon",
  longestRunKm: 15,
  sessionsPerWeek: 4,
};
const profileE: StrengthProfile = {
  focus: "strength",
  experience: "beginner",
  mainFocus: "upper_body",
  sessionsPerWeek: 3,
  equipment: "home",
};

describe("test profiles (Appendix B)", () => {
  it("A: two full-body sessions, Tue and Thu, 4 exercises of 3 x 10 and no load", () => {
    const sessions = strengthSessions(profileA);
    expect(sessions.map((s) => [s.weekday, s.template])).toEqual([
      [2, "full_body"],
      [4, "full_body"],
    ]);
    for (const session of sessions) {
      expect(session.exercises.map((e) => e.pattern)).toEqual(BASE_SLOTS.full_body);
      for (const e of session.exercises) {
        expect([e.sets, e.reps, e.load]).toEqual([3, 10, null]);
      }
    }
    // The same exercises in both sessions of the same template (Session slots).
    expect(sessions[0].exercises).toEqual(sessions[1].exercises);
  });

  it("B: Mon lower, Tue upper, Thu push, Fri pull, Sat legs, with 5, 5, 4, 4 and 4 exercises of 4 sets", () => {
    const sessions = strengthSessions(profileB);
    expect(sessions.map((s) => [s.weekday, s.template])).toEqual([
      [1, "lower"],
      [2, "upper"],
      [4, "push"],
      [5, "pull"],
      [6, "legs"],
    ]);
    expect(sessions.map((s) => s.exercises.length)).toEqual([5, 5, 4, 4, 4]);
    for (const e of sessions.flatMap((s) => s.exercises)) {
      // Full body as main focus gives no extra set; bodyweight exercises use 12 reps, loaded 8.
      expect(e.sets).toBe(4);
      expect(e.reps).toBe(e.bodyweight ? 12 : 8);
      expect(e.load).toBeNull();
    }
    // Wednesday and Sunday are rest days.
    expect(sessions.map((s) => s.weekday)).not.toContain(3);
    expect(sessions.map((s) => s.weekday)).not.toContain(7);
  });

  it("C: easy short 2 km Mon, fast short 2 km Wed, long 3 km Sat, 7 km in total", () => {
    const plan = runs(profileC);
    expect(plan.map((r) => [r.weekday, r.runType, r.distanceKm])).toEqual([
      [1, "easy_short", 2],
      [3, "fast_short", 2],
      [6, "long", 3],
    ]);
    expect(plan.reduce((sum, r) => sum + r.distanceKm, 0)).toBe(7);
  });

  it("D: easy 7.5, fast 7.5, easy 7.5 and long 15 km, 37.5 km in total", () => {
    const plan = runs(profileD);
    expect(plan.map((r) => [r.weekday, r.runType, r.distanceKm])).toEqual([
      [1, "easy_short", 7.5],
      [3, "fast_short", 7.5],
      [5, "easy_short", 7.5],
      [7, "long", 15],
    ]);
    expect(plan.reduce((sum, r) => sum + r.distanceKm, 0)).toBe(37.5);
  });

  it("E: three bodyweight full-body sessions at home; main focus upper gives push and pull 4 x 10", () => {
    const sessions = strengthSessions(profileE);
    expect(sessions.map((s) => s.weekday)).toEqual([1, 3, 6]);
    for (const session of sessions) {
      expect(session.exercises.map((e) => e.pattern)).toEqual(BASE_SLOTS.full_body);
      for (const e of session.exercises) {
        expect(e.bodyweight).toBe(true);
        expect(e.reps).toBe(10);
        expect(e.load).toBeNull();
        const upper = e.pattern === "horizontal-push" || e.pattern === "horizontal-pull";
        expect(e.sets).toBe(upper ? 4 : 3);
        const library = exercises.find((x) => x.id === e.exerciseId);
        expect(library?.location).toBe("both");
      }
    }
  });
});

describe("constants from Appendix A", () => {
  it("has the R9 day patterns", () => {
    expect(DAY_PATTERNS).toEqual({ 2: [2, 4], 3: [1, 3, 6], 4: [1, 3, 5, 7], 5: [1, 2, 4, 5, 6] });
  });

  it("has the R4 templates and run types, with the long run last", () => {
    expect(STRENGTH_TEMPLATES[4]).toEqual(["upper", "lower", "upper", "lower"]);
    expect(STRENGTH_TEMPLATES[5]).toEqual(["lower", "upper", "push", "pull", "legs"]);
    for (const types of Object.values(RUN_TYPES)) expect(types.at(-1)).toBe("long");
    expect(RUN_TYPES[5].filter((t) => t === "fast_short")).toHaveLength(2);
  });

  it("has the starting volume per experience", () => {
    expect(STARTING_VOLUME.beginner).toEqual({ sets: 3, repsWithLoad: 10, repsBodyweight: 10 });
    expect(STARTING_VOLUME.experienced).toEqual({ sets: 4, repsWithLoad: 8, repsBodyweight: 12 });
  });

  it.each([
    ["full_body", 4, 5],
    ["upper", 4, 5],
    ["lower", 4, 5],
    ["push", 3, 4],
    ["pull", 3, 4],
    ["legs", 3, 4],
  ] as const)(
    "fills %s with %i exercises for beginners and %i for experienced",
    (template, beginner, experienced) => {
      expect(BASE_SLOTS[template]).toHaveLength(beginner);
      const sessionsFor = { full_body: 2, upper: 4, lower: 4, push: 5, pull: 5, legs: 5 } as const;
      const find = (experience: "beginner" | "experienced") =>
        strengthSessions({
          ...profileA,
          experience,
          sessionsPerWeek: sessionsFor[template],
        }).find((s) => s.template === template);
      expect(find("beginner")?.exercises).toHaveLength(beginner);
      expect(find("experienced")?.exercises).toHaveLength(experienced);
    },
  );

  it("gives the extra slot to experienced full-body users by main focus", () => {
    const patterns = (mainFocus: StrengthProfile["mainFocus"]) =>
      strengthSessions({ ...profileA, experience: "experienced", mainFocus })[0].exercises.map(
        (e) => e.pattern,
      );
    expect(patterns("upper_body").at(-1)).toBe("vertical-pull");
    expect(patterns("lower_body").at(-1)).toBe("single-leg");
    expect(patterns("full_body").at(-1)).toBe("core");
  });

  it("alternates biceps and triceps between upper sessions and repeats the rest", () => {
    const sessions = strengthSessions({
      ...profileA,
      experience: "experienced",
      sessionsPerWeek: 4,
    });
    const [upper1, lower1, upper2, lower2] = sessions;
    expect(upper1.exercises.at(-1)?.pattern).toBe("biceps");
    expect(upper2.exercises.at(-1)?.pattern).toBe("triceps");
    expect(upper1.exercises.slice(0, 4)).toEqual(upper2.exercises.slice(0, 4));
    expect(lower1.exercises).toEqual(lower2.exercises);
  });

  it("gives main-focus exercises one extra set, and core none", () => {
    const sessions = strengthSessions({
      ...profileA,
      experience: "experienced",
      mainFocus: "lower_body",
      sessionsPerWeek: 4,
    });
    for (const e of sessions.flatMap((s) => s.exercises)) {
      const legs = ["squat", "hinge", "single-leg", "calf"].includes(e.pattern);
      expect(e.sets).toBe(legs ? 5 : 4);
    }
  });
});

describe("running distances", () => {
  it("rounds down to 0.5 km", () => {
    expect(floorToStep(3.4)).toBe(3);
    expect(floorToStep(7.5)).toBe(7.5);
    expect(floorToStep(2.99)).toBe(2.5);
    expect(floorToStep(0.3 * 10)).toBe(3);
  });

  it.each([
    // longest, goal, long, easy short
    [3, "10k", 3, 2],
    [15, "half_marathon", 15, 7.5],
    [12, "10k", 10, 5],
    [5.2, "5k", 5, 2.5],
    [1, "5k", 1, 1],
    [3.4, "5k", 3, 2],
    [50, "half_marathon", 21, 10.5],
  ] as const)(
    "longest %f km towards %s gives long %f and easy short %f",
    (longest, goal, long, easy) => {
      const result = startingRunDistances({ ...profileC, goal, longestRunKm: longest });
      expect(result).toEqual({ longKm: long, easyShortKm: easy, fastShortKm: easy });
    },
  );

  it("returns the fast short run's fixed distance for the program, and none for strength", () => {
    expect(week(profileC).fastShortRunKm).toBe(2);
    expect(week(profileD).fastShortRunKm).toBe(7.5);
    expect(week(profileA).fastShortRunKm).toBeNull();
  });
});

describe("a program that starts mid-week", () => {
  it("contains only the R9 days from the start date onward", () => {
    // Wednesday 25 November: three sessions are Mon, Wed, Sat.
    const plan = week({ ...profileA, sessionsPerWeek: 3 }, "2026-11-25");
    expect(plan.weekStart).toBe(MONDAY);
    expect(plan.sessions.map((s) => s.weekday)).toEqual([3, 6]);
  });

  it("keeps the long run on its day for a run that starts mid-week", () => {
    const plan = runs({ ...profileC }, "2026-11-25");
    expect(plan.map((r) => r.runType)).toEqual(["fast_short", "long"]);
  });

  it("drops days before today when today is after the program start", () => {
    const plan = week({ ...profileA, sessionsPerWeek: 3 }, MONDAY, "2026-11-26");
    expect(plan.sessions.map((s) => s.weekday)).toEqual([6]);
  });

  it("has no sessions when the program starts after the last session day", () => {
    expect(week({ ...profileA, sessionsPerWeek: 3 }, "2026-11-29").sessions).toEqual([]);
  });

  it("rejects a today outside the week of the program start", () => {
    expect(() => week(profileA, MONDAY, "2026-11-30")).toThrow(RangeError);
  });
});

describe("pattern fallback", () => {
  const home: StrengthProfile = {
    ...profileA,
    experience: "experienced",
    sessionsPerWeek: 4,
    equipment: "home",
  };
  const generate = (library: typeof exercises) =>
    (
      generateFirstWeek({
        profile: home,
        exercises: library,
        programStart: MONDAY,
        today: MONDAY,
      }).sessions as StrengthSession[]
    ).find((s) => s.template === "lower")!;

  it("uses single-leg for calf when there is no calf exercise", () => {
    const lower = generate(exercises.filter((e) => e.pattern !== "calf"));
    const patterns = lower.exercises.map((e) => e.pattern);
    expect(patterns).not.toContain("calf");
    expect(patterns.filter((p) => p === "single-leg")).toHaveLength(2);
  });

  it("leaves a slot out when neither the pattern nor its fallback has an exercise", () => {
    const lower = generate(exercises.filter((e) => e.pattern !== "squat"));
    expect(lower.exercises.map((e) => e.pattern)).not.toContain("squat");
    expect(lower.exercises).toHaveLength(4);
  });

  it("never plans a gym-only exercise at home", () => {
    for (const session of strengthSessions(home)) {
      for (const e of session.exercises) {
        expect(exercises.find((x) => x.id === e.exerciseId)?.location).toBe("both");
      }
    }
  });
});
