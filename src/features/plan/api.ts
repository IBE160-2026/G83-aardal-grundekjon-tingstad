// Public surface of the `plan` slice (AD-1). Other code imports this slice only through this file.
// Owns programs, plan weeks, versions and session slots (AD-3, AD-7, AD-8).
// Every function takes the user id as its first argument and enforces its own rules.

import "server-only";

export { dismissWelcomeHintAction } from "./actions";
export { SessionDetailView } from "./components/session-view";
export { WeekView } from "./components/week-view";
export { isHintDismissed, WELCOME_HINT } from "./hints";
export { ensureCurrentWeek, getCurrentWeek, getSession } from "./week";
export type { CurrentWeek, SessionDetail } from "./week";
