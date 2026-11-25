"use client";

import { type FormEvent, startTransition, useActionState, useEffect, useRef } from "react";

import type { AuthFormState } from "../actions";

type AuthAction = (previous: AuthFormState, formData: FormData) => Promise<AuthFormState>;

/**
 * Runs a login or registration action. The submit is dispatched from onSubmit so the browser
 * keeps what was typed when the server answers with an error (a form `action` would reset the
 * fields), and a second submit while the first is pending is ignored. After an error, focus
 * moves to the first invalid field, or to the form-level message.
 */
export function useAuthForm(action: AuthAction) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!state || state.ok) return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? alertRef.current)?.focus();
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const formError = state && !state.ok && !state.fieldErrors ? state.message : null;

  return { formAction, onSubmit, pending, fieldErrors, formError, formRef, alertRef };
}
