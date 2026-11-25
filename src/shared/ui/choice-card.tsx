import type { InputHTMLAttributes, ReactNode } from "react";

// A single-choice card (DESIGN.md: choice-card / effort-card-selected). A native radio inside a
// label, so a group of cards is announced as a radio group and arrow keys move the choice.
// Selected = filled primary with ✓, never colour alone. No transitions (reduced motion).

type ChoiceCardProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & {
  name: string;
  value: string;
  checked: boolean;
  children: ReactNode;
};

export function ChoiceCard({ checked, children, className, ...props }: ChoiceCardProps) {
  return (
    <label
      className={`relative flex min-h-tap-min min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border-2 px-2 py-3 text-center text-label [overflow-wrap:anywhere] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
        checked
          ? "border-primary bg-primary text-on-primary"
          : "border-text-muted bg-surface text-text"
      } ${className ?? ""}`}
    >
      {/* Invisible but covering the whole card, so a tap anywhere lands on the radio itself. */}
      <input
        {...props}
        type="radio"
        checked={checked}
        className="absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-lg opacity-0"
      />
      {checked && (
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-on-primary text-label text-primary"
        >
          ✓
        </span>
      )}
      <span>{children}</span>
    </label>
  );
}
