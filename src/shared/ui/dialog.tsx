"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef } from "react";

// The modal pattern from EXPERIENCE.md (UX-DR13), built on the native <dialog> opened with
// showModal(): the rest of the page is inert while it is open. Focus moves to the first focusable
// element on open, Tab and Shift+Tab wrap inside the dialog, Escape calls `onClose`, and focus
// returns to the element that opened it. It never closes by itself (no backdrop-click close).
// Scrim = background at 60 % (DESIGN.md, Elevation); panel in the popup-done style.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DialogProps = {
  open: boolean;
  /** Called on Escape. The parent closes the dialog by setting `open` to false. */
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      dialog.close();
      opener?.focus();
    };
  }, [open]);

  function trapTab(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        // Escape: let React state close it, so `open` stays the single source of truth.
        event.preventDefault();
        onClose();
      }}
      onKeyDown={trapTab}
      className="m-auto w-[calc(100%-2*var(--spacing-margin-screen))] max-w-content rounded-xl border-0 bg-surface p-6 text-text backdrop:bg-background/60"
    >
      <div className="flex flex-col gap-gap-card">
        <h2 id={titleId} className="text-title text-text">
          {title}
        </h2>
        <p id={descriptionId} className="text-body text-text">
          {description}
        </p>
        {children}
      </div>
    </dialog>
  );
}
