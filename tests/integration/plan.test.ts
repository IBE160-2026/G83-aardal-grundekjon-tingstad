import { randomUUID } from "node:crypto";

import { eq, like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import {
  ensureCurrentWeek,
  getCurrentWeek,
  getSession,
  isHintDismissed,
  WELCOME_HINT,
} from "@/features/plan/api";
import { dismissHint } from "@/features/plan/hints";
import { saveProfile } from "@/features/profile/api";
import { getDb } from "@/shared/db/client";
import {
  planVersion,
  planWeek,
  program,
  sessionSlot,
  user,
  userHint,
  versionSession,
} from "@/shared/db/schema";

// Story 2.3: the plan tables and `ensureCurrentWeek` / `getCurrentWeek` / `getSession` (AD-7,
// AD-8, NFR9). Runs against the compose Postgres (`docker compose up -d db && npm run
// db:migrate`); skipped without DATABASE_URL, but never skipped in CI.
const DATABASE_URL = process.env.DATABASE_URL;
if (process.env.CI && !DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in CI: the integration tests may not be skipped there.",
  );
}

const DOMAIN = `plan-${randomUUID().slice(0, 8)}.flexpt.test`;

// Monday, Wednesday and Thursday of the week of 23 November 2026, and the Tuesday after it.
const MONDAY = new Date("2026-11-23T10:00:00Z");
const WEDNESDAY = new Date("2026-11-25T10:00:00Z");
const NEXT_TUESDAY = new Date("2026-12-01T10:00:00Z");

const PROFILE_A = {
  focus: "strength",
  experience: "beginner",
  mainFocus: "full_body",
  sessionsPerWeek: 2,
  equipment: "gym",
} as const;
const PROFILE_C = {
  focus: "running",
  experience: "beginner",
  goal: "10k",
  longestRunKm: 3,
  sessionsPerWeek: 3,
} as const;

async function newUser(profile?: Parameters<typeof saveProfile>[1]): Promise<string> {
  const id = randomUUID();
  await getDb()
    .insert(user)
    .values({ id, name: "", email: `${id.slice(0, 8)}@${DOMAIN}` });
  if (profile) await saveProfile(id, profile);
  return id;
}

async function counts(userId: string) {
  const db = getDb();
  const count = async (
    table:
      | typeof program
      | typeof planWeek
      | typeof planVersion
      | typeof sessionSlot
      | typeof versionSession,
  ) => (await db.select().from(table).where(eq(table.userId, userId))).length;
  return {
    program: await count(program),
    planWeek: await count(planWeek),
    planVersion: await count(planVersion),
    sessionSlot: await count(sessionSlot),
    versionSession: await count(versionSession),
  };
}

describe.skipIf(!DATABASE_URL)("the plan week (Story 2.3)", () => {
  afterAll(async () => {
    await getDb()
      .delete(user)
      .where(like(user.email, `%@${DOMAIN}`));
  });

  it("creates the program and version 1 of the week for a user with a profile", async () => {
    const id = await newUser(PROFILE_A);

    expect(await ensureCurrentWeek(id, MONDAY)).toBe(true);

    expect(await counts(id)).toEqual({
      program: 1,
      planWeek: 1,
      planVersion: 1,
      sessionSlot: 2,
      versionSession: 2,
    });
    const week = await getCurrentWeek(id, MONDAY);
    expect(week?.weekStart).toBe("2026-11-23");
    expect(week?.programStart).toBe("2026-11-23");
    expect(week?.sessions.map((s) => [s.date, s.nameKey])).toEqual([
      ["2026-11-24", "full_body"],
      ["2026-11-26", "full_body"],
    ]);
  });

  it("does nothing the second time: same slots, no new rows", async () => {
    const id = await newUser(PROFILE_A);
    const first = await getCurrentWeek(id, MONDAY);
    const second = await getCurrentWeek(id, new Date("2026-11-26T08:00:00Z"));

    expect(second?.sessions.map((s) => s.slotId)).toEqual(first?.sessions.map((s) => s.slotId));
    expect(await counts(id)).toMatchObject({ program: 1, planWeek: 1, planVersion: 1 });
  });

  it("creates one program, one week and one version for simultaneous first visits (NFR9)", async () => {
    const id = await newUser(PROFILE_A);

    const results = await Promise.all(
      Array.from({ length: 6 }, () => ensureCurrentWeek(id, MONDAY)),
    );

    expect(results).toEqual(Array(6).fill(true));
    expect(await counts(id)).toEqual({
      program: 1,
      planWeek: 1,
      planVersion: 1,
      sessionSlot: 2,
      versionSession: 2,
    });
  });

  it("plans only the days from the program start onward when it starts mid-week", async () => {
    // Three sessions are Mon, Wed, Sat; starting on Wednesday leaves Wed and Sat.
    const id = await newUser({ ...PROFILE_A, sessionsPerWeek: 3 });

    const week = await getCurrentWeek(id, WEDNESDAY);

    expect(week?.programStart).toBe("2026-11-25");
    expect(week?.sessions.map((s) => s.date)).toEqual(["2026-11-25", "2026-11-28"]);
  });

  it("stores a run's distance and the fast short run's fixed distance on the program", async () => {
    const id = await newUser(PROFILE_C);

    const week = await getCurrentWeek(id, MONDAY);

    expect(week?.sessions.map((s) => [s.nameKey, s.distanceKm])).toEqual([
      ["easy_short", 2],
      ["fast_short", 2],
      ["long", 3],
    ]);
    const [row] = await getDb().select().from(program).where(eq(program.userId, id));
    expect(row.fastShortRunKm).toBe(2);
  });

  it("creates nothing for a user without a profile", async () => {
    const id = await newUser();

    expect(await ensureCurrentWeek(id, MONDAY)).toBe(false);
    expect(await getCurrentWeek(id, MONDAY)).toBeNull();
    expect(await counts(id)).toEqual({
      program: 0,
      planWeek: 0,
      planVersion: 0,
      sessionSlot: 0,
      versionSession: 0,
    });
  });

  it("never fills in a later week of an existing program (Story 2.5 does that)", async () => {
    const id = await newUser(PROFILE_A);
    await getCurrentWeek(id, MONDAY);

    expect(await ensureCurrentWeek(id, NEXT_TUESDAY)).toBe(false);
    expect(await getCurrentWeek(id, NEXT_TUESDAY)).toBeNull();
    expect(await counts(id)).toMatchObject({ planWeek: 1, planVersion: 1 });
  });

  it("lets a user open their own session, with exercises, sets and reps but no load", async () => {
    const id = await newUser(PROFILE_A);
    const week = await getCurrentWeek(id, MONDAY);

    const detail = await getSession(id, week!.sessions[0].slotId);

    expect(detail?.nameKey).toBe("full_body");
    expect(detail?.exercises).toHaveLength(4);
    for (const exercise of detail!.exercises) {
      expect(exercise.name).not.toBe("");
      expect([exercise.sets, exercise.reps]).toEqual([3, 10]);
    }
    expect(JSON.stringify(detail)).not.toMatch(/"load"/);
  });

  it("does not show a session to another user, or to a path that is not an id", async () => {
    const owner = await newUser(PROFILE_A);
    const other = await newUser(PROFILE_A);
    const week = await getCurrentWeek(owner, MONDAY);
    const slotId = week!.sessions[0].slotId;

    expect(await getSession(other, slotId)).toBeNull();
    expect(await getSession(owner, randomUUID())).toBeNull();
    expect(await getSession(owner, "not-a-uuid")).toBeNull();
  });

  it("keeps a user's weeks apart", async () => {
    const a = await newUser(PROFILE_A);
    const c = await newUser(PROFILE_C);
    const [weekA, weekC] = await Promise.all([
      getCurrentWeek(a, MONDAY),
      getCurrentWeek(c, MONDAY),
    ]);

    expect(weekA?.focus).toBe("strength");
    expect(weekC?.focus).toBe("running");
    const slotsOfA = new Set(weekA?.sessions.map((s) => s.slotId));
    expect(weekC?.sessions.some((s) => slotsOfA.has(s.slotId))).toBe(false);
  });

  it("allows only one current program per user and one plan week per program and Monday", async () => {
    const id = await newUser(PROFILE_A);
    await getCurrentWeek(id, MONDAY);
    const [current] = await getDb().select().from(program).where(eq(program.userId, id));

    await expect(
      getDb().insert(program).values({ userId: id, focus: "strength", startedOn: "2026-11-30" }),
    ).rejects.toThrow();
    await expect(
      getDb()
        .insert(planWeek)
        .values({ userId: id, programId: current.id, weekStart: "2026-11-23" }),
    ).rejects.toThrow();
  });

  it("remembers a closed hint per user, and closing twice has no extra effect", async () => {
    const id = await newUser(PROFILE_A);
    const other = await newUser(PROFILE_A);
    expect(await isHintDismissed(id, WELCOME_HINT)).toBe(false);

    await dismissHint(id, WELCOME_HINT);
    await dismissHint(id, WELCOME_HINT);

    expect(await isHintDismissed(id, WELCOME_HINT)).toBe(true);
    expect(await isHintDismissed(other, WELCOME_HINT)).toBe(false);
    expect(await getDb().select().from(userHint).where(eq(userHint.userId, id))).toHaveLength(1);
  });
});
