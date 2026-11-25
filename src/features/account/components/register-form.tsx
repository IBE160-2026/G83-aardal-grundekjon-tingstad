"use client";

import Link from "next/link";

import { Button, buttonClass } from "@/shared/ui/button";
import { InputField } from "@/shared/ui/input-field";

import { registerAction } from "../actions";
import { FormAlert } from "./form-alert";
import { useAuthForm } from "./use-auth-form";

export function RegisterForm() {
  const { formAction, onSubmit, pending, fieldErrors, formError, formRef, alertRef } =
    useAuthForm(registerAction);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-label="Registrer ny bruker"
      className="flex flex-1 flex-col gap-gap-card"
    >
      <InputField
        name="email"
        label="E-post"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        error={fieldErrors.email}
      />
      <InputField
        name="password"
        label="Passord"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password}
      />
      <FormAlert ref={alertRef} message={formError} />
      <div className="flex-1" />
      <Button type="submit" variant="primary" pending={pending}>
        Registrer
      </Button>
      <div className="flex justify-center">
        <Link href="/logg-inn" className={buttonClass("text")}>
          Har du allerede en konto? Logg inn
        </Link>
      </div>
    </form>
  );
}
