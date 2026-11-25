"use client";

import { startTransition, useOptimistic, useState } from "react";

import { ChoiceCard } from "@/shared/ui/choice-card";

import { setThemeAction } from "../actions";
import { type Theme, themeAttribute } from "../theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Lys" },
  { value: "dark", label: "Mørk" },
  { value: "system", label: "Følg system" },
];

const SAVE_FAILED_MESSAGE = "Vi kunne ikke lagre valget. Prøv igjen.";

/** Applies a theme to the page at once, before the server confirms it. */
function applyTheme(theme: Theme) {
  const attribute = themeAttribute(theme);
  if (attribute) document.documentElement.dataset.theme = attribute;
  else delete document.documentElement.dataset.theme;
}

/** «Utseende» on Profil: Lys, Mørk or Følg system, stored on this device (AD-14). */
export function ThemePicker({ theme }: { theme: Theme }) {
  const [shown, setShown] = useOptimistic(theme);
  const [error, setError] = useState<string | null>(null);

  function choose(next: Theme) {
    applyTheme(next);
    setError(null);
    startTransition(async () => {
      setShown(next);
      let message: string | null;
      try {
        const result = await setThemeAction(next);
        message = result.ok ? null : result.message;
      } catch {
        // Network or server failure: the action never answered.
        message = SAVE_FAILED_MESSAGE;
      }
      // On failure the optimistic value falls back to the server's; put the page back too.
      if (message) {
        applyTheme(theme);
        setError(message);
      }
    });
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-label text-text">Utseende</legend>
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            name="theme"
            value={option.value}
            checked={shown === option.value}
            onChange={() => choose(option.value)}
          >
            {option.label}
          </ChoiceCard>
        ))}
      </div>
      <p role="alert" className="text-label text-error empty:hidden">
        {error}
      </p>
    </fieldset>
  );
}
