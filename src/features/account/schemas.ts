import { z } from "zod";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/shared/auth/server";

// Server-side validation of every account form (Story 1.2). Messages are shown under the field.

export const MESSAGES = {
  emailInvalid: "Skriv en gyldig e-postadresse.",
  passwordTooShort: `Passordet er for kort. Bruk minst ${MIN_PASSWORD_LENGTH} tegn.`,
  passwordTooLong: `Passordet er for langt. Bruk høyst ${MAX_PASSWORD_LENGTH} tegn.`,
  passwordMissing: "Skriv passordet ditt.",
  emailInUse: "Det finnes allerede en konto med denne e-postadressen.",
  wrongLogin: "Feil e-post eller passord.",
  checkFields: "Sjekk feltene som er markert.",
  unexpected: "Noe gikk galt. Prøv igjen om litt.",
} as const;

/** Trims and lower-cases the address, so « Mari@Eksempel.no » and «mari@eksempel.no» are one account. */
const email = z
  .string({ error: MESSAGES.emailInvalid })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: MESSAGES.emailInvalid }));

export const registerSchema = z.object({
  email,
  password: z
    .string({ error: MESSAGES.passwordTooShort })
    .min(MIN_PASSWORD_LENGTH, { error: MESSAGES.passwordTooShort })
    .max(MAX_PASSWORD_LENGTH, { error: MESSAGES.passwordTooLong }),
});

// Login checks only the shape: whether the account exists or the password is right is answered
// with one general message, so the form never reveals which field was wrong.
export const loginSchema = z.object({
  email,
  password: z
    .string({ error: MESSAGES.passwordMissing })
    .min(1, { error: MESSAGES.passwordMissing }),
});

export type Credentials = z.infer<typeof registerSchema>;

/** The first message per field, as `fieldErrors` for ActionResult. */
export function fieldErrorsOf(error: z.ZodError): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
