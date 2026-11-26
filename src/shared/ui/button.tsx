import type { ButtonHTMLAttributes } from "react";

// button-primary / button-secondary / button-text / button-destructive from DESIGN.md (Components).
export type ButtonVariant = "primary" | "secondary" | "text" | "destructive";

const BASE =
  "inline-flex items-center justify-center text-center [overflow-wrap:anywhere] cursor-pointer aria-disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  // Full width, 68 px, nearly a pill. Max one per screen.
  primary:
    "w-full min-h-tap-button rounded-xl px-6 py-3 text-button bg-primary text-on-primary aria-disabled:bg-border aria-disabled:text-text-muted",
  secondary:
    "w-full min-h-tap-button rounded-xl px-6 py-3 text-button bg-surface text-primary border-2 border-primary aria-disabled:border-text-muted aria-disabled:text-text-muted",
  // Outlined in the error colour, never filled red. Always behind a confirmation dialog.
  destructive:
    "w-full min-h-tap-button rounded-xl px-6 py-3 text-button bg-surface text-error border-2 border-error aria-disabled:border-text-muted aria-disabled:text-text-muted",
  text: "min-h-tap-min rounded-sm px-2 text-label text-primary underline-offset-4 hover:underline aria-disabled:text-text-muted",
};

/** Class names for a button look; also used for links that look like buttons. */
export function buttonClass(variant: ButtonVariant, className = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Shows the button as unavailable and ignores presses, while it keeps focus (aria-disabled). */
  pending?: boolean;
};

export function Button({
  variant = "primary",
  pending = false,
  className,
  type = "button",
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-disabled={pending || undefined}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={buttonClass(variant, className)}
    >
      {children}
    </button>
  );
}
