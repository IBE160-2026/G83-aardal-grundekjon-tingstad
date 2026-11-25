"use client";

import { useActionState } from "react";

import { Button } from "@/shared/ui/button";

import { logoutAction } from "../actions";

/** «Logg ut» on Profil (button-secondary). Ends the session and goes to the login screen. */
export function LogoutButton() {
  const [, formAction, pending] = useActionState(async () => {
    await logoutAction();
  }, undefined);

  return (
    <form action={formAction}>
      <Button type="submit" variant="secondary" pending={pending}>
        Logg ut
      </Button>
    </form>
  );
}
