import { describe, expect, it } from "vitest";

import {
  buildDays,
  dayName,
  distanceText,
  nextSession,
  nextSessionText,
  NO_SESSIONS_LEFT,
  progressText,
  REST_LINES,
  sessionName,
  type SessionView,
} from "@/features/plan/view";

const session = (date: string, weekday: number, nameKey: string): SessionView => ({
  slotId: `slot-${date}`,
  date,
  weekday,
  kind: "strength",
  nameKey,
  distanceKm: null,
});

// Week of Monday 23 November 2026, with sessions on Tuesday and Thursday.
const sessions = [session("2026-11-24", 2, "full_body"), session("2026-11-26", 4, "full_body")];

describe("names", () => {
  it("names the days and the sessions in bokmål", () => {
    expect(dayName("2026-11-23")).toBe("Mandag");
    expect(dayName("2026-11-29")).toBe("Søndag");
    expect(sessionName("full_body")).toBe("Fullkropp");
    expect(sessionName("long")).toBe("Langtur");
    expect(sessionName("easy_short")).toBe("Rolig kortløp");
  });

  it("shows a distance in km with one decimal and a decimal comma", () => {
    expect(distanceText(7.5)).toBe("7,5 km");
    expect(distanceText(2)).toBe("2,0 km");
    expect(distanceText(21)).toBe("21,0 km");
  });

  it("has one supportive rest line for strength and one for running", () => {
    expect(REST_LINES.strength).toMatch(/^Hvile gir musklene/);
    expect(REST_LINES.running).not.toBe(REST_LINES.strength);
  });
});

describe("buildDays", () => {
  it("lists all seven days, with rest days where there is no session, and marks today", () => {
    const days = buildDays("2026-11-23", "2026-11-23", "2026-11-24", sessions);

    expect(days.map((d) => d.type)).toEqual([
      "rest",
      "session",
      "rest",
      "session",
      "rest",
      "rest",
      "rest",
    ]);
    expect(days.filter((d) => d.today).map((d) => d.date)).toEqual(["2026-11-24"]);
  });

  it("starts at the program start when the program starts mid-week", () => {
    const days = buildDays("2026-11-23", "2026-11-25", "2026-11-25", [sessions[1]]);

    expect(days.map((d) => d.date)).toEqual([
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
      "2026-11-28",
      "2026-11-29",
    ]);
  });
});

describe("counter and next session", () => {
  it("shows the counter with X at 0 until logging exists", () => {
    expect(progressText(0, 2)).toBe("0 av 2 økter");
    expect(progressText(0, 5)).toBe("0 av 5 økter");
  });

  it("finds the first session after today", () => {
    expect(nextSession(sessions, "2026-11-23")?.date).toBe("2026-11-24");
    expect(nextSession(sessions, "2026-11-25")?.date).toBe("2026-11-26");
  });

  it("does not count today's session as next, and returns null when none is left", () => {
    expect(nextSession(sessions, "2026-11-24")?.date).toBe("2026-11-26");
    expect(nextSession(sessions, "2026-11-26")).toBeNull();
    expect(nextSession([], "2026-11-23")).toBeNull();
  });

  it("tells that the plan comes on Monday when no session is left", () => {
    expect(NO_SESSIONS_LEFT).toContain("kommer mandag");
  });

  it("writes «Neste økt: dag, økt»", () => {
    expect(nextSessionText(sessions[1])).toBe("Neste økt: Torsdag, Fullkropp");
  });
});
