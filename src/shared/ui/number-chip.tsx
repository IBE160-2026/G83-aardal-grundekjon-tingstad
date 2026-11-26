import type { InputHTMLAttributes, ReactNode } from "react";

// number-chip from DESIGN.md (sessions per week, 2 to 5): a round radio button of tap-button size.
// Selected = filled primary with a ✓ in the corner, never colour alone. No transitions.

type NumberChipProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & {
  name: string;
  value: string;
  checked: boolean;
  children: ReactNode;
};

export function NumberChip({ checked, children, className, ...props }: NumberChipProps) {
  return (
    <label
      className={`relative flex size-tap-button shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-title has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
        checked
          ? "border-primary bg-primary text-on-primary"
          : "border-text-muted bg-surface text-text"
      } ${className ?? ""}`}
    >
      <input
        {...props}
        type="radio"
        checked={checked}
        className="absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0"
      />
      {checked && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-on-primary text-label text-primary ring-2 ring-primary"
        >
          ✓
        </span>
      )}
      <span>{children}</span>
    </label>
  );
}
