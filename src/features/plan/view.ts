// Pure helpers for showing a plan week (Story 2.3): Norwegian names, the day list, the counter
// and «Neste økt». No database and no clock: the caller passes today's date.

import { addDays, isoWeekday, type CalendarDate } from "@/shared/lib/dates";

export type SessionView = {
  slotId: string;
  date: CalendarDate;
  weekday: number;
  kind: "strength" | "run";
  /** The strength template or the run type. */
  nameKey: string;
  distanceKm: number | null;
};

export type DayView =
  | { type: "session"; date: CalendarDate; today: boolean; session: SessionView }
  | { type: "rest"; date: CalendarDate; today: boolean };

export const DAY_NAMES = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

const SESSION_NAMES: Record<string, string> = {
  full_body: "Fullkropp",
  upper: "Overkropp",
  lower: "Underkropp",
  push: "Push",
  pull: "Pull",
  legs: "Bein",
  easy_short: "Rolig kortløp",
  fast_short: "Rask kortløp",
  long: "Langtur",
};

/** One supportive line per kind of training under «Hviledag» (Appendix B, profile B). */
export const REST_LINES = {
  strength: "Hvile gir musklene tid til å bli sterkere.",
  running: "Hvile gjør at kroppen tåler neste løpetur bedre.",
} as const;

export function dayName(date: CalendarDate): string {
  return DAY_NAMES[isoWeekday(date) - 1];
}

export function sessionName(nameKey: string): string {
  return SESSION_NAMES[nameKey] ?? nameKey;
}

/** A distance in km with one decimal and a decimal comma: 7.5 → «7,5 km». */
export function distanceText(km: number): string {
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** The week's days from `from` (the program start) to Sunday, each with its session or rest. */
export function buildDays(
  weekStart: CalendarDate,
  from: CalendarDate,
  today: CalendarDate,
  sessions: readonly SessionView[],
): DayView[] {
  const days: DayView[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    if (date < from) continue;
    const session = sessions.find((s) => s.date === date);
    days.push(
      session
        ? { type: "session", date, today: date === today, session }
        : { type: "rest", date, today: date === today },
    );
  }
  return days;
}

/** Shown when no session is left in the first week, for example a start late in the week. */
export const NO_SESSIONS_LEFT = "Ingen økter igjen denne uka. Ukeplanen din kommer mandag.";

/** The counter text: X stays 0 until logging exists (Epic 3). */
export function progressText(done: number, total: number): string {
  return `${done} av ${total} økter`;
}

/** The first session after today, or null when no session is left this week. */
export function nextSession(
  sessions: readonly SessionView[],
  today: CalendarDate,
): SessionView | null {
  const later = sessions.filter((s) => s.date > today).sort((a, b) => a.date.localeCompare(b.date));
  return later[0] ?? null;
}

/** «Neste økt: Fredag, Fullkropp». */
export function nextSessionText(session: SessionView): string {
  return `Neste økt: ${dayName(session.date)}, ${sessionName(session.nameKey)}`;
}
