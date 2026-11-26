// progress-bar from DESIGN.md: a track in `border`, the fill in `primary`, and the value always
// as text above it («2 av 4 økter»). The text is the accessible value; no motion.

type ProgressBarProps = {
  /** The text shown above the bar, for example «0 av 3 økter». */
  label: string;
  value: number;
  max: number;
};

export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label text-text">{label}</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-3 w-full overflow-hidden rounded-full bg-border"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
