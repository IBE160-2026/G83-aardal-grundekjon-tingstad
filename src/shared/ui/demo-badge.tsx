// demo-badge from DESIGN.md: a small «Demo» pill at the top of the screen header while a demo
// user is signed in. Accent background, surface text, label type, full radius. Not interactive.
export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-accent px-3 text-label text-surface">
      Demo
    </span>
  );
}
