# Epic 1 Context: Sign in, try the demo and own your account

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Lay the foundation every later epic builds on. A visitor can register, log in and out, try the app with one click through a seeded demo user (no API key needed), choose light, dark or system theme, and delete their account permanently. The app runs locally with one command (`docker compose up`), is published from `main`, and has its folder structure, slice boundaries, design tokens, app shell and test tooling in place so Epics 2–4 (plan, logging, coach) can add screens without revisiting the base.

## Stories

- Story 1.1: Runnable project skeleton
- Story 1.2: Register, log in and log out
- Story 1.3: Choose light, dark or system theme
- Story 1.4: Try the demo
- Story 1.5: Delete my account
- Story 1.6: Publish the app

(Password reset by email is deferred to version 2; do not build `shared/mail` or a «Glemt passord?» link.)

## Requirements & Constraints

- Register with email + password (min 8 chars), log in, log out from Profil. Wrong login shows one general message that does not reveal which field was wrong. Double-submitting registration creates one account.
- Passwords hashed; secrets only in git-ignored `.env`; `.env.example` lists every variable with no real values (database URLs, Better Auth secret/URL, `COACH_MODE`, `ANTHROPIC_API_KEY`, coach model id, daily coach limit). No secrets or build output in the repo or its history.
- A user can never read or change another user's data. Logged-out access to app routes redirects to login; server actions return `{ ok: false }`.
- Demo mode works with no API key: «Prøv demo» on the login screen, pick profile A–D, fresh demo user per visit, «Demo» badge whenever a demo user is signed in. Demo users cannot change email/password. Demo users older than 24 h are deleted when the next one is created.
- Account deletion: after confirmation, profile, plans, logs and messages are deleted permanently; the user cannot log in afterwards. Repeated deletion requests have no extra effect.
- Theme: Lys / Mørk / Følg system, applied immediately, no flash on reload, survives logout on the same device.
- Runs locally by following the README (prerequisites with versions, start command, test commands, where planning docs are, and the `_bmad/custom/config.user.toml` override pointing to `.docs/`). Published URL documented, with a note that free Supabase pauses after a week unused.
- WCAG 2.2 AA in both themes: labelled fields, full keyboard operation in reading order, visible focus, works at 320 px and 200 % text without sideways scroll, respects reduced motion. Axe checks in Playwright on login and Profil, light and dark.
- All UI text in Norwegian bokmål (`<html lang="nb">`), du-form, encouraging tone; neutral tone for errors.
- Server-side validation of every input; repeated actions are idempotent.

## Technical Decisions

- **Stack:** Node 24, TypeScript 6.0 (spine changed from 7.0 on 2026-11-25), Next.js 16.4 (App Router, standalone output for Docker), React 19.3, PostgreSQL 18, postgres.js 4.1, Drizzle ORM ~0.45 / drizzle-kit 0.31, Better Auth 1.7, Zod 4.6, Tailwind 4.3, Vitest 5.1, Playwright 1.65, ESLint 10.15, Prettier 3.10. No starter template.
- **Structure (vertical slices):** `src/app` (routes, no business logic), `src/features/{account,onboarding,plan,logging,coach,profile}` each exposing only `api.ts`, `src/shared/{engine,db,auth,coach-provider,ui,lib}`, `src/seed`, `data/{exercises,coach-demo}`, `tests/{engine,coach,integration,e2e}`. An ESLint import rule enforces boundaries and must be proven by a lint test/fixture.
- **Allowed slice edges (via `api.ts` only):** app → slices; seed → slices; coach → plan, profile (read), account (usage); onboarding → profile, plan; profile → plan; logging → plan; plan → logging (read), profile (read). Slices → shared; shared → engine; engine and shared → lib. `engine` and `lib` are pure (no clock, DB or network).
- **`api.ts` functions** take the user id as first argument and enforce their own rules.
- **Writes:** only via Server Actions / Route Handlers in the owning slice; Zod validation on every write; user id only from the `shared/auth` helper (returns id or rejects); every user-owned query filters on user id. Server actions return `{ ok: true, data } | { ok: false, code, message }` (type lives in `src/shared/lib`), Norwegian message, no stack traces to the browser.
- **Ownership:** account owns Better Auth tables and the coach usage counter; profile owns the `profile` table (created in Story 1.4 through `profile.api`). Only the owner writes.
- **Database:** schema defined once in `src/shared/db/schema` with Drizzle, including Better Auth tables; every change is a committed drizzle-kit migration. Production uses Supabase transaction pooler with prepared statements off; migrations run against a separate direct URL.
- **Auth:** Better Auth with the Drizzle adapter, `nextCookies()` plugin last. Demo sign-in goes through Better Auth (no bypass). Users carry a demo flag.
- **Demo seeding:** `src/seed` builds demo users by calling slices' `api.ts` with generated ids and dates relative to today; the same functions produce e2e fixtures. Epic 1 only promises a demo user with a profile; later epics extend it.
- **Time helper (`src/shared/lib`):** UTC moment → Europe/Oslo calendar date, Monday `week_start`, program week number (counted from 1). Tests cover Sunday→Monday boundary, DST change, mid-week program start. Dates stored `YYYY-MM-DD`, moments UTC.
- **Theme:** choice stored in a cookie read on the server, which sets `data-theme="light|dark"` on `<html>` (no attribute for system). Tailwind `dark` variant keyed on that attribute with the system media query as fallback. Never stored in the DB.
- **Design tokens:** DESIGN.md colours (light/dark), typography, spacing and radius defined once as Tailwind theme tokens; components use tokens only; shared components in `src/shared/ui`.
- **Deletion:** all user-owned rows reference the user with `ON DELETE CASCADE`; an integration test asserts nothing remains, and every later story adding a user-owned table extends it.
- **Environments:** config only from env vars. Local: `docker compose up` → `postgres:18` (volume, healthcheck) → one-off migrate service → app on `http://localhost:3000`, `COACH_MODE=demo` default. Dev: `npm run dev` + compose Postgres + `npm run db:migrate`. Published: Vercel from `main` only; previews have no DB.
- **Scripts:** `lint`, `format:check`, `test` (Vitest), `test:e2e` (Playwright), `db:migrate` must all run and pass.
- **Conventions:** code/identifiers/commits in English; kebab-case files, PascalCase components/types, snake_case tables/columns; UUIDs for app tables (user ids are Better Auth string ids); Next.js 16 request APIs (`cookies()`, `headers()`) awaited; ESLint + Prettier pass before every PR.

## UX & Interaction Patterns

- **Tokens:** semantic colour roles (background, surface, text, text-muted, primary, on-primary, accent, success, warning, error, border) with light and dark values; components never use hex. `border` is decorative only; interactive outlines use `text-muted` or `primary`. Typography in `rem`, system font stack, weights 400–600, min 0.9375 rem, no uppercase/italic as style. Spacing 4–32 px, screen margin 20 px, tap targets 44 / 56 / 68 px; radius sm 12, md 24, lg 28, xl 34, full. Single column, max 480 px centred, works to 320 px.
- **Elevation and focus:** flat, no shadows on cards; focus ring 3 px `primary`, 2 px offset on every focusable element; popup scrim = background at 60 %.
- **App shell:** bottom tab bar Uke / Coach / Historikk / Profil (24 px line icons + text), `aria-current` and a 3 px top stroke on the active tab; bottom padding so nothing is covered at 200 % text. Uke, Coach and Historikk show short placeholders until later epics.
- **Components used in this epic:** `button-primary` (max one per screen, full width, 68 px), `button-secondary`, `button-text`, `button-destructive` (outlined red, always behind a confirmation dialog); `input-field` (label always above, error = 2 px error border + icon + message linked to the field); `effort-card-selected` style reused for the theme picker (filled primary with ✓, radio group semantics); `demo-badge` «Demo» pill in the header; modal pattern that traps focus, focuses the first element on open, returns focus on close, never closes by itself.
- **Login screen:** «Logg inn», «Registrer ny bruker», «Prøv demo» (then pick profile A–D with a one-line bokmål description). No «Glemt passord?». Registration errors in plain text under the field.
- **Profil:** «Utseende» Lys / Mørk / Følg system (switches immediately, no transition under reduced motion), «Logg ut», «Slett konto» → dialog «Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid.» with «Avbryt» / «Slett» (Escape cancels).
- **Accessibility floor:** everything keyboard-operable with focus order = reading order, colour never the only signal, tap-only actions, no time limits, primary action stays visible with the keyboard open.

## Cross-Story Dependencies

- Story 1.1 is the base for everything (structure, tokens, scripts, time helper, result type, Docker); all other stories depend on it.
- Story 1.2 provides Better Auth, `shared/auth`, the app shell and the Profil tab that 1.3, 1.4 and 1.5 build on.
- Story 1.4 creates the `profile` table and `profile.api` (owned by `features/profile`), which Epic 2 onboarding and profile editing extend; Epics 2–4 also extend the demo seed with plans, logs and coach scenarios.
- Story 1.5's cascade-deletion integration test must be extended by every later story that adds a user-owned table.
- Story 1.6 depends on 1.2 and 1.4 working (register/login/demo are verified on the published URL).
- The time helper from 1.1 is used by the plan engine and week creation in Epic 2; the demo-user flag drives the Demo coach provider and per-user limits in Epic 4.
