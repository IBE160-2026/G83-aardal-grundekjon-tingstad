---
title: 'Story 1.2: Register, log in and log out'
type: 'feature'
created: '2026-11-25'
status: 'done'
baseline_commit: '899bef62bd2253e23886fdaf7e205a2953321525'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/.docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The skeleton has no users: anyone sees the start page, nothing is personal, and every later story needs a signed-in user id, an app shell and a Profil tab.

**Approach:** Add Better Auth 1.7 (Drizzle adapter, `nextCookies()` last) with its tables as a drizzle-kit migration, a `shared/auth` helper that returns the user id or rejects, bokmål login and registration screens, the four-tab app shell with placeholders, and «Logg ut» on Profil — per Story 1.2 ACs in `epics.md`.

## Boundaries & Constraints

**Always:** All auth goes through Better Auth server APIs called from Server Actions in `features/account`; Zod validates every action input on the server. Server code gets the user only via `shared/auth`. Actions return `ActionResult`; Norwegian messages, no stack traces. `BETTER_AUTH_SECRET` is required: the app fails fast with a clear message when it is missing. UI uses DESIGN.md tokens and the `input-field`/`button-*`/`tab-bar` specs; WCAG 2.2 AA; `<form noValidate>` so our messages, not browser bubbles, show.

**Decision (2026-11-25, Knut):** `docker-compose.yml` gives `BETTER_AUTH_SECRET` a fixed, clearly named local-only default (`local-dev-only-not-a-secret`), overridable from `.env`, so `docker compose up` works with no extra step; the lecturer's rule is that the examiner only puts one API key in `.env`. The published app uses its own secret set in Vercel. Spec kept whole (~2400 tokens) because auth, shell and logout are one user goal.

**Decision (2026-11-25, Knut, after review):** v1 login and registration have no attempt limit, because Better Auth's rate limiter runs only on its HTTP endpoints and this story calls it from Server Actions. This is a conscious, documented tradeoff: recorded in `deferred-work.md` and in the criterion-3 security row of `.docs/sensorveiledning-sporbarhet.md`, to be resolved before publishing (Story 1.6).

**Never:** No «Prøv demo», demo flag or `profile` table (1.4), no theme picker (1.3), no «Slett konto» (1.5), no «Glemt passord?» / `shared/mail` (v2). No name field (popup works without a name). No Better Auth CLI migrate. No hand-rolled hashing or sessions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Register OK | ` Mari@Eksempel.no `, `hemmelig1` | user `mari@eksempel.no` created, session cookie set, redirect `/uke` | N/A |
| Invalid email | `mari@eksempel` | nothing created | «Skriv en gyldig e-postadresse.» under E-post |
| Short / long password | 7 chars / 129 chars | nothing created | «Passordet er for kort. Bruk minst 8 tegn.» / «Passordet er for langt. Bruk høyst 128 tegn.» under Passord |
| Email in use | existing email (any case) | nothing created | «Det finnes allerede en konto med denne e-postadressen.» under E-post |
| Double / concurrent submit | same valid input twice at once | exactly one user row | second gets email-in-use or is blocked by pending button |
| Wrong login | unknown email, or wrong password | no session | one form-level «Feil e-post eller passord.» (`role="alert"`), same for both |
| Logged out | GET `/uke`, `/profil` etc. | redirect `/logg-inn` | N/A |
| Logged in | GET `/`, `/logg-inn`, `/registrer` | redirect `/uke` | N/A |
| Action without session | wrapped action, no cookie | `{ ok: false, code: "unauthorized" }`, handler not run | «Du må logge inn på nytt.» |

</frozen-after-approval>

## Code Map

- `src/shared/db/client.ts` -- harden (open issue from 1.1): `import "server-only"`, cache on `globalThis` in dev so HMR does not open new pools, guard `new URL` parse
- `src/shared/db/schema/index.ts` -- empty; add Better Auth tables here (re-export from `auth.ts`)
- `src/shared/lib/result.ts` -- `ActionResult`/`ok`/`fail`; extend the fail variant with optional `fieldErrors: Partial<Record<string,string>>`
- `src/features/account/api.ts` -- empty; becomes the slice's public surface (actions + form components)
- `src/app/page.tsx`, `layout.tsx` -- start page becomes a redirect; layout keeps `lang="nb"`
- `tests/e2e/smoke.spec.ts` -- uses `/` and its heading; move to `/logg-inn`
- `eslint.config.mjs` -- boundaries: app → slices only via `api.ts`; shared → shared ok
- `playwright.config.ts` -- `webServer` runs `next start` on 3100 (production): needs `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL` env
- `.github/workflows/ci.yml` -- `checks` and `e2e` jobs have no DB; add a `postgres:18` service + `npm run db:migrate`
- `docker-compose.yml` -- `BETTER_AUTH_SECRET` defaults to empty today
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, `.../02-guides/authentication.md` -- Next 16 conventions (`proxy.ts`, not `middleware.ts`)
- UX: `EXPERIENCE.md` l.32, 141, 148; `DESIGN.md` l.400–420; `mockups/key-innlogging.html` (login and registration as two screens, «Har du allerede en konto? Logg inn»), `mockups/key-profil.html` («Logg ut» placement)

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- add `better-auth@1.7.28`, `server-only`; `vitest.config.ts` alias `server-only` → empty stub
- [x] `src/shared/db/schema/auth.ts` + `index.ts` -- `user`, `session`, `account`, `verification` per Better Auth's Drizzle schema; snake_case columns, camelCase keys; `ON DELETE CASCADE` from session/account to user
- [x] `src/shared/db/migrations/0001_*` -- `npm run db:generate`, committed
- [x] `src/shared/db/client.ts` -- hardening from Code Map
- [x] `src/shared/auth/server.ts` -- `auth = betterAuth({ database: drizzleAdapter(getDb(), { provider: "pg", schema }), emailAndPassword: { enabled, minPasswordLength: 8, maxPasswordLength: 128, autoSignIn: true }, plugins: [nextCookies()] })`; throw if `BETTER_AUTH_SECRET` unset; `server-only`
- [x] `src/shared/auth/session.ts` -- `getUserId(): Promise<string | null>`, `requireUserId()` (redirects to `/logg-inn`), `withUser(handler)` → action that returns `fail("unauthorized", …)` without a session
- [x] `src/proxy.ts` -- optimistic cookie check (`getSessionCookie`): app routes without cookie → `/logg-inn`; real check stays in pages
- [x] `src/features/account/{schemas.ts,actions.ts,components/*}` + `api.ts` -- Zod schemas; `registerAction`, `loginAction`, `logoutAction` (map Better Auth errors to the matrix messages); client forms with `useActionState`, button disabled while pending, values kept on error
- [x] `src/shared/ui/{input-field,button,tab-bar}.tsx` -- `input-field` (label above, `aria-invalid`, `aria-describedby` → error with icon); `button-primary`/`secondary`/`text`; `tab-bar` (client, `usePathname`, `aria-current="page"`, 3 px top stroke, 24 px line icons)
- [x] `src/app/(auth)/{logg-inn,registrer}/page.tsx` -- screens per mock; redirect to `/uke` if signed in
- [x] `src/app/(app)/layout.tsx` + `{uke,coach,historikk,profil}/page.tsx` -- `requireUserId()`, tab bar, bokmål placeholders, «Logg ut» on Profil; `src/app/page.tsx` redirects
- [x] `tests/integration/auth.test.ts` -- against Postgres (`describe.skipIf(!DATABASE_URL)`), `next/headers` mocked: register normalises email; invalid inputs create nothing; concurrent double register → one row; wrong login is the same message for both cases; `withUser` without session → `{ ok: false, code: "unauthorized" }`, with a session → handler gets the id
- [x] `tests/e2e/auth.spec.ts` + `smoke.spec.ts` -- register → Uke → Profil → Logg ut → back button shows login, not data → log in → Uke; logged-out `/profil` → login; 320 px + 200 % text without sideways scroll on login, registration and Profil; registration by keyboard only
- [x] `playwright.config.ts`, `.github/workflows/ci.yml`, `docker-compose.yml`, `.env.example` -- env for auth and DB in every runner; compose default secret per the Decision
- [x] `README.md`, `.docs/sensorveiledning-sporbarhet.md` -- note that tests now need the compose DB; update traceability rows for login/auth

**Acceptance Criteria:**
- Given a logged-in user, when the shell renders, then Uke, Coach, Historikk, Profil show with icons and text, the active tab has `aria-current` and the 3 px marker, and the first three show a short placeholder.
- Given Profil, when I press «Logg ut», then the session ends, I land on `/logg-inn`, and Back does not show app content.
- Given the repo, when I run `lint`, `typecheck`, `format:check`, `test` and `test:e2e` (compose DB up) and `docker compose up`, then all pass and register/login works on `localhost:3000`.

## Implementation Notes

- `shared/auth/server.ts` exports `getAuth()` (lazy, cached on `globalThis`) instead of a module-level `auth` constant, so `next build` (Docker build stage, no env) never creates Better Auth or the DB pool. `getUserId()` awaits `headers()` before `getAuth()` for the same reason: the first Docker build failed while prerendering `/profil` until this order was fixed.
- Forms dispatch from `onSubmit` (inside `startTransition`) instead of relying on `<form action>` alone, so React does not reset the fields after an error and a second submit while pending is ignored. The submit button uses `aria-disabled` (keeps focus) rather than `disabled`.
- Concurrent double registration: the losing request fails on the `user_email_unique` constraint as `FAILED_TO_CREATE_USER`; `registerAction` re-checks the email and answers «email in use».
- Login with a password longer than 128 characters is answered with the general wrong-login message without calling Better Auth.
- Logout calls `revalidatePath("/", "layout")` before redirecting, so Back after logout does not show cached app content (verified in e2e).
- Vitest inlines `better-auth` (`server.deps.inline`) so the mocked `next/headers` reaches `nextCookies()`; Vitest and Playwright load `.env` when present. Playwright uses a test-only secret when `BETTER_AUTH_SECRET` is unset.
- Tab labels may wrap inside a word at 320 px + 200 % text (`overflow-wrap: anywhere`, `hyphens: auto`) to avoid sideways scroll.
- Better Auth logs a warning that the compose default secret is short/low-entropy; expected per the Decision (local only).

## Spec Change Log

## Review Triage Log

Pass 1 (2026-11-25): Blind Hunter (BH), Edge Case Hunter (EC), Verification Gap (VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| BH1 / EC3 | No limit on login/registration attempts | medium | `better-auth/dist/api/index.mjs` runs `onRequestRateLimit` only in the HTTP router's `onRequest`; `auth.api.*` from Server Actions skips it (default rule: sign-in/up 3 per 10 s) | intent_gap → resolved by human: defer (Decision) |
| BH2 / EC11 / VG-other | Password limits defined twice (`schemas.ts`, `shared/auth/server.ts`) | low | Two constant pairs tied only by a comment; drift makes Zod and Better Auth disagree | patch |
| BH3 | Route paths duplicated | low | `LOGIN_PATH` in both `session.ts` and `actions.ts`; matcher vs `TABS` drift is harmless because pages still call `requireUserId` | patch (LOGIN_PATH only) |
| BH4 | Session looked up twice per page (layout + page) | low | `getUserId` not wrapped in React `cache()`; two `getSession` DB reads on every app page | patch |
| BH5 / EC10 | `BETTER_AUTH_URL` not validated | maybe-false | Set in `.env.example`, compose and Playwright; unclear for Vercel without it — settle in Story 1.6 | defer |
| BH6 | `schemas.ts` has no unit tests without DB | low | Covered by integration tests, which always run in CI | reject |
| BH7 / VG2 | `loginAction` invalid input (empty password, bad email) untested | medium | No test sends invalid login input; dropping `.min(1)` stays green | patch |
| BH7b | Other untested branches (unexpected path, logout without session, non-string fields) | low | Rare paths; fix is new test machinery | reject |
| BH8 / EC5 / EC6 / EC7 / EC8 | DB-down errors reach Next's default error page (logout, `withUser`, login layout) | low | Only when Postgres is down; fix adds error boundaries/branches | reject |
| BH9 | e2e tests leave `@flexpt.test` users | low | Local DB growth only; unique emails per run | reject |
| BH10 | CI Postgres block duplicated | low | Maintenance only | reject |
| BH11 | Diff lacks lock file and migration journal | false | Excluded from the review diff on purpose; both committed in 79ea40f | reject |
| BH12 | Sprint status, criterion 5 row and session log not updated | false | Sprint status moves to `review` in step 5; session log is written at session end | reject |
| BH13 | Client pending guard untested; `checkFields` message never shown | low | Server race is covered; `message` is still the ActionResult contract | reject |
| BH14 | Generated SQL lacks trailing newline | low | drizzle-kit output; cosmetic | reject |
| VG1 | Missing-secret fail-fast has no test | medium | No test unsets `BETTER_AUTH_SECRET`; removing the guard stays green | patch |
| VG3 | Integration suite can skip silently in CI | medium | `describe.skipIf(!DATABASE_URL)` with no CI guard | patch |
| VG4 | Focus on the form-level alert untested | low | Wrong-login e2e asserts text, not focus; one-line assertion | patch |
| EC1 / EC13 | Empty `BETTER_AUTH_SECRET` from a copied `.env` breaks local integration tests | medium | `loadEnvFile` sets `""`; `??=` keeps it; `createAuth` throws | patch |
| EC2 | Half-created user answered as "email in use" | low | Needs a DB failure between inserts; fix adds branching | reject |
| EC4 | Non-credential 4xx shown as wrong login | false | No other 4xx is reachable: no limiter on `auth.api`, no email verification | reject |
| EC9 | Short or whitespace secret accepted | low | Short local default is the human's Decision | reject |
| EC12 | Concurrent-register test may flake | false | Both loser paths give `email_in_use`; test passed in every run | reject |

## Design Notes

No `/api/auth/[...all]` route: every auth call goes through our Server Actions, so Zod is the only door and Better Auth's HTTP endpoints are not exposed. If Story 1.4 or a client SDK needs them, mount the handler then. Better Auth requires `name` on sign-up; pass `""` (no name is collected; UX-DR21 already handles a missing name). Integration tests skip locally without `DATABASE_URL` but CI always sets it, so they always run there.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm run format:check` -- clean
- `docker compose up -d db && npm run db:migrate && npm test` -- integration tests run (not skipped) and pass
- `npm run test:e2e` -- auth and smoke specs pass
- `docker compose up -d --build` then register at `http://localhost:3000/registrer` -- lands on Uke
- `git status --short` -- no `.env`, build output or test reports
