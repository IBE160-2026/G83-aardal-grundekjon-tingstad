// Loading state for Uke: a static skeleton with no movement, so it is calm with reduced motion
// and for everyone else (UX-DR25).
export default function Loading() {
  return (
    <div role="status" aria-label="Laster uka" className="flex flex-col gap-gap-card">
      <h1 className="text-display text-text">Uke</h1>
      <div className="h-3 w-full rounded-full bg-border" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-md border border-border bg-surface" />
      ))}
    </div>
  );
}
