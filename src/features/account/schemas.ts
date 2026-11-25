import { z } from "zod";

// Server-side validation of every account form (Story 1.2). Messages are shown under the field.
// Keep the limits in step with shared/auth/server.ts (Better Auth enforces them too).
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const MESSAGES = {
  emailInvalid: "Skriv en gyldig e-postadresse.",
  passwordTooShort: `Passordet er for kort. Bruk minst ${PASSWORD_MIN} tegn.`,
  passwordTooLong: `Passordet er for langt. Bruk høyst ${PASSWORD_MAX} tegn.`,
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
    .min(PASSWORD_MIN, { error: MESSAGES.passwordTooShort })
    .max(PASSWORD_MAX, { error: MESSAGES.passwordTooLong }),
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
