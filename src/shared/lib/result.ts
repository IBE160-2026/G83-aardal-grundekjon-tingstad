// Result type for server actions (architecture spine, Consistency Conventions).
// `message` is shown to the user and is in Norwegian bokmål; no stack traces reach the browser.
// `fieldErrors` maps a form field name to the message shown under that field.

export type FieldErrors = Partial<Record<string, string>>;

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string; fieldErrors?: FieldErrors };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: string,
  message: string,
  fieldErrors?: FieldErrors,
): ActionResult<T> {
  return fieldErrors ? { ok: false, code, message, fieldErrors } : { ok: false, code, message };
}
