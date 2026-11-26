import { dayName, distanceText, sessionName } from "../view";
import type { SessionDetail } from "../week";

// One planned session (Story 2.3, FR5): a strength session lists its exercises with sets and
// reps and no load; a run shows its type and distance in km with one decimal.

export function SessionDetailView({ session }: { session: SessionDetail }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-label text-text-muted">{dayName(session.date)}</p>
        <h1 className="text-display text-text [overflow-wrap:anywhere]">
          {sessionName(session.nameKey)}
        </h1>
      </div>
      {session.kind === "run" && session.distanceKm !== null ? (
        <p className="rounded-md border border-border bg-surface p-4 text-title text-text">
          {distanceText(session.distanceKm)}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {session.exercises.map((exercise) => (
            <li
              key={exercise.name}
              className="flex flex-col gap-1 rounded-md border border-border bg-surface p-4"
            >
              <span className="text-title text-text [overflow-wrap:anywhere]">{exercise.name}</span>
              <span className="text-meta text-text-muted">
                {exercise.sets} sett × {exercise.reps} repetisjoner
                {exercise.bodyweight ? " · kroppsvekt" : ""}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
