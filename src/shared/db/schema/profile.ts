// The training profile (Story 1.4), owned by the `profile` slice (AD-3). One row per user, deleted
// with the user (ON DELETE CASCADE). Strength fields (main focus, equipment) and running fields
// (goal, longest run) are null for the other focus; `profile`'s Zod schema keeps them consistent.

import {
  check,
  doublePrecision,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { user } from "./auth";

export const profile = pgTable(
  "profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    focus: text("focus").notNull(),
    experience: text("experience").notNull(),
    sessionsPerWeek: smallint("sessions_per_week").notNull(),
    mainFocus: text("main_focus"),
    equipment: text("equipment"),
    goal: text("goal"),
    longestRunKm: doublePrecision("longest_run_km"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("profile_sessions_per_week_check", sql`${table.sessionsPerWeek} between 2 and 5`),
  ],
);
