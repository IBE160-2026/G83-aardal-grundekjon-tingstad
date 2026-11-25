- source_spec: `.docs/implementation-artifacts/spec-1-1-runnable-project-skeleton.md`
  summary: Add a CI workflow (GitHub Actions) that runs lint, format check, typecheck, Vitest and Playwright on every pull request.
  evidence: `.github/` does not exist; checks run only by hand, so nothing enforces "ESLint + Prettier pass before every PR" (epic context) or gives PR evidence for the process criteria. Not part of Story 1.1's acceptance criteria.

- source_spec: `.docs/implementation-artifacts/spec-1-2-register-log-in-and-log-out.md`
  summary: Limit login and registration attempts (for example 5 failures per email and IP in 15 minutes, «For mange forsøk. Prøv igjen om litt.») before the app is published in Story 1.6.
  evidence: Better Auth runs its rate limiter only in its HTTP router (`onRequestRateLimit` in `better-auth/dist/api/index.mjs`); Story 1.2 calls `auth.api.*` from Server Actions, so password guessing is unlimited. Deferred by Knut on 2026-11-25 as a documented tradeoff.

- source_spec: `.docs/implementation-artifacts/spec-1-2-register-log-in-and-log-out.md`
  summary: Check that Better Auth gets a correct base URL on Vercel (set `BETTER_AUTH_URL`, or confirm it is inferred) in Story 1.6.
  evidence: Unverified (maybe-false). `createAuth()` passes `process.env.BETTER_AUTH_URL` unchecked; it is set locally, in compose and in Playwright, but nothing covers the published app. Settle by registering and logging in on the published URL.
