import Link from "next/link";

import { HintCard } from "@/shared/ui/hint-card";
import { ProgressBar } from "@/shared/ui/progress-bar";

import { dismissWelcomeHintAction } from "../actions";
import type { CurrentWeek } from "../week";
import {
  buildDays,
  dayName,
  distanceText,
  nextSession,
  nextSessionText,
  progressText,
  REST_LINES,
  sessionName,
  type DayView,
} from "../view";

// Uke: the counter, the welcome hint, «Neste økt» and a day-row per day (Story 2.3, FR4, FR5).
// No week browsing and no change marker (FR15).

function sessionMeta(day: Extract<DayView, { type: "session" }>): string | null {
  const { session } = day;
  return session.kind === "run" && session.distanceKm !== null
    ? distanceText(session.distanceKm)
    : null;
}

function DayRow({ day, focus }: { day: DayView; focus: CurrentWeek["focus"] }) {
  const base = "flex flex-col gap-1 rounded-md bg-surface text-text";
  const name = dayName(day.date);
  if (day.type === "rest") {
    return (
      <li
        className={`${base} border border-border p-4 text-text-muted ${day.today ? "border-2 border-primary p-5" : ""}`}
      >
        <span className="text-label">
          {name}
          {day.today ? " (i dag)" : ""}
        </span>
        <span className="text-body">Hviledag</span>
        <span className="text-meta">{REST_LINES[focus]}</span>
      </li>
    );
  }
  const meta = sessionMeta(day);
  return (
    <li>
      <Link
        href={`/uke/${day.session.slotId}`}
        className={`${base} min-h-tap-min border ${day.today ? "border-2 border-primary p-5" : "border-border p-4"} focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary`}
      >
        <span className="text-label">
          {name}
          {day.today ? " (i dag)" : ""}
        </span>
        <span className="text-title [overflow-wrap:anywhere]">
          {sessionName(day.session.nameKey)}
        </span>
        {meta ? <span className="text-meta text-text-muted">{meta}</span> : null}
      </Link>
    </li>
  );
}

export function WeekView({ week, showWelcome }: { week: CurrentWeek; showWelcome: boolean }) {
  const days = buildDays(week.weekStart, week.programStart, week.today, week.sessions);
  const todayHasSession = days.some((d) => d.today && d.type === "session");
  const next = todayHasSession ? null : nextSession(week.sessions, week.today);
  return (
    <>
      {showWelcome ? (
        <HintCard action={dismissWelcomeHintAction}>
          Velkommen! Her ser du uka di. Trykk på en økt for å se hva som står på planen.
        </HintCard>
      ) : null}
      <ProgressBar
        label={progressText(0, week.sessions.length)}
        value={0}
        max={week.sessions.length}
      />
      {next ? <p className="text-body text-text">{nextSessionText(next)}</p> : null}
      <ul className="flex flex-col gap-gap-card">
        {days.map((day) => (
          <DayRow key={day.date} day={day} focus={week.focus} />
        ))}
      </ul>
    </>
  );
}
