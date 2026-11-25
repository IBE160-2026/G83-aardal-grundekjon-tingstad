---
title: 'Story 1.1: Runnable project skeleton'
type: 'chore'
created: '2026-11-25'
status: 'done'
baseline_commit: '8847be6e02cc67f42bfb8b874bc416ac61f8fa3a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/.docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has planning docs and an exercise data set but no application. Every later story and the examiner's one-command start need a shared, runnable base with the agreed stack, slice structure, tooling and design tokens.

**Approach:** Hand-build (no starter template) a Next.js 16.4 App Router app with the Structural Seed folders, ESLint slice-boundary rule, Prettier, Vitest, Playwright, Drizzle with a first migration, Tailwind 4 tokens from DESIGN.md, the Europe/Oslo date helper, the action result type, Docker Compose (postgres:18 → migrate → app) and an updated README — all per Story 1.1 ACs in `epics.md`.

## Boundaries & Constraints

**Decision (2026-11-25, Knut):** TypeScript **6.0.3**, not 7.0 as in the spine — `typescript-eslint` 8.74 (used by `eslint-config-next`) supports only TS `<6.1`. Update the spine's version table to 6.0 with a dated note and log the correction in the session log.

**Always:** Versions from the architecture spine (Node 24, Next 16.4, React 19.3, postgres.js 4.1, Drizzle ~0.45 / drizzle-kit 0.31, Zod 4.6, Tailwind 4.3, Vitest 5.1, Playwright 1.65, ESLint 10.15, Prettier 3.10), pinned in `package.json` with a committed `package-lock.json`. Code, identifiers and commits in English; UI text in bokmål; README stays in Norwegian. Config only from env vars. `engine` and `lib` stay pure (no clock, DB, network — the date helper takes the moment as an argument).

**Never:** No Better Auth tables, login UI, app shell/tab bar, theme picker or `shared/mail` (Stories 1.2–1.5, v2). No real secrets. Do not touch `data/exercises/` or `scripts/select-exercises.mjs` except to make them pass lint/format.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ordinary day | `2026-11-25T10:00Z`, program start `2026-11-23` | date `2026-11-25`, week_start `2026-11-23`, week 1 | N/A |
| Sun→Mon in Oslo | `2026-11-29T23:30Z` (Mon 00:30 Oslo) | date `2026-11-30`, week_start `2026-11-30` | N/A |
| DST spring/autumn | `2026-03-29T00:30Z`, `2026-10-25T00:30Z` | correct Oslo date across the shift; week_start Monday before | N/A |
| Mid-week program start | start Thu `2026-11-26`, moment Mon `2026-11-30` | week 2 (weeks counted from start's week_start) | N/A |
| Moment before program start | moment earlier than start's week_start | — | throws `RangeError` |
| Theme attribute | `data-theme` absent + OS dark / `"light"` + OS dark / `"dark"` | dark / light / dark tokens | N/A |

</frozen-after-approval>

## Code Map

- `data/exercises/exercises.json`, `scripts/select-exercises.mjs` -- existing Story 2.1 output; keep; `scripts/` stays outside slice rules
- `.gitignore` -- already covers `node_modules`, `.next`, `.env*` (keeps `.env.example`), test output; extend only if needed
- `README.md` -- Norwegian; keep the members and API-key sections, add the new sections around them
- `.docs/planning-artifacts/architecture/architecture-G83-aardal-grundekjon-tingstad-2026-11-16/ARCHITECTURE-SPINE.md` -- Structural Seed (l.225–285), slice edges (AD-1/epic context), AD-13/14/15/17
- `.docs/sensorveiledning-sporbarhet.md` -- update the folder-structure, linter and test rows (CLAUDE.md)

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json`, `tsconfig.json` (`@/*` → `src/*`), `next.config.ts` (`output: 'standalone'`), `postcss.config.mjs` -- project setup; scripts `dev`, `build`, `start`, `lint`, `format`, `format:check`, `test`, `test:e2e`, `db:generate`, `db:migrate`; `engines.node >=24`
- [x] `src/{app,features/*,shared/*,seed}`, `data/coach-demo`, `tests/{engine,coach,integration,e2e}` -- Structural Seed; each `features/<slice>/api.ts` is an empty, commented module; `.gitkeep` only where a folder would otherwise be empty
- [x] `eslint.config.mjs` -- `eslint-config-next` + `eslint-plugin-boundaries` encoding the allowed edges (only via `api.ts`; `engine`/`lib` may not import slices, db or network modules)
- [x] `tests/lint/boundaries.test.ts` -- run ESLint programmatically on code placed at slice paths; assert a disallowed edge (e.g. `account` → `profile`) and a reach into another slice's internals both fail, and an allowed edge (`onboarding` → `profile/api`) passes
- [x] `.prettierrc.json`, `.prettierignore` -- formatting; ignore `.docs`, `.logs`, `data`, generated migrations
- [x] `src/shared/lib/dates.ts` + `tests/engine/dates.test.ts` -- `toOsloDate`, `weekStart`, `programWeek` using `Intl` with `Europe/Oslo`; tests for every I/O matrix row
- [x] `src/shared/lib/result.ts` -- `ActionResult<T> = { ok: true; data: T } | { ok: false; code: string; message: string }` with `ok()`/`fail()` helpers
- [x] `src/shared/db/{client.ts,schema/index.ts}`, `drizzle.config.ts`, `src/shared/db/migrations/0000_init.sql` (+ journal) -- postgres.js client (`prepare: false` when pooled), empty schema, a custom no-op first migration so `db:migrate` has something to apply
- [x] `src/app/globals.css` -- Tailwind 4 `@theme` tokens from DESIGN.md as CSS variables: light on `:root`, dark on `[data-theme="dark"]` and on `@media (prefers-color-scheme: dark) :root:not([data-theme])`; `@custom-variant dark` on the same selectors; typography, spacing, radius; global `:focus-visible` 3 px `primary` outline, 2 px offset; no card shadows
- [x] `src/app/layout.tsx`, `src/app/page.tsx` -- `<html lang="nb">`, start page with a bokmål heading and one line about the app, using the tokens only
- [x] `tests/e2e/smoke.spec.ts`, `playwright.config.ts`, `vitest.config.ts` -- Playwright smoke test (start page loads, `lang="nb"`, heading visible) against a `webServer` built with `next build && next start`
- [x] `Dockerfile`, `.dockerignore`, `docker-compose.yml` -- `node:24-alpine` multi-stage; `db` (`postgres:18`, volume at `/var/lib/postgresql`, `pg_isready` healthcheck), `migrate` (one-off, `depends_on: db healthy`), `app` (`depends_on: migrate completed_successfully`, port 3000, `COACH_MODE=demo` default)
- [x] `.env.example` -- `DATABASE_URL`, `DATABASE_DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `COACH_MODE=demo`, `ANTHROPIC_API_KEY`, `COACH_MODEL_ID`, `COACH_DAILY_LIMIT`, no real values
- [x] `README.md` -- what the app is, prerequisites with versions, `docker compose up`, dev mode, test commands, where the planning docs are, the three-line `_bmad/custom/config.user.toml` override
- [x] `ARCHITECTURE-SPINE.md` (l.209) -- TypeScript 7.0 → 6.0 with a dated note on why
- [x] `.docs/sensorveiledning-sporbarhet.md` -- update status for structure, linter/formatter and tests

**Acceptance Criteria:**
- Given a clean clone with Docker, when I run `docker compose up`, then postgres becomes healthy, migrate exits 0, and `http://localhost:3000` serves the bokmål start page.
- Given the repo, when I run `npm run lint`, `npm run format:check`, `npm test`, `npm run test:e2e` and (with compose Postgres running) `npm run db:migrate`, then all pass.
- Given `git status` after build, test and compose runs, then no build output, test reports or `.env` appear as untracked files.

## Spec Change Log

## Review Triage Log

Pass 1 (2026-11-25): Blind Hunter (BH), Edge Case Hunter (EC), Verification Gap (VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| BH1 | sprint-status says in-progress while spec is in-review | false | Build step 5 syncs sprint-status to `review`; mid-workflow mismatch is expected | reject |
| BH2 | Traceability rows for crit. 4/5/6 not updated though README, tokens, `.env.example`, compose now exist | medium | `sensorveiledning-sporbarhet.md` still ⬜ for README prerequisites/tests/folders, visual consistency; CLAUDE.md requires updates | patch |
| BH3 / EC2 / EC10 | engine/lib purity rule lets bare Node builtins through | medium | Probe: `import fs from "fs"; import http from "http"` in `src/shared/engine` → 0 lint messages; spec forbids network modules | patch |
| BH3b / EC3 | No lint guard on clock reads in engine/lib | medium | Probe: `Date.now()` in engine → 0 messages; spec Always: engine/lib pure, no clock | patch |
| EC4 | Purity rule glob skips `.tsx` in engine/lib | low | `files` is `**/*.ts` only; direct glob fix | patch |
| BH4 | `@/` alias imports may bypass boundaries | false | Probe: `@/features/profile/zz-internal` from onboarding and `@/features/profile/api` from account both → `boundaries/dependencies` | reject |
| BH5 / VG2 / VG3 | Boundary test covers 1 allowed + 2 rejected edges only; no lib purity, reverse edges, app/seed or shared→slice cases | medium | `tests/lint/boundaries.test.ts` has 4 cases; dropping an edge from `SLICE_EDGES` keeps all green | patch |
| BH6 | Dark tokens duplicated in two CSS blocks, drift untested | low | Real but unlikely in everyday use; fix needs extra test machinery | reject |
| BH7 / EC5 | `client.ts`: port heuristic, `new URL` on unencoded password, dev HMR pool, no `server-only`, no test | low | No caller yet (only definition); postgres.js would also misparse an unencoded URL; revisit when Story 1.2 first uses `getDb` | reject |
| BH8 | No `typecheck` script; type errors pass lint + unit tests | low | Vitest strips types, ESLint not type-checking; one-line script | patch |
| BH9 / VG-other | No CI workflow | medium | `.github/` absent before this story — pre-existing, not in Story 1.1 | defer |
| BH10 | No `.gitattributes`, `endOfLine: auto` | low | Git autocrlf normalises; no observed harm | reject |
| BH11 / EC7 | Host ports 5432/3000 fixed; local Postgres blocks `docker compose up` | medium | Compose publishes `"5432:5432"`; one-command start fails on such a machine with no documented workaround | patch |
| BH12 | Docker app stage lacks `public/`, data files, healthcheck | low | No `public/` or runtime data reads exist yet; `COPY public` would fail now | reject |
| BH13 | Date-helper test in `tests/engine` though code is in `lib` | low | Placement chosen in spec; cosmetic | reject |
| BH14 / EC9 | `toOsloDate` `?? ""` can return a malformed date | low | `en-CA` formatter always yields year/month/day for a valid Date; 5-digit years unreachable | reject |
| VG1 | Docker run path (standalone `server.js`, static assets, migrate) has no automated check | medium | Playwright uses `next start`; removing `COPY .next/static` keeps every check green | patch |
| EC1 | `data-theme` with a value other than light/dark forces light | false | AD-14: server sets only `light`, `dark` or no attribute; no code path writes other values | reject |
| EC6 | `drizzle.config.ts` swallows every `loadEnvFile` error | low | Only on unreadable/odd `.env`; unlikely, fix adds a branch | reject |
| EC8 | Playwright `reuseExistingServer` may hit a stale server on 3100 | low | Needs an unrelated server on 3100; unlikely | reject |

## Design Notes

The first migration is custom and empty (`SELECT 1;`) because Story 1.1 has no tables. Better Auth tables arrive in 1.2 through `drizzle-kit generate`. `programWeek(moment, programStart)` = whole weeks between `weekStart(programStart)` and `weekStart(osloDate(moment))`, plus 1.

## Verification

**Commands:**
- `npm ci && npm run lint && npm run format:check && npm test` -- all green
- `npx playwright install chromium && npm run test:e2e` -- smoke passes
- `docker compose up -d --build && docker compose ps -a` -- db healthy, migrate exited 0, app up; `curl -s localhost:3000 | grep 'lang="nb"'`
- `npm run db:migrate` with `DATABASE_URL` pointing at the compose db -- exits 0
- `git status --short` -- no build artefacts or secrets
