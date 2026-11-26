"use client";

import { useActionState } from "react";

import { startDemoFormAction } from "@/seed/actions";
import type { DemoProfileKey } from "@/seed/demo-profiles";
import { ErrorIcon } from "@/shared/ui/input-field";

type Choice = { key: DemoProfileKey; title: string; description: string };

/**
 * One full-width card button per demo profile. Each submits the form with its profile key, so
 * the picker also works without JavaScript. While a demo is being created every card ignores
 * presses (aria-disabled), so a double click creates one demo user.
 */
export function DemoPicker({ choices }: { choices: Choice[] }) {
  const [state, formAction, pending] = useActionState(startDemoFormAction, null);
  const error = state && !state.ok ? state.message : null;

  return (
    <form action={formAction} aria-label="Velg demoprofil" className="flex flex-col gap-gap-card">
      {choices.map(({ key, title, description }) => (
        <button
          key={key}
          type="submit"
          name="profile"
          value={key}
          aria-disabled={pending || undefined}
          onClick={(event) => {
            if (pending) event.preventDefault();
          }}
          className="flex min-h-tap-min w-full cursor-pointer flex-col gap-1 rounded-lg border-2 border-text-muted bg-surface px-5 py-4 text-left [overflow-wrap:anywhere] aria-disabled:cursor-not-allowed aria-disabled:border-border"
        >
          <span className="text-title text-text">{title}</span>
          <span className="text-body text-text-muted">{description}</span>
        </button>
      ))}
      <div role="alert" aria-atomic="true">
        {error ? (
          <p className="flex items-start gap-2 text-body text-error">
            <ErrorIcon />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </form>
  );
}
