---
title: 'Story 2.3: See this week''s plan'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
baseline_commit: '05dadb9eb70df1381303e124bc26104ba9355806'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The engine (Story 2.2) makes a week, but nothing stores or shows it. Uke is a placeholder, so a user cannot see what to do today or next (FR4, FR5).

**Approach:** The `plan` slice stores a program, plan week, plan version, session slot and version session (AD-7, AD-8) as Drizzle migrations. `plan.api.getCurrentWeek` calls `ensureCurrentWeek`, which creates the program (from today) and the engine's version 1 for the week that contains today, exactly once. Uke shows day rows, the counter, rest-day lines, «Neste økt», the welcome hint and a session page.

## Boundaries & Constraints

**Always:** Every new table has a `user_id` with `ON DELETE CASCADE` from `user`, every query filters on it, and the deletion test from Story 1.5 covers each table. Unique keys: one current program per user (partial unique index on the current flag); one plan week per (program, `week_start`); one version per (plan week, version number); a version session per (version, slot). A version is never edited. `ensureCurrentWeek(userId, now)` is idempotent and race-safe (insert with `ON CONFLICT DO NOTHING` in one transaction), creates only the week that contains today, never fills in skipped weeks, and reads the profile only through `profile.api`. The clock is read only in the page and passed down as `now`. Session names and all UI text are bokmål (du-form): Fullkropp, Overkropp, Underkropp, Push, Pull, Bein; Rolig kortløp, Rask kortløp, Langtur. Rest-day lines come from a small fixed list, one for strength and one for running. Counter: «X av Y økter», X = 0 until Epic 3. The welcome hint closes with a ✕ of at least 44 px and the closing is stored per user in a small `user_hint` table owned by `plan`. Tokens only (no hex), WCAG 2.2 AA in both themes, no sideways scroll at 320 px or 200 % text, no motion with reduced motion.

**Never:** No week browsing, no change marker, no «Ny uke» banner (2.5), no onboarding (2.4), no logging (Epic 3), no new engine rules. A later week of an existing program is not generated here: `ensureCurrentWeek` returns no week and Uke says so (Story 2.5 adds it).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First visit | profile, no program | program created from today, week version 1 stored, Uke shows it | N/A |
| Two first visits at once | same user, parallel | one program, one week, one version | N/A |
| Repeat visit | week exists | nothing created, same slots and ids | N/A |
| Today is a session day | session on today | `day-row-today` with primary border, opens the session | N/A |
| Today is free | no session today | «Neste økt: [dag], [økt]» | none left this week: no line |
| Rest day | day without session | muted, «Hviledag» and the supportive line | N/A |
| No profile | user without profile | short text that the plan comes after the questions | no week created |
| Later week | program started in an earlier week | no week created, short text | N/A |
| Other user | slot id of another user | not found | `notFound()` |
| Demo user | profile A or C | gets its week the same way | N/A |

## Decisions

- **Hint storage (my choice):** a separate `user_hint` table (user id, hint key, dismissed at) instead of a column on `program`, so a new program does not bring the welcome back and later hints can reuse it.
- **Session page:** `/uke/[slotId]`, inside the app shell with the tab bar (Epic 3 may hide it).

</frozen-after-approval>

## Code Map

- `src/features/plan/api.ts` -- empty slice surface; export `getCurrentWeek`, `getSession`, `dismissWelcomeHint` and the Uke components
- `src/features/profile/api.ts` -- `getProfile(userId)`; the only profile access from `plan`
- `src/shared/engine/plan.ts` -- `generateFirstWeek` (input: profile, exercises, programStart, today); `src/shared/engine/exercise.ts` -- library schema; `data/exercises/exercises.json` -- the library, read by the server
- `src/shared/lib/dates.ts` -- `toOsloDate`, `weekStart`, `addDays`, `isoWeekday`
- `src/shared/db/schema/{index,profile,auth}.ts` -- add `plan.ts` with the six tables; migrations in `src/shared/db/migrations` via `npm run db:generate` (needs `DATABASE_URL`)
- `src/app/(app)/uke/page.tsx` -- placeholder to replace; add `loading.tsx` and `[slotId]/page.tsx`
- `src/shared/ui/{button,dialog,choice-card}.tsx` -- component style to follow; add `progress-bar.tsx`, `hint-card.tsx`
- `src/features/account/actions.ts` L1-L30, `src/shared/auth/session.ts` -- `requireUserId`, `withUser` for the hint action
- `src/seed/demo.ts`, `tests/integration/demo.test.ts` -- demo start and test harness (cookie jar, mocks)
- `tests/integration/account-deletion.test.ts` L30-L80 -- extend `USER_OWNED_TABLES` and `signedInUser`; `tests/e2e/demo.spec.ts`, `theme.spec.ts` -- Playwright helpers and axe `scan()`
- UX: `DESIGN.md` L157-L163, L407-L424 (day-row, progress-bar, hint-card), `EXPERIENCE.md` L130-L145, L178, `mockups/key-uke.html`

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/db/schema/plan.ts`, `index.ts`, migration -- `program`, `plan_week`, `plan_version`, `session_slot`, `version_session`, `user_hint` with the keys above and cascades -- AC 1
- [x] `src/features/plan/` -- `ensureCurrentWeek`, `getCurrentWeek` (week, sessions with names, counter, today, next), `getSession`, `dismissWelcomeHint`; pure view helpers (names, next session, rest line) -- AC 2, 4, 5, 7
- [x] `src/shared/ui/progress-bar.tsx`, `hint-card.tsx`, plan components (`day-row`, week view, session view) -- AC 3, 6, 8
- [x] `src/app/(app)/uke/page.tsx`, `loading.tsx`, `[slotId]/page.tsx` -- wire up; static skeleton -- AC 8
- [x] `tests/integration/plan.test.ts` -- creation, idempotency, two parallel visits, mid-week start, no profile, later week, ownership; `account-deletion.test.ts` -- cover the new tables -- AC 1, 2
- [x] `tests/engine/` or integration -- view helpers (next session, rest lines, counter text) -- NFR6
- [x] `tests/e2e/uke.spec.ts` -- demo A and C, today row, session page, hint closes and stays closed, axe in both themes, 320 px -- AC 8
- [x] README, `sensorveiledning-sporbarhet.md`, `sprint-status.yaml` -- status -- CLAUDE.md

**Acceptance Criteria:**
- Given the migrations, when applied, then the tables exist with the unique keys and each cascades from `user`, and the deletion test fails if one is not covered
- Given a user with a profile and no week, when Uke opens, then version 1 for today's week is stored, and two simultaneous opens create one
- Given a stored week, when Uke renders, then day rows, today's row, rest lines, «X av Y økter» (X = 0) and «Neste økt» follow the matrix
- Given a session opened from Uke, then a strength session lists exercises with sets and reps (no load) and a run shows type and km with one decimal
- Given the screen at 320 px, 200 % text, keyboard only or reduced motion, then every row is reachable and readable without sideways scroll

## Implementation Notes

- Implementert direkte (ingen underagent). Migrering `0003_plan_tables` laget med `drizzle-kit generate`.
- `getCurrentWeek` kaller `ensureCurrentWeek` først. Transaksjonen bruker `ON CONFLICT DO NOTHING` på programmet og planuka, så en samtidig forespørsel venter og gjør ingenting.
- Uke og økt-siden har en egen `loading.tsx` (statisk skjelett) og `not-found.tsx`. Med loading-tilstanden er statuskoden allerede sendt som 200 når `notFound()` kalles, så testen sjekker innholdet «Fant ikke økta», ikke statuskoden.
- E2E-testene regner forventet uke med den rene motoren og dagens dato, så de holder på alle ukedager. På fredag til søndag er første uke for profil A tom (økter tirsdag og torsdag), og Uke viser «0 av 0 økter».

## Spec Change Log

## Review Triage Log

Gjennomgang gjort av hovedagenten selv (ingen underagenter startet uten ønske fra brukeren).

| Funn | Verdikt | Bevis | Rute |
| ---- | ------- | ----- | ---- |
| `notFound()` gir status 200 fordi `loading.tsx` har startet strømmen | low | Playwright viste 200 med «ikke funnet»-innhold; innholdet er riktig og avslører ikke om økta finnes | patch: norsk `not-found.tsx` og test på innholdet |
| Produksjonsdatabasen (Supabase) mangler migrering 0003 etter merge | high | Uke vil feile i den publiserte appen til migreringen er kjørt | defer: manuell oppgave, ført i README, PR og issues.md |
| Slettetesten hadde faste radtall som ville bryte med nye tabeller | medium | Beskyttelsestesten feilet først for de nye tabellene (bevis); radtall er nå `WITH_PLAN`, `DEMO_ONLY` og `NOTHING` | patch |
| En fredag til søndag-start gir tom første uke for profil A | low | Følger AD-13 og Appendix A (bare dagene fra start); Uke viser da «0 av 0 økter» | rejected: spec-ens valg |
| Samtidige besøk kunne lage to uker | false | Test med seks parallelle kall gir én rad i hver tabell | rejected |

## Design Notes

Columns: `program(id, user_id, focus, started_on date, is_current, fast_short_run_km)`; `plan_week(id, user_id, program_id, week_start date, current_version)`; `plan_version(id, user_id, plan_week_id, version)`; `session_slot(id, user_id, plan_week_id)`; `version_session(plan_version_id, session_slot_id, user_id, date, kind, name_key, exercises jsonb, distance_km)`; `user_hint(user_id, hint_key, dismissed_at)`.

## Verification

**Commands:**
- `docker compose up -d db && npm run db:migrate` -- expected: migration applies
- `npm run lint && npm run typecheck && npm run format:check && npm test` -- expected: all pass
- `npm run test:e2e` -- expected: Uke tests pass
