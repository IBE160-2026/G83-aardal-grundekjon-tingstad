- source_spec: `.docs/implementation-artifacts/spec-1-1-runnable-project-skeleton.md`
  summary: Add a CI workflow (GitHub Actions) that runs lint, format check, typecheck, Vitest and Playwright on every pull request.
  evidence: `.github/` does not exist; checks run only by hand, so nothing enforces "ESLint + Prettier pass before every PR" (epic context) or gives PR evidence for the process criteria. Not part of Story 1.1's acceptance criteria.

- source_spec: `.docs/implementation-artifacts/spec-1-2-register-log-in-and-log-out.md`
  summary: Limit login and registration attempts (for example 5 failures per email and IP in 15 minutes, «For mange forsøk. Prøv igjen om litt.») before the app is published in Story 1.6.
  evidence: Better Auth runs its rate limiter only in its HTTP router (`onRequestRateLimit` in `better-auth/dist/api/index.mjs`); Story 1.2 calls `auth.api.*` from Server Actions, so password guessing is unlimited. Deferred by Knut on 2026-11-25 as a documented tradeoff.

- source_spec: `.docs/implementation-artifacts/spec-1-2-register-log-in-and-log-out.md`
  summary: Check that Better Auth gets a correct base URL on Vercel (set `BETTER_AUTH_URL`, or confirm it is inferred) in Story 1.6.
  evidence: Unverified (maybe-false). `createAuth()` passes `process.env.BETTER_AUTH_URL` unchecked; it is set locally, in compose and in Playwright, but nothing covers the published app. Settle by registering and logging in on the published URL.

- source_spec: `.docs/implementation-artifacts/spec-1-4-try-the-demo.md`
  summary: Limit how many demo users can be created (per IP, or a global cap) before the app is published in Story 1.6, alongside the login rate limit.
  evidence: `startDemoAction` creates a user, account, session and profile row on every POST; the double-click guard is client-only, so a script (or a no-JS double press) can grow the `user` table without bound for 24 h at a time. Same root cause as the deferred login limit: `auth.api.*` from Server Actions bypasses Better Auth's HTTP rate limiter.

- source_spec: `.docs/implementation-artifacts/spec-1-5-delete-my-account.md`
  summary: Add a test that a failed account deletion shows its error message (`role="alert"`) inside the dialog and keeps the dialog open.
  evidence: `tests/integration/account-deletion.test.ts` checks only the action's `{ ok: false }` result; no e2e or component test renders `DeleteAccountButton` on the failure path, because the repo has no component-test harness and a DB failure cannot be injected into the production build. Removing the `{error ? ...}` block would ship green.
