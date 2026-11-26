"use client";

import { useActionState, useState } from "react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";

import { deleteAccountAction } from "../actions";

const SPLIT_BUTTON = "flex-1 basis-[8rem]";

/**
 * «Slett konto» on Profil (button-destructive, Story 1.5). Opens a confirmation dialog; «Slett»
 * deletes the account and goes to the login screen, «Avbryt» or Escape closes it.
 */
export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async () => (await deleteAccountAction()) ?? null,
    null,
  );
  const error = state && !state.ok ? state.message : null;

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Slett konto
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Slett konto"
        description="Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid."
      >
        {error ? (
          <p role="alert" className="text-body text-error">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className={SPLIT_BUTTON} onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <form action={formAction} className={`flex ${SPLIT_BUTTON}`}>
            <Button type="submit" variant="destructive" pending={pending}>
              Slett
            </Button>
          </form>
        </div>
      </Dialog>
    </>
  );
}
