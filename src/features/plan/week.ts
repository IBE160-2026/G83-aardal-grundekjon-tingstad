import "server-only";

import { and, eq } from "drizzle-orm";

import { getProfile, type ProfileInput } from "@/features/profile/api";
import { getDb } from "@/shared/db/client";
import { planVersion, planWeek, program, sessionSlot, versionSession } from "@/shared/db/schema";
import { type EngineProfile, generateFirstWeek } from "@/shared/engine/plan";
import type { SessionsPerWeek } from "@/shared/engine/plan-constants";
import { type CalendarDate, isoWeekday, toOsloDate, weekStart } from "@/shared/lib/dates";

import { getExercises } from "./library";
import type { SessionView } from "./view";

export type CurrentWeek = {
  weekStart: CalendarDate;
  /** The program's start date: days before it are not part of the first week. */
  programStart: CalendarDate;
  today: CalendarDate;
  focus: "strength" | "running";
  sessions: SessionView[];
};

export type SessionDetail = SessionView & {
  exercises: { name: string; sets: number; reps: number; bodyweight: boolean }[];
};

/** The profile in the engine's plain shape; the profile schema already guarantees 2–5 sessions. */
function toEngineProfile(profile: ProfileInput): EngineProfile {
  return {
    ...profile,
    sessionsPerWeek: profile.sessionsPerWeek as SessionsPerWeek,
  } as EngineProfile;
}

/**
 * Makes sure the plan week that contains today exists (AD-7) and returns whether it does. Creates
 * the user's program from today if there is none, and the engine's version 1 of the first week.
 * Idempotent and race-safe: two simultaneous calls create one program, one week and one version,
 * because the unique keys make the second insert wait and then do nothing. A later week of an
 * existing program is not created here (Story 2.5), and a user without a profile gets nothing.
 */
export async function ensureCurrentWeek(userId: string, now: Date): Promise<boolean> {
  const today = toOsloDate(now);
  const profile = await getProfile(userId);
  if (!profile) return false;

  return getDb().transaction(async (tx) => {
    const findProgram = () =>
      tx
        .select()
        .from(program)
        .where(and(eq(program.userId, userId), eq(program.isCurrent, true)))
        .limit(1)
        .then((rows) => rows[0]);

    let current = await findProgram();
    if (!current) {
      await tx
        .insert(program)
        .values({ userId, focus: profile.focus, startedOn: today })
        .onConflictDoNothing();
      current = await findProgram();
    }
    if (!current) return false;

    const monday = weekStart(today);
    const [existing] = await tx
      .select({ id: planWeek.id })
      .from(planWeek)
      .where(and(eq(planWeek.programId, current.id), eq(planWeek.weekStart, monday)))
      .limit(1);
    if (existing) return true;
    // Only the program's first week is generated from the profile here.
    if (monday !== weekStart(current.startedOn)) return false;

    const [created] = await tx
      .insert(planWeek)
      .values({ userId, programId: current.id, weekStart: monday })
      .onConflictDoNothing()
      .returning({ id: planWeek.id });
    // Another request created the week while this one waited: nothing more to do.
    if (!created) return true;

    const week = generateFirstWeek({
      profile: toEngineProfile(profile),
      exercises: getExercises(),
      programStart: current.startedOn,
      today,
    });
    const [version] = await tx
      .insert(planVersion)
      .values({ userId, planWeekId: created.id, version: 1 })
      .returning({ id: planVersion.id });
    if (week.fastShortRunKm !== null) {
      await tx
        .update(program)
        .set({ fastShortRunKm: week.fastShortRunKm })
        .where(and(eq(program.id, current.id), eq(program.userId, userId)));
    }
    for (const session of week.sessions) {
      const [slot] = await tx
        .insert(sessionSlot)
        .values({ userId, planWeekId: created.id })
        .returning({ id: sessionSlot.id });
      await tx.insert(versionSession).values({
        planVersionId: version.id,
        sessionSlotId: slot.id,
        userId,
        date: session.date,
        kind: session.kind,
        nameKey: session.kind === "strength" ? session.template : session.runType,
        exercises: session.kind === "strength" ? session.exercises : null,
        distanceKm: session.kind === "run" ? session.distanceKm : null,
      });
    }
    return true;
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SessionRow = typeof versionSession.$inferSelect & { slotId: string };

function toSessionView(row: SessionRow): SessionView {
  return {
    slotId: row.slotId,
    date: row.date,
    weekday: isoWeekday(row.date),
    kind: row.kind as SessionView["kind"],
    nameKey: row.nameKey,
    distanceKm: row.distanceKm,
  };
}

/**
 * This week's plan for the user: calls `ensureCurrentWeek` first, then reads the current version
 * of the week that contains today. Null when the user has no profile or no plan week yet.
 */
export async function getCurrentWeek(userId: string, now: Date): Promise<CurrentWeek | null> {
  if (!(await ensureCurrentWeek(userId, now))) return null;
  const today = toOsloDate(now);
  const db = getDb();

  const [week] = await db
    .select({
      id: planWeek.id,
      weekStart: planWeek.weekStart,
      currentVersion: planWeek.currentVersion,
      programStart: program.startedOn,
      focus: program.focus,
    })
    .from(planWeek)
    .innerJoin(program, eq(program.id, planWeek.programId))
    .where(
      and(
        eq(planWeek.userId, userId),
        eq(program.userId, userId),
        eq(program.isCurrent, true),
        eq(planWeek.weekStart, weekStart(today)),
      ),
    )
    .limit(1);
  if (!week) return null;

  const rows = await db
    .select({ session: versionSession, slotId: versionSession.sessionSlotId })
    .from(versionSession)
    .innerJoin(planVersion, eq(planVersion.id, versionSession.planVersionId))
    .where(
      and(
        eq(versionSession.userId, userId),
        eq(planVersion.planWeekId, week.id),
        eq(planVersion.version, week.currentVersion),
      ),
    );

  return {
    weekStart: week.weekStart,
    programStart: week.programStart,
    today,
    focus: week.focus as CurrentWeek["focus"],
    sessions: rows
      .map(({ session, slotId }) => toSessionView({ ...session, slotId }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/** One session of the user's current plan week, or null if the slot is not theirs or not found. */
export async function getSession(userId: string, slotId: string): Promise<SessionDetail | null> {
  // A path that is not a UUID can never match; Postgres would reject it with an error.
  if (!UUID_PATTERN.test(slotId)) return null;
  const db = getDb();
  const [row] = await db
    .select({ session: versionSession, slotId: sessionSlot.id })
    .from(sessionSlot)
    .innerJoin(planWeek, eq(planWeek.id, sessionSlot.planWeekId))
    .innerJoin(
      planVersion,
      and(
        eq(planVersion.planWeekId, planWeek.id),
        eq(planVersion.version, planWeek.currentVersion),
      ),
    )
    .innerJoin(
      versionSession,
      and(
        eq(versionSession.planVersionId, planVersion.id),
        eq(versionSession.sessionSlotId, sessionSlot.id),
      ),
    )
    .where(and(eq(sessionSlot.id, slotId), eq(sessionSlot.userId, userId)))
    .limit(1);
  if (!row) return null;

  const library = getExercises();
  const exercises = (row.session.exercises ?? []).map((planned) => ({
    name: library.find((e) => e.id === planned.exerciseId)?.nameNo ?? planned.exerciseId,
    sets: planned.sets,
    reps: planned.reps,
    bodyweight: planned.bodyweight,
  }));
  return { ...toSessionView({ ...row.session, slotId: row.slotId }), exercises };
}
