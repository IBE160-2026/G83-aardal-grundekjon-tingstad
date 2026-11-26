// The plan tables (Story 2.3), owned by the `plan` slice (AD-3, AD-7, AD-8). Every table carries
// the user id with ON DELETE CASCADE, so deleting the user deletes the plan (FR16), and every
// query filters on it. A plan version is never edited; a session slot keeps its id in every
// version of the week, and what a session contains in a version is a version_session row.

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { PlannedExercise } from "../../engine/plan";
import { user } from "./auth";

const userId = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const program = pgTable(
  "program",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    focus: text("focus").notNull(),
    /** The calendar date the program starts (Europe/Oslo), `YYYY-MM-DD`. */
    startedOn: date("started_on", { mode: "string" }).notNull(),
    isCurrent: boolean("is_current").notNull().default(true),
    /** Running: the fast short run's fixed distance, set once in the first week (R7). */
    fastShortRunKm: doublePrecision("fast_short_run_km"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // A user has exactly one current program (AD-7).
    uniqueIndex("program_one_current_per_user")
      .on(table.userId)
      .where(sql`${table.isCurrent}`),
  ],
);

export const planWeek = pgTable(
  "plan_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    programId: uuid("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "cascade" }),
    /** The Monday of the week, `YYYY-MM-DD`. */
    weekStart: date("week_start", { mode: "string" }).notNull(),
    /** The version number that is current for this week. */
    currentVersion: smallint("current_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // One plan week per program and Monday: this key makes week creation idempotent (AD-7).
  (table) => [unique("plan_week_program_week_start").on(table.programId, table.weekStart)],
);

export const planVersion = pgTable(
  "plan_version",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    planWeekId: uuid("plan_week_id")
      .notNull()
      .references(() => planWeek.id, { onDelete: "cascade" }),
    version: smallint("version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("plan_version_week_version").on(table.planWeekId, table.version)],
);

/** A planned session with an id that stays the same in every version of its week (AD-8). */
export const sessionSlot = pgTable(
  "session_slot",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    planWeekId: uuid("plan_week_id")
      .notNull()
      .references(() => planWeek.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("session_slot_week_idx").on(table.planWeekId)],
);

/** What a slot contains in one version: day, type, exercises or distance. Never edited. */
export const versionSession = pgTable(
  "version_session",
  {
    planVersionId: uuid("plan_version_id")
      .notNull()
      .references(() => planVersion.id, { onDelete: "cascade" }),
    sessionSlotId: uuid("session_slot_id")
      .notNull()
      .references(() => sessionSlot.id, { onDelete: "cascade" }),
    userId: userId(),
    date: date("date", { mode: "string" }).notNull(),
    /** `strength` or `run`. */
    kind: text("kind").notNull(),
    /** The strength template or the run type. */
    nameKey: text("name_key").notNull(),
    exercises: jsonb("exercises").$type<PlannedExercise[]>(),
    distanceKm: doublePrecision("distance_km"),
  },
  (table) => [primaryKey({ columns: [table.planVersionId, table.sessionSlotId] })],
);

/** Hints a user has closed (UX-DR12), so the welcome card does not come back. */
export const userHint = pgTable(
  "user_hint",
  {
    userId: userId(),
    hintKey: text("hint_key").notNull(),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.hintKey] })],
);
