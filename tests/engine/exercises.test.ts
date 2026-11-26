import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  exerciseLibrarySchema,
  exerciseSchema,
  MOVEMENT_PATTERNS,
  patternGaps,
  type Exercise,
} from "@/shared/engine/exercise";

const raw: unknown = JSON.parse(
  readFileSync(new URL("../../data/exercises/exercises.json", import.meta.url), "utf8"),
);
const library = exerciseLibrarySchema.parse(raw);
const { exercises, knownHomeGaps, muscleNamesNo } = library;

// Equipment a home exercise may need: none, or body weight (a bar, table edge, chair or step is
// part of "body only" for pull-ups, rows and step-ups, R5).
const HOME_EQUIPMENT = new Set([null, "body only"]);

const squat: Exercise = {
  id: "x",
  source: "custom",
  nameNo: "Knebøy",
  nameEn: "Squat",
  pattern: "squat",
  location: "both",
  bodyweight: true,
  primaryMuscles: ["quadriceps"],
  secondaryMuscles: [],
  sourceEquipment: null,
  level: "beginner",
};

describe("exercise schema", () => {
  it("accepts every exercise in the library file", () => {
    expect(exercises.length).toBeGreaterThanOrEqual(30);
    expect(exercises.length).toBeLessThanOrEqual(50);
  });

  it("has unique ids", () => {
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
  });

  it("rejects an unknown movement pattern, an empty Norwegian name and a missing field", () => {
    expect(exerciseSchema.safeParse({ ...squat, pattern: "sprint" }).success).toBe(false);
    expect(exerciseSchema.safeParse({ ...squat, nameNo: " " }).success).toBe(false);
    const withoutFlag: Partial<Exercise> = { ...squat };
    delete withoutFlag.bodyweight;
    expect(exerciseSchema.safeParse(withoutFlag).success).toBe(false);
    expect(exerciseSchema.safeParse({ ...squat, extra: 1 }).success).toBe(false);
  });

  it("gives every muscle group a Norwegian name", () => {
    const used = new Set(exercises.flatMap((e) => [...e.primaryMuscles, ...e.secondaryMuscles]));
    for (const muscle of used) expect(muscleNamesNo[muscle], muscle).toBeTruthy();
  });
});

describe("marking: gym, home or both", () => {
  it("makes exactly the home (`both`) exercises bodyweight, so their load is null", () => {
    for (const e of exercises) expect(e.bodyweight, e.id).toBe(e.location === "both");
  });

  it("lets a home exercise need no equipment beyond body weight", () => {
    for (const e of exercises.filter((x) => x.location === "both")) {
      expect(HOME_EQUIPMENT.has(e.sourceEquipment), `${e.id}: ${e.sourceEquipment}`).toBe(true);
    }
  });
});

describe("coverage of the Session slots", () => {
  it("has at least two exercises per movement pattern for the gym", () => {
    expect(patternGaps(exercises, "gym")).toEqual([]);
  });

  it("has at least two home exercises per pattern, except the known gaps", () => {
    // Every other gap fails; a listed gap that no longer exists fails too, so the list stays honest.
    expect(patternGaps(exercises, "home")).toEqual(
      MOVEMENT_PATTERNS.filter((pattern) => knownHomeGaps.includes(pattern)),
    );
  });

  it("detects a gap in a small library", () => {
    expect(patternGaps([squat], "home")).toContain("squat");
    expect(patternGaps([squat, { ...squat, id: "y" }], "home")).not.toContain("squat");
    expect(patternGaps([{ ...squat, location: "gym", bodyweight: false }], "home")).toContain(
      "squat",
    );
  });
});
