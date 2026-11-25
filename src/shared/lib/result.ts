// Result type for server actions (architecture spine, Consistency Conventions).
// `message` is shown to the user and is in Norwegian bokmål; no stack traces reach the browser.

export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: string; message: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(code: string, message: string): ActionResult<T> {
  return { ok: false, code, message };
}
