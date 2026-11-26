import type { ReactNode } from "react";

// hint-card from DESIGN.md (UX-DR12): surface, 2 px accent border, `md` radius, text and a close
// button (✕) of at least 44 px. The close button is a form button, so it works without JavaScript.

type HintCardProps = {
  children: ReactNode;
  /** The server action that closes the hint. */
  action: () => Promise<void>;
};

export function HintCard({ children, action }: HintCardProps) {
  return (
    <section
      aria-label="Tips"
      className="flex items-start gap-2 rounded-md border-2 border-accent bg-surface p-4"
    >
      <p className="min-w-0 flex-1 text-body text-text">{children}</p>
      <form action={action}>
        <button
          type="submit"
          aria-label="Lukk tipset"
          className="flex min-h-tap-min min-w-tap-min cursor-pointer items-center justify-center rounded-sm text-title text-text"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </form>
    </section>
  );
}
