"use client";

import Link from "next/link";

import { Button, buttonClass } from "@/shared/ui/button";
import { InputField } from "@/shared/ui/input-field";

import { loginAction } from "../actions";
import { FormAlert } from "./form-alert";
import { useAuthForm } from "./use-auth-form";

export function LoginForm() {
  const { formAction, onSubmit, pending, fieldErrors, formError, formRef, alertRef } =
    useAuthForm(loginAction);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-label="Logg inn"
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
        autoComplete="current-password"
        error={fieldErrors.password}
      />
      <FormAlert ref={alertRef} message={formError} />
      <Button type="submit" variant="primary" pending={pending}>
        Logg inn
      </Button>
      <div className="flex justify-center">
        <Link href="/registrer" className={buttonClass("text")}>
          Registrer ny bruker
        </Link>
      </div>
    </form>
  );
}
