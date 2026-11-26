---
title: 'Story 1.4: Try the demo'
type: 'feature'
created: '2026-11-26'
status: 'done'
baseline_commit: 'ff6febccc07b15b6cab074d753e7dc12bc735e24'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An examiner or visitor must create an account before seeing anything, and there is no demo user, no `profile` table and no «Demo» badge. Story 1.4's ACs (NFR1, AD-6, AD-16, UX-DR12, UX-DR14) are unmet.

**Approach:** «Prøv demo» on the login screen opens a profile picker A–D. Picking one runs `src/seed`: it deletes demo users older than 24 h, creates a fresh demo user through Better Auth's sign-up (signing them in, no bypass), marks the user as demo and stores the Appendix B profile through `profile.api`, then lands on Uke. A «Demo» pill shows in the app header for demo users only, and Better Auth rejects email/password changes for them.

## Boundaries & Constraints

**Always:** `account` owns the demo flag (`user.is_demo`, Better Auth `additionalFields`, `input: false`), demo creation and the 24 h cleanup. `profile` owns the new `profile` table (`user_id` unique, FK `ON DELETE CASCADE`) and its Zod-validated `saveProfile(userId, input)` upsert. `src/seed` is the only code that calls both. Profile values come from PRD Appendix B (A: strength, beginner, full body, 2/week, gym; B: strength, experienced, full body, 5/week, gym; C: running, beginner, goal 10 km, longest run 3 km, 3/week; D: running, experienced, goal half marathon, longest run 15 km, 4/week). Demo email `demo-<uuid>@demo.flexpt.invalid`, random password from `crypto`, never shown. Cleanup takes `now` as an argument (injected clock). The schema change is one drizzle-kit migration. UI text in bokmål, tokens only, ≥ 44 px targets, works at 320 px and 200 % text.

**Never:** No authentication bypass (no hand-made session rows or cookies). No demo users created at start-up (AD-16 replaces the PRD's older wording). No plans, logs or coach scenarios in the seed (Epics 2–4). No badge for normal users, and no interactive badge. Do not let a client set `isDemo`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Start demo | pick «C» | new user `is_demo = true`, profile row C, signed in, redirect `/uke`, badge visible | N/A |
| Two visitors | A then A again | two users, two profile rows; `getProfile(idA)` never returns B's row | N/A |
| Stale demo users | demo user created 25 h before `now`, demo user 1 h old, normal user 30 days old | next demo start deletes only the 25 h user and its profile/sessions | N/A |
| Unknown profile | `"E"` or `"x"` posted | no user created | `{ ok: false, code: "invalid" }`, message under the cards |
| Change password as demo | `changePassword` with demo session | password unchanged | Better Auth `FORBIDDEN`, bokmål message |
| Change email as demo | `changeEmail` with demo session | email unchanged | `FORBIDDEN` |
| Normal user | registered via `/registrer` | `is_demo = false`, no badge | N/A |
| Double click | two quick presses on a card | the buttons are disabled while pending; one demo user | N/A |

## Decisions

- **Picker (2026-11-26, human):** a separate page `/prov-demo` in the `(auth)` group, reached from a «Prøv demo» secondary-button link under the login form. It has an h1 «Prøv demo», four full-width card buttons («Profil A»–«Profil D», each with its description) submitting `startDemoAction`, and a «Tilbake til innlogging» text link. It works without JS.
- **Descriptions (2026-11-26, human, accepted as proposed):** A «Styrke for nybegynnere: helkropp to ganger i uka på treningssenter.» · B «Styrke for erfarne: fem økter i uka på treningssenter.» · C «Løping for nybegynnere: mål 10 km, løper 3 km i dag, tre økter i uka.» · D «Løping for erfarne: mål halvmaraton, løper 15 km i dag, fire økter i uka.»
- **Spec size (2026-11-26, human):** keep the full spec (~2300 tokens) as one story.

</frozen-after-approval>

## Code Map

- `src/shared/auth/server.ts` L13-33 -- `betterAuth({...})`: add `user.additionalFields.isDemo` and a `hooks.before` guard; keep `nextCookies()` last
- `src/shared/auth/session.ts` -- `getUserId` (React `cache`), `requireUserId`, `withUser`; add a cached demo check from the same session
- `src/shared/db/schema/auth.ts` -- `user` table (add `isDemo` → `is_demo`); `session`/`account` already cascade (L36, L49)
- `src/shared/db/schema/index.ts` -- re-export the new `profile.ts`
- `src/shared/db/migrations/` -- `0000`, `0001`; generate `0002` with `npm run db:generate`
- `src/features/account/actions.ts` L46-90 -- `signUpEmail` + `headers()` + `isAPIError` pattern to reuse for demo sign-up
- `src/features/account/api.ts`, `src/features/profile/api.ts` -- public surfaces to extend (profile's header already claims the table)
- `src/shared/lib/result.ts` -- `ActionResult`, `ok`, `fail`
- `src/app/(auth)/logg-inn/page.tsx` + `account/components/login-form.tsx` L46-50 -- add «Prøv demo» under the form; `(auth)/layout.tsx` already redirects signed-in users
- `src/app/(app)/layout.tsx` -- app shell, no header yet; add one for the badge
- `src/shared/ui/button.tsx` (`buttonClass`), `choice-card.tsx` -- styles to reuse
- `eslint.config.mjs` L80-82 -- `app` may import slice APIs only; `seed` already allowed to all slice APIs
- `tests/lint/boundaries.test.ts` L68-76 -- pattern for edge tests
- `tests/integration/auth.test.ts` L25-57 -- `next/headers` cookie-jar mock, per-run email domain cleanup
- `tests/e2e/auth.spec.ts` -- `register`, `logIn`, 320 px / 200 % checks; `tests/e2e/theme.spec.ts` -- axe `scan()`
- UX: `mockups/key-innlogging.html` L83 (`.demo` pill), L113, L121; `DESIGN.md` L300-304, L428 (accent bg, surface text, label type, radius full, top of header)

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/db/schema/profile.ts` + `auth.ts` + migration `0002` -- `profile` (uuid id, `user_id` unique cascade, `focus`, `experience`, `sessions_per_week` 2–5 check, nullable `main_focus`, `equipment`, `goal`, `longest_run_km`, timestamps); `user.is_demo boolean not null default false`
- [x] `src/shared/auth/server.ts` -- `isDemo` field; `hooks.before` on `/change-email`, `/change-password`, `/set-password`: demo session → `APIError("FORBIDDEN")`
- [x] `src/shared/auth/session.ts` -- `isDemoSession(): Promise<boolean>`
- [x] `src/features/profile/{schemas,profile}.ts` + `api.ts` -- Zod union on `focus`; `saveProfile(userId, input)`, `getProfile(userId)`
- [x] `src/features/account/demo.ts` + `api.ts` -- `deleteStaleDemoUsers(now)`, `signUpDemoUser(): Promise<string>` (sign-up, set `is_demo`, return id)
- [x] `src/seed/demo-profiles.ts`, `src/seed/demo.ts`, `src/seed/actions.ts` -- `DEMO_PROFILES` A–D (values + description); `startDemo(key, now)`; `"use server"` `startDemoAction(formData)` validates key, calls `startDemo(key, new Date())`, redirects `/uke`
- [x] `eslint.config.mjs` + `tests/lint/boundaries.test.ts` -- allow `app → seed`; test it
- [x] `src/app/(auth)/prov-demo/page.tsx` + picker component, login page link -- per Decisions (picker)
- [x] `src/shared/ui/demo-badge.tsx` + `src/app/(app)/layout.tsx` -- header with badge when `isDemoSession()`
- [x] `tests/integration/demo.test.ts` -- matrix rows (start, isolation, stale cleanup with injected `now`, unknown key, change password/email rejected, normal user unaffected)
- [x] `tests/e2e/demo.spec.ts` -- login → «Prøv demo» → each of A–D lands on Uke with badge on Uke and Profil; registered user has no badge; axe on `/prov-demo` light and dark; 320 px no sideways scroll
- [x] `README.md`, `.docs/sensorveiledning-sporbarhet.md` -- demo as test users; rows 6, 20, 24, 26, 27

**Acceptance Criteria:**
- Given `.env` without `ANTHROPIC_API_KEY` and `COACH_MODE=demo`, when I run `docker compose up` and use «Prøv demo», then the demo works fully.
- Given the repo, when I run `lint`, `typecheck`, `format:check`, `test` and `test:e2e`, then all pass with zero axe violations.

## Implementation Notes

- `src/seed/actions.ts` exports `startDemoAction(formData)` as specified, plus `startDemoFormAction(previous, formData)`, a thin wrapper with the `useActionState` signature, so the picker can pass a server action straight to the form and keep working without JS (proved by an e2e test with JavaScript off).
- The picker component lives next to its route (`src/app/(auth)/prov-demo/demo-picker.tsx`); the page passes the titles and descriptions from `DEMO_PROFILES` as props.
- Profile enum values: `focus` strength|running, `experience` beginner|experienced, `main_focus` upper_body|lower_body|full_body, `equipment` gym|home, `goal` 5k|10k|half_marathon, `longest_run_km` double precision 1–50 (Zod).
- `getSession` in `shared/auth/session.ts` is now the React-`cache`d lookup; `getUserId` and `isDemoSession` both read it, so one request still makes one session lookup.

## Spec Change Log

## Review Triage Log

Pass 1 (2026-11-26): Blind Hunter (BH), Edge Case Hunter (EC), Verification Gap (VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| EC1 / EC2 / BH1 / BH2 / VG-other | Demo start is not atomic: a failed `is_demo` update leaves a signed-in normal user the cleanup never removes; a failed `saveProfile` leaves a profile-less demo user signed in and `/prov-demo` then redirects away | medium | `signUpDemoUser` runs `signUpEmail` (session cookie set) before a separate UPDATE; `startDemo` has no rollback; `deleteStaleDemoUsers` filters `is_demo = true` | patch: delete the user on failure (`deleteDemoUser`, demo rows only) and rethrow |
| VG2 | `startDemoAction`'s `unexpected` path is untested | medium | No test references `"unexpected"` or its message | patch: integration test with a failing `saveProfile` |
| VG1 | `saveProfile` Zod validation never tested with invalid input | medium | Only valid Appendix B values are saved in tests; relaxing `strictObject` or ranges stays green | patch: `it.each` of invalid inputs |
| BH9 | "Sign-up cannot make itself a demo user" accepts any APIError | low | The `else` branch passes on duplicate email or validation errors, even without `input: false` | patch: assert the one real outcome |
| EC7 / BH4a | Picker copy «slettes etter et døgn» promises deletion that only happens on the next demo start | low | `deleteStaleDemoUsers` runs only inside `startDemo` | patch: accurate copy |
| BH-small b | `Choice.key` typed `string` | low | `DemoProfileKey` exists in `demo-profiles.ts` | patch |
| EC4 / BH3 / EC-claim | No server-side limit: no-JS double press or a script creates many demo users | medium | Client-only `aria-disabled` guard; no rate limit on the action. Same cause as the login limit already deferred to Story 1.6 | defer |
| EC3 / EC-claim | A signed-in user posting the action from a stale tab gets a new demo session | low | Needs a stale `/prov-demo` tab after signing in elsewhere; the fix adds a guard | reject |
| EC5 | App clock vs DB `defaultNow()` skew shifts the 24 h cutoff | low | Same host or managed DB: skew is seconds against a 24 h window | reject |
| EC6 / BH7 | `profile` has no DB CHECKs beyond sessions per week; `2 and 5` duplicates the Zod constants | low | `saveProfile` is the only writer and parses with Zod first; constraints add migration complexity | reject |
| BH4b | An active demo user is signed out when the 24 h cleanup runs | false | Intended by AD-16 ("deleted when the next demo user is created") | reject |
| BH5 | The credential guard is a deny-list that misses `/reset-password`, `/link-social`, `/update-user` | false | No email sender (reset is v2), no social providers, and `/update-user` refuses email/password fields in Better Auth; `/delete-user` is Story 1.5's call | reject |
| BH6 | The middleware casts `session.user` and would miss a rename | low | `getSessionFromCtx` is not typed with `additionalFields`; the integration test fails if the field stops being read | reject |
| BH8 | No index for the cleanup query | low | Small table (24 h of demo users) | reject |
| BH10 | The demo password test passes a wrong current password | false | It asserts `FORBIDDEN`; without the hook Better Auth returns `BAD_REQUEST`/invalid password, so the test would fail | reject |
| BH11 | No evidence for the `docker compose up` AC | false | The implementation run started `docker compose up -d --build` with no `.env` and ran the demo e2e spec against `http://localhost:3000` (11/11) | reject |
| BH12 | Spec `in-review` vs sprint-status `in-progress`; rows 6, 20… not checkable | false | Step 5 moves the sprint status; the traceability file was updated by criterion and line | reject |
| BH-small a/c/d | `name: ""`; badge reads a bare "Demo"; no logout or profile switch from the demo | false / low | Profil already has «Logg ut» for every user; the badge copy is DESIGN.md's; `name` is unused | reject |

## Design Notes

Sign-up rather than sign-in: `signUpEmail` with `autoSignIn` creates the user and the session in one Better Auth call, and `nextCookies()` sets the cookie from the Server Action, which is the "no bypass" path AD-6 asks for. The flag is set by `account` right after, so `isDemo` can never come from a request. The action lives in `src/seed` because only seed may call both `account` and `profile`; `src/app` gets a lint edge to seed, nothing else. The e2e tests create their demo fixtures by pressing «Prøv demo», which runs the same seed functions.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm run format:check` -- clean
- `docker compose up -d db && npm run db:migrate && npm test` -- demo tests pass
- `npm run test:e2e` -- demo, auth, theme and smoke specs pass
- `git status --short` -- no `.env`, build output or test reports
