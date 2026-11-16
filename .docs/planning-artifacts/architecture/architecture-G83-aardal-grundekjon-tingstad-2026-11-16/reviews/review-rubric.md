# Rubric review — ARCHITECTURE-SPINE.md (Flex PT v1)

**Reviewed:** `ARCHITECTURE-SPINE.md` (status draft, 2026-11-16) against PRD v1.1 (`prd-flex-pt.md`), with `.memlog.md` as background.
**Checklist:** divergence points for epics/stories fixed and none missed; every AD Rule enforceable and actually preventing its divergence; nothing under Deferred lets two units diverge; tech plausibly current; PRD capabilities covered; every owned dimension decided, deferred or open (deployment & environments, infra/provider, operations); mermaid valid and consistent with ADs and source tree.

## Verdict

**Needs revision before it is final.** The core is strong: a single app, a pure plan engine as the only judge (AD-2), one owner per entity (AD-3), a Live/Demo provider split (AD-8), a two-layer medical check (AD-9) and immutable versions (AD-7) are the right decisions, and most Rules can be checked in review. But the central data contract between `plan`, `logging` and `coach` (how planned sessions keep their identity across plan versions) is not decided. The coach-change contract that the engine has to validate is not fixed either. AD-1 and AD-3 contradict each other on cross-slice imports. Deployment and environments are only half decided. 1 critical, 7 high, 8 medium, 7 low.

## Summary table

| # | Severity | Finding |
| --- | --- | --- |
| 1 | critical | Planned-session identity across immutable plan versions is undefined, so logs, idempotency and "logged sessions are kept" can diverge |
| 2 | high | AD-1 (slices never import each other) contradicts AD-3 (read through the owner's exported queries; coach calls plan) |
| 3 | high | The change-proposal contract (operation vocabulary) is not fixed, and the engine is not allowed to import where the schema lives |
| 4 | high | Lazy week generation (FR4) has no owner or idempotency, and doing it during a page render breaks AD-4 |
| 5 | high | "My knee hurts" (FR13 / Appendix C) can't be done under AD-9 + AD-10 as written |
| 6 | high | PostgreSQL contradicts PRD NFR5 and §4 (SQLite), and the spine doesn't record the deviation or list it as an open question |
| 7 | high | Deployment & environments are under-decided: prod migrations, prod seed and demo, prod COACH_MODE, preview deploys, Supabase pooling and driver, region, free-tier pausing |
| 8 | high | Ops risk: a live coach on a public URL with rate limiting deferred lets anyone use up the API key |
| 9 | medium | Demo-mode semantics (badge trigger, "Prøv demo" in prod, demo credentials, demo data reset) are undefined |
| 10 | medium | Exercise library format/ids are deferred to Story 2.1, but the engine, logging, seed and demo files all depend on them |
| 11 | medium | Set-level idempotency and when a session log is created are missing (the NFR11 deferral leaks) |
| 12 | medium | Profile has two writers (onboarding and profile), breaking AD-3, and the FR3 replan flow across slices is unspecified |
| 13 | medium | Route protection pattern (logged-out redirect, Story 1.2) is not fixed |
| 14 | medium | Day exclusions are scoped to the program, not to a week or plan version |
| 15 | medium | TypeScript 7.0 compatibility with Next.js 16.4, typescript-eslint and the Drizzle/Better Auth typings is unverified |
| 16 | medium | Health-data dimension: hosting region and data-processing location are not decided |
| 17 | low | Mermaid dependency diagram: `lib` shown twice, and the `shared_rest → engine` edge is too broad and does not reflect AD-3 |
| 18 | low | ER diagram omits previous-version link, auth tables, exercise reference and current-version pointer |
| 19 | low | Better Auth default text ids conflict with the "UUID primary keys" convention |
| 20 | low | Profiles A–D fixtures and seed defined twice, and "today" (the clock) isn't made controllable |
| 21 | low | Capability map gaps (NFR2/3/4/7/9/10, E1–E4, FR17 cross-slice reads, quotes list) |
| 22 | low | Live-provider timeout and retry not set (NFR7) |
| 23 | low | Source tree omits Dockerfile, drizzle.config.ts, README, Next.js proxy file, seed entry |

---

## Findings

### 1. Planned-session identity across plan versions — critical

**Where:** AD-7, AD-3, ER diagram (`PLAN_VERSION ||--o{ PLANNED_SESSION`, `PLANNED_SESSION ||--o| SESSION_LOG`).
**Problem:** Plan versions are immutable, and each new version (proposal approval, profile change, new program, and probably every new week) contains its own planned sessions. Session logs hang off a planned session and are unique per planned session. Nothing says:
- whether a new version copies the already-logged sessions (new ids) or references the old rows;
- how a log made against v1's Tuesday session is recognised as "the same session" in v2 (FR3: "sessions already logged are kept"), so the week counter "X av Y økter", the next-session highlight and the progression input all stay correct;
- whether the AD-7 unique key still prevents a double log once the session has been copied into v2 with a new id (it doesn't: the v2 copy is unlogged, so the user can log Tuesday again);
- whether a plan version covers a week or a whole program, and how "current version" is determined (a pointer on program, or the max version number).

This is the main contract between `plan`, `logging` and `coach`. Three stories (2.2, 3.1, 4.3) will each make their own guess.
**Fix:** Add an AD such as "Planned sessions have a stable slot identity". For example: a plan version belongs to one program week (`program_id`, `week_start`); each planned session has a `slot_key` that stays the same across versions of that week (for example `uuid` assigned at first generation and copied into later versions); `session_log` references `(program_id, week_start, slot_key)`, unique, not the version row. A new version copies all slots and keeps the slot keys of logged sessions unchanged and locked. The engine never moves or alters a logged slot. "Current version" is `program.current_plan_version_id`, updated in the same transaction that inserts the version, with a unique `(program_id, week_start, version_no)`. Update the ER diagram to match.

### 2. AD-1 contradicts AD-3 on cross-slice access — high

**Where:** AD-1 Rule ("A feature slice may import only from `src/shared/` and its own folder"), invariant line under the first diagram ("A slice never imports from another slice"), AD-3 Rule ("other slices read it through the owner's exported query functions"; "coach applies an approved proposal by calling `plan`'s exported function").
**Problem:** Both rules can't hold at once. Coach must call plan; logging and plan need profile; plan (progression) needs logging's logs; FR17 (logging) needs plan's next session. Implementers will either break AD-1 or move everything into `shared/`, which empties the slices. A lint rule written from AD-1 would reject AD-3's required calls.
**Fix:** Replace the absolute ban with an enforceable public-API rule. Each slice exposes `src/features/<slice>/index.ts` (queries and commands only, no components); other slices may import only that file, never deep paths. Enforce with `eslint-plugin-boundaries` or `no-restricted-imports` patterns (`@/features/*/!(index)`). List the allowed edges (coach → plan, plan → logging, plan → profile/onboarding queries, logging → plan, profile → plan) and forbid cycles, or route the cycle plan ↔ logging through shared types. Redraw the diagram with these edges.

### 3. Change-proposal contract not fixed; engine can't import it — high

**Where:** AD-2 (`engine.validateProposal`), AD-8 ("validates the result with the same Zod schema"), Consistency Conventions ("coach result schema lives in `shared/coach-provider`"), invariant ("`src/shared/engine` imports only from `src/shared/lib` and the TypeScript standard library").
**Problem:** The proposal is the contract between the language model, Demo files, `engine.validateProposal`, the proposal card (FR11 before → after lines) and plan's apply function. The spine doesn't fix its vocabulary: which operations exist (move session, exclude day, drop session, R8 reduce, swap exercise, swap to bodyweight), how they reference sessions (slot key, see #1), or whether the model sends amounts. Also, the engine has to type-check proposals, but it may not import `shared/coach-provider`. Is Zod (a third-party package) even allowed inside the engine? The Demo recordings (Story 1.4), the Live prompt (4.1), validation (4.2) and the card (4.3) will each invent a shape.
**Fix:** Add an AD: "The plan-change vocabulary is owned by the engine." Define `PlanChange` as a discriminated union in `shared/engine/changes.ts` with a closed set of ops: `excludeDays`, `moveSession`, `dropSession`, `reduceSession` (no amount, the engine applies R8), `swapExercise`, `swapToBodyweight`. Sessions are referenced by slot key. The coach result schema in `shared/coach-provider` is `{ reply: string, medicalCondition: boolean, changes: PlanChange[] }`, with the Zod schema built to produce exactly that type. State explicitly whether Zod may be imported in the engine (recommend: no, the engine takes already-parsed types). The before → after diff is produced by the engine (`engine.diff(oldVersion, newVersion)`), never by the UI.

### 4. Lazy week generation has no owner or idempotency — high

**Where:** FR4 / Story 2.2 ("generated the first time the user opens the app in the new week, and only once"), R13 (week-9 card), AD-4 ("Data changes happen only in Server Actions or Route Handlers").
**Problem:** The natural place is the week-plan server component, but writing during a render is neither a Server Action nor a Route Handler, so AD-4 forbids it. Nothing prevents two concurrent first visits (two tabs, prefetch) from generating two week-versions. Also not decided: what happens after a gap of several weeks (backfill skipped weeks as unlogged, or jump to the current week), and whether logging's "next planned session" (FR17) on a Sunday evening triggers generation.
**Fix:** Add a rule: `plan.ensureCurrentWeek(userId, today)` is the only function that creates a week. It is idempotent through a unique constraint on `(program_id, week_start)` with insert-on-conflict-do-nothing. It is called from the week-plan page through an explicit, documented exception to AD-4 (a server-side "ensure" read-path write), or from a Route Handler the page calls. Skipped weeks are not generated. Progression uses the last logged week, and unlogged sessions count as "not logged" (progression table). R13's week counter is computed from `program.start_date`, not from the number of generated weeks.

### 5. "My knee hurts" can't be done under AD-9 + AD-10 — high

**Where:** AD-9 ("On a match the app returns the fixed R11 reply and does not send the message"), AD-10 ("earlier chat history are never sent"), FR13, Story 4.4, Appendix C row "My knee hurts".
**Problem:** FR13 requires the coach to also ask whether the user wants to swap the affected exercise, and a swap is a normal proposal. If the message never reaches the model, something must (a) recognise the body part or exercise, (b) ask the follow-up, and (c) build the swap proposal after "yes". With no chat history sent, a follow-up "ja, bytt" reaches the model without context. Each of Stories 4.1, 4.4 and 4.5 will pick its own path.
**Fix:** Decide the path in AD-9. Recommended: the word list maps matches to a body-part category (`knee` → lower-body exercises). On a match with a body part, `coach` returns R11 plus a fixed follow-up question with Yes/No buttons, not free text. "Yes" calls a deterministic `engine.proposeSwap(plan, bodyPart)` that produces a `swapExercise` change for the affected exercises in the current week, shown on the normal proposal card. No message goes to the model. "Chest pain" (no exercise-related body part) gets R11 only. Add the word list and body-part map as a data file in `features/coach` with its own tests.

### 6. Database deviates from PRD NFR5 and §4, with no record of it — high

**Where:** AD-5, AD-14, frontmatter `binds: [... NFR5 ...]`, PRD NFR5 ("an SQLite database") and §4 ("SQLite as the database"). The `.memlog.md` already notes this as a conflict ("KONFLIKT med PRD v1.1").
**Problem:** The spine claims to bind NFR5 but contradicts its text, and it has no Open Questions or deviations section, so the conflict exists only in the memlog. Epics written from the PRD will plan SQLite. This is also traceability evidence for the course rubric.
**Fix:** Add a "Deviations from the PRD" note (or an Open Questions section) to the spine: "NFR5 and §4 SQLite → PostgreSQL in Docker (AD-5, AD-14); reason: same database locally and on Vercel, which has no persistent disk; PRD to be updated through `bmad-correct-course` before the spine is final." Then run correct-course to change NFR5 to "runs locally with `docker compose up` following the README". Keep the spine `status: draft` until that is done.

### 7. Deployment & environments under-decided — high

**Where:** AD-14, Structural Seed deployment diagram, Stack (Hosting), Deferred.
**Problem:** The deployment dimension is only partly decided. Not decided:
- **Prod migrations:** who runs `drizzle-kit migrate` against Supabase, and when (Vercel build step, a manual step, a GitHub Action)? Running it in the Vercel build with a pooled connection often fails.
- **Prod seed / demo:** are the demo users A–D seeded on the published app, and is "Prøv demo" shown there?
- **Prod COACH_MODE:** live or demo on the published URL?
- **Preview deployments:** Vercel builds every PR branch. Which database do previews use? If it's the prod Supabase connection string, PR previews run migrations and writes against production data.
- **Connection and driver:** the Postgres driver for Drizzle is not named (`postgres` / postgres.js vs `pg`). Serverless functions on Supabase need the transaction pooler (port 6543) and `prepare: false` for postgres.js. Without this, connections run out or prepared-statement errors appear.
- **Docker image:** does `docker compose up` run `next dev` or a production build (`next build && next start`)? Is there a Dockerfile? What does the examiner need installed?
- **Supabase free-tier pausing** after one week of inactivity (noted in memlog) is an operations risk if an examiner opens the published URL later.
**Fix:** Add an environments table to AD-14 with rows local-dev, examiner (docker), preview, production and columns DB, COACH_MODE, seed, migrations, URL. Recommended values: previews use `COACH_MODE=demo` and either no database or a separate Supabase project/branch, never prod. Production migrations run through `drizzle-kit migrate` in a documented manual step or a `migrate` GitHub Action on merge to `main` over the direct (non-pooled) URL. Runtime uses the pooled URL (`DATABASE_URL`), and migrations use `DIRECT_URL`. Name the driver (`postgres` 4.x with `prepare: false`). Compose builds a production image from a committed Dockerfile and runs `migrate && seed && next start`. Put the pause risk under Deferred with a mitigation (keep-alive, or upgrade before the exam period).

### 8. Public live coach with rate limiting deferred — high

**Where:** Deferred ("Rate limiting, monitoring and backups: not needed for a course MVP without real users"), AD-8, AD-14.
**Problem:** The published app is on a public URL with open registration. If `COACH_MODE=live` there, anyone can register and send unlimited messages on the team's paid key. "No real users" doesn't protect against this. The deferral leaves a real cost and abuse risk.
**Fix:** Either fix production to `COACH_MODE=demo` (link it to #7), or add a minimal rule in AD-8: a per-user daily message cap counted in the `coach_message` table (for example 30 per day), plus a hard spending limit set in the Anthropic console. Monitoring and backups can stay deferred.

### 9. Demo-mode semantics undefined — medium

**Where:** AD-6 ("'Prøv demo' signs in as a seeded demo user through Better Auth"), AD-8 (`COACH_MODE`), NFR1 (badge "while in demo mode"), AD-14 (seed).
**Problem:** Two notions of "demo" are mixed: the coach provider mode (`COACH_MODE=demo`) and the demo user. Not decided: does the badge appear when `COACH_MODE=demo` or when the signed-in user is a demo user? Which of A–D does "Prøv demo" use (one, or a picker so every Appendix C scenario can be tried, as Story 1.4 requires)? How does the server sign in without a password in the repo? Does demo data reset, given that examiners will change it?
**Fix:** Add to AD-6: users have `is_demo boolean`. "Prøv demo" shows a picker for profiles A–D and signs in server-side through a Better Auth server API call. Demo passwords are generated at seed time and never shown. The badge appears when `is_demo` is true or `COACH_MODE=demo`. Running the seed again resets demo users. Decide whether "Prøv demo" is shown in production (see #7).

### 10. Exercise library format deferred, but cross-cutting — medium

**Where:** Deferred ("Exercise library format: decided in Story 2.1"), Conventions ("UUID primary keys").
**Problem:** The engine (R4, R5, R13 alternatives), set logs (which exercise), progression per exercise (R6, R12), the seed and the recorded Demo coach files all reference exercises. If the id format and storage (JSON file loaded at runtime vs a DB table) are chosen inside 2.1, the stories built in parallel or later (1.4 seed, 2.2 engine) will diverge. It also conflicts with the UUID convention if Free Exercise DB string ids are used.
**Fix:** Decide now: the library is a committed JSON file in `data/exercises/`, read through a typed loader in `shared/engine` (pure, passed in as data). The stable key is the Free Exercise DB string id (an explicit exception to the UUID convention), and `set_log.exercise_id` is text with no FK. Required fields: `id`, `name_nb`, `muscle_groups`, `location: gym|home|both`, `bodyweight: boolean`, `pattern` (push/pull/legs/upper/lower). Leave only the selection script to Story 2.1.

### 11. Set-level idempotency and session-log creation — medium

**Where:** AD-7 (idempotency only for session log and approval), Deferred NFR11 ("each logged set is saved at once" or browser), FR7.
**Problem:** If sets are saved one at a time (the likely choice), a double tap on "log set" creates two set logs, which changes the derived status and progression (R6/R12). It also isn't decided whether the session log row is created at the first set or at "Fullfør økt", which decides what "unique on planned session" protects. Locking after finish is not tied to a rule.
**Fix:** Extend AD-7: the session log is created at the first logged set (status `in_progress`). Each set log has a unique `(session_log_id, exercise_id, set_index)`, and repeating the request returns the existing row. "Fullfør økt" sets `finished_at`, and any write after that is rejected. NFR11 then follows from server state, and the browser keeps only unsaved stepper values (EXPERIENCE.md says these are not restored). Narrow the deferral to "client-side draft only".

### 12. Profile ownership and FR3 replan flow — medium

**Where:** AD-3 table ("profile: `onboarding` creates; `profile` updates"), FR3, R13 (focus change resets the week count), Capability map (FR3 → profile, AD-7).
**Problem:** Two writers of one entity is the exact divergence AD-3 says it prevents. FR3 also requires a profile change, after confirmation, to create a new plan version that replans from today, and a focus change to start a new program. Which slice orchestrates this, and in which transaction?
**Fix:** Make `profile` the single owner. Onboarding calls `profile.createProfile` and then `plan.createProgram` through their public APIs (see #2). State that `profile.updateProfile` calls `plan.replanFromToday(userId, today)` (or `plan.startNewProgram` on a focus or sessions-per-week change) in the same database transaction, after the user confirms.

### 13. Route protection pattern not fixed — medium

**Where:** AD-6, Story 1.2 ("Logged-out users cannot open any page except sign up and log in"), first diagram (app → features only).
**Problem:** Without one pattern, each route will check auth in its own way, or a few will forget. Next.js 16 has `proxy.ts` (formerly middleware), layouts, and checks per action.
**Fix:** Add to AD-6: all signed-in pages sit in a route group `src/app/(app)/` whose `layout.tsx` calls `requireUser()` from `shared/auth` and redirects. `proxy.ts` may do only an optimistic cookie redirect. Every Server Action and Route Handler calls `requireUser()` itself (layouts don't protect actions). Add `app → shared/auth, shared/ui` to the diagram.

### 14. Day exclusions scoped to the program — medium

**Where:** ER (`PROGRAM ||--o{ DAY_EXCLUSION`), AD-3 (plan owns day exclusions), Appendix C ("I'm away Thursday to Sunday").
**Problem:** "Away Thu–Sun" is about this week. Attached to the program, an exclusion is either applied every week or needs an undocumented date range. It may also be redundant with the plan version, which already holds the moved sessions. Engine (R9) and coach will read it differently.
**Fix:** Either drop the entity (an exclusion is just a `PlanChange` that the engine applies to produce a new version of that week) or scope it to `(program_id, week_start, date)`. State that exclusions never carry into next week's generation.

### 15. TypeScript 7.0 compatibility unverified — medium

**Where:** Stack ("TypeScript 7.0").
**Problem:** TypeScript 7 is the native (Go) compiler. It is current, but typescript-eslint, Next.js's type-check step and some library typings depend on the TS JS API, and support for that may lag behind. It is a plausible but risky choice for a course team. The Better Auth version and import path are also marked "to verify" in memlog but not flagged in the spine.
**Fix:** Either verify in Story 1.1 that `next build`, `typescript-eslint`, Drizzle and Better Auth type-check under TS 7 and record the result, or pin TypeScript 6.x/5.9 with a note. Add to Deferred: "Better Auth adapter import path verified in Story 1.1."

### 16. Health data: region and processing location — medium

**Where:** PRD §4 ("treated as health data"), AD-10, AD-14, Stack (Vercel, Supabase).
**Problem:** The spine treats data minimisation for the model (AD-10) but leaves silent where health data is stored and processed: the Supabase region and the Vercel function region. A US default region adds latency (function ↔ DB) and a data-transfer question.
**Fix:** Add to AD-14: Supabase project in an EU region (for example `eu-north-1` Stockholm or `eu-central-1`), and the Vercel function region set to match (`arn1`/`fra1`) in `vercel.json`. Note the Anthropic processing location as an accepted risk under Deferred.

### 17. Dependency diagram inconsistencies — low

**Where:** First mermaid diagram.
**Problem:** The syntax is valid. But `lib` is shown inside `shared_rest` ("db, auth, coach-provider, ui, lib") and again as its own node. The edge `shared_rest → engine` says db, auth and ui may import the engine, which is broader than intended. Feature→feature edges required by AD-3 are missing (see #2), and so are `app → shared/auth` and `app → shared/ui`.
**Fix:** Remove `lib` from `shared_rest`. Replace `shared_rest → engine` with `coach-provider → engine` (types only, per #3). Add `shared_rest → lib`, `app → shared (auth, ui)`, and the allowed slice-to-slice edges through `index.ts`.

### 18. ER diagram omissions — low

**Where:** Second mermaid diagram.
**Problem:** The syntax is valid. Missing: the `PLAN_VERSION` → previous version self-link (AD-7 "points to the previous one"), the current-version pointer, Better Auth `SESSION` and `ACCOUNT` (AD-3 lists them), the exercise reference on `SET_LOG`, approval state on `CHANGE_PROPOSAL` (AD-7's approval key), and the slot key from #1. `USER ||--|| PROFILE` says a user always has a profile, but a user exists before onboarding finishes.
**Fix:** Add `PLAN_VERSION |o--o| PLAN_VERSION : "previous"` and `PROGRAM ||--o| PLAN_VERSION : current`. Use `USER ||--o| PROFILE`. Add the auth tables, or note "Better Auth tables omitted". Show `exercise_id` as an attribute on `SET_LOG`, and add `status` and `decided_at` on `CHANGE_PROPOSAL`.

### 19. Better Auth id type vs UUID convention — low

**Where:** Conventions ("UUID primary keys"), AD-6, Conventions (cascade delete).
**Problem:** Better Auth generates text ids by default. App tables with `uuid` FKs to `user.id` won't match, and the cascade relies on those FKs.
**Fix:** Configure Better Auth to generate UUIDs (its database id-generation option), or state that `user.id` is text and that all `user_id` FKs are text. Note that account deletion goes through Better Auth's delete-user API so its own tables are cleaned up as well.

### 20. Fixtures and clock — low

**Where:** AD-14 (seed A–D), AD-15 (tests A–D), AD-11.
**Problem:** Profiles A–D will be written twice (seed and Vitest fixtures). Seeded "plan and some logs" written as fixed dates go stale when an examiner runs the app weeks later. E2E tests need a controllable "today".
**Fix:** Define A–D once (`shared/engine/fixtures/profiles.ts`) and use it from both the seed and the tests. Seed logs relative to the current Monday in Europe/Oslo. All "today" values come from one `now()` in `shared/lib/dates` and are passed into the engine. Tests inject a date, never the system clock.

### 21. Capability map gaps — low

**Where:** Capability → Architecture Map.
**Problem:** NFR2, NFR3, NFR4, NFR7, NFR9 and NFR10 are bound in the frontmatter but absent from the map. E1–E4 are bound but not mapped. FR17 needs reads from plan (next session) and the R14 goal check, which isn't shown. The motivational quote list (FR17) and the R11 constant have no stated home.
**Fix:** Add rows: NFR2/NFR3 → `shared/auth`, AD-4, AD-6; NFR4 → AD-10; NFR7 → AD-8; NFR9 → AD-4, AD-7; NFR10 → Conventions plus one place for user-facing strings (for example `features/<slice>/texts.ts`, R11 in `features/coach/texts.ts`, quotes in `data/quotes.json`). Map E1–E4 to slices, or drop them from `binds`.

### 22. Live-provider timeout and retry not set — low

**Where:** AD-8, NFR7.
**Problem:** "Timeout" is listed as a failure case, but no value is given. The SDK default timeout is long, and its retries can push a single chat turn past the Vercel function limit.
**Fix:** State a client timeout (for example 20 s), `maxRetries: 1`, and a Vercel `maxDuration` above that for the coach action.

### 23. Source tree omissions — low

**Where:** Structural Seed text tree.
**Problem:** AD-14 implies a Dockerfile, a migration config and a README (NFR5, Story 1.1), but the tree doesn't show them. It also has no `proxy.ts` (#13), no seed entry point and no ESLint/Prettier config.
**Fix:** Add `Dockerfile`, `drizzle.config.ts`, `README.md`, `src/proxy.ts`, `src/shared/db/seed.ts`, `eslint.config.mjs` and `.prettierrc` to the tree.

---

## Checklist results

| Check | Result |
| --- | --- |
| Real divergence points fixed, none missed | Partly. Missed: session identity across versions (#1), proposal vocabulary (#3), week generation (#4), exercise ids (#10), set idempotency (#11), auth guard (#13) |
| Every Rule enforceable and prevents its divergence | Mostly. AD-1 and AD-3 conflict (#2); AD-3 is broken by its own table (#12); AD-7 doesn't prevent double logging across versions (#1) |
| Deferred items can't let units diverge | No. Exercise format (#10) and the NFR11 storage choice (#11) can; rate limiting carries risk (#8). Supabase version, CI, key holder and the stage 2/3 items are fine |
| Tech plausibly current | Yes, versions were checked against npm on 2026-11-16 (memlog). TS 7 needs a compatibility check (#15); Docker Compose is unpinned (acceptable) |
| PRD capabilities covered | Mostly. FR1–FR17 and NFR1–NFR11 all have a home, but FR13's swap path (#5) and NFR5's wording (#6) are not satisfied, and several NFRs are missing from the map (#21) |
| Every dimension decided, deferred or open | No. Deployment & environments (#7), health-data region (#16) and production coach operations (#8) are partly silent. There is no Open Questions section at all (#6) |
| Mermaid valid and consistent | All three diagrams parse. The dependency diagram contradicts AD-3 (#2, #17), and the ER diagram misses parts of AD-7 and AD-3 (#18) |
