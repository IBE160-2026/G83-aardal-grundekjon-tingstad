---
review: adversarial
target: ../ARCHITECTURE-SPINE.md (draft, 2026-11-16)
context: ../../../prd-flex-pt.md (v1.1), stories in section 5, rules R1–R14 in Appendix A
date: 2026-11-16
---

# Adversarial review — Architecture Spine, Flex PT v1

## Verdict

**Not ready to build from in parallel.** The ADs are sound in direction (pure engine, one owner per entity, immutable versions, provider interface), but the spine never defines the shared shapes those ADs depend on: what a plan version spans, how a planned session keeps its identity across versions, what a proposal looks like, and how one slice calls another. Two developers can follow every AD to the letter and still produce slices that do not fit together. One AD pair (AD-1 vs AD-3) contradicts itself outright.

Method: for each hole, two units one level down (stories from PRD section 5) are built by different developers or agents. Each obeys every AD literally. The result is still incompatible. Each hole ends with a proposed new or tightened AD rule.

Severity scale: **critical** = the slices cannot be merged or core flows break; **high** = a visible bug in a PRD flow or a broken rule R1–R14; **medium** = rework or an edge-case defect; **low** = a cosmetic or documentation inconsistency.

## Summary

| # | Hole | Severity | Units in conflict |
| --- | --- | --- | --- |
| H1 | AD-1 forbids cross-slice imports, but AD-3 requires them | critical | 4.3 vs 2.2; 1.3 vs 2.2; 3.3 vs 3.1 |
| H2 | Planned-session identity is lost when a new version is created | critical | 3.1 vs 4.3 / 1.3 |
| H3 | What a plan version spans, and whether week generation creates one | critical | 2.2 vs 4.3 |
| H4 | The proposal shape is defined twice, and nobody owns the "after" values | critical | 4.2 vs 2.2 (engine) |
| H5 | The medical pre-check blocks the "knee hurts → swap" flow; AD-10 kills its follow-up | high | 4.4 vs 4.5 / 4.1 |
| H6 | Approval idempotency and the transaction belong to two owners | high | 4.3 vs 2.2 |
| H7 | "Current plan version" and "current program" are computed differently | high | 2.3 vs 4.3; 2.4 vs 1.3 |
| H8 | Day exclusions: recurring weekday or dated, program or week scope | high | 4.2/4.3 vs 2.2 |
| H9 | R8 reduction leaves no marker that progression can find | high | 4.2 vs 3.3 |
| H10 | Session status and exercise completion are derived in two places | high | 3.1 vs 3.3 |
| H11 | Running goal reached: who detects it, who stores it, who resets it | high | 3.4 vs 2.4 vs 1.3/profile |
| H12 | Lazy next-week generation is a write on a read path | high | 2.2 vs 2.3 / 4.1 / 3.4 |
| H13 | Demo data: hand-seeded plans and recorded responses with absolute ids and dates | high | 1.4 vs 2.2; 1.4 vs 4.5 |
| H14 | Demo provider lookup key is undefined | medium | 4.1 vs 4.5 |
| H15 | Profile change → replan: push or pull, and which changes start a new program | high | profile (1.3) vs 2.2 / 2.4 |
| H16 | Program week index and the first, partial week | medium | 2.4 vs 2.2 (R7 first-week fast run) |
| H17 | Recommended load: materialised on the version or computed at render | medium | 2.3 vs 3.1 |
| H18 | Exercises inside a planned session: child table or JSON; exercise ids | medium | 2.1/2.2 vs 3.1 |
| H19 | The engine's clock and the library as engine inputs | medium | 2.2 vs 3.3 tests |
| H20 | Log dates: planned date vs performed date vs UTC moment | medium | 3.1 vs 3.3 (R7 30-day window) |
| H21 | Proposal lifecycle and storage of rejected / rule-breaking proposals | medium | 4.2 vs 4.3 |
| H22 | A plan change during an in-progress session | medium | 3.1 vs 4.3 |
| H23 | User-chosen exercise order: who owns it | low | 2.3 vs 3.1 |
| H24 | Better Auth id type vs the UUID convention | medium | 1.2 vs 1.3 / 1.5 |
| H25 | Duration, pace and bodyweight-load formats | low | 3.1 vs 3.4 / 2.3 |
| H26 | `medicalCondition: true` alongside a proposal | medium | 4.2 vs 4.4 |
| H27 | NFR5 says SQLite; AD-5 says PostgreSQL; AD-5 binds NFR5 | low | documentation |

---

## Holes

### H1 — AD-1 forbids cross-slice imports, but AD-3 requires them · critical

**Contradiction.** AD-1 says "A feature slice may import only from `src/shared/` and its own folder" and the invariant says "A slice never imports from another slice". AD-3 says other slices read an entity "through the owner's exported query functions", and that `coach` "applies an approved proposal by calling `plan`'s exported function". You cannot follow both.

**Unit A — Story 4.3 (coach, approve).** Dev A follows AD-1. Coach may not import `features/plan`, so Dev A moves an `applyProposal` into `src/shared/db/plan-writes.ts` ("code needed by two slices moves to shared"). That function now writes `plan_version` from outside the owning slice.
**Unit B — Story 2.2 (plan).** Dev B follows AD-3 and exports `createPlanVersion()` from `features/plan/server/actions.ts`, with its own Zod checks and the rule that every write lives in the owner.
**Clash.** There are now two writers of `plan_version`, each with different validation. The same split repeats for: onboarding step 5 creating program and version (1.3 → plan); profile replanning (profile → plan); plan's progression reading logs (plan → logging, 3.3); logging's "next planned session" on the finished-session screen (logging → plan, 3.4); coach reading the current version for the provider (coach → plan).

**Proposed rule (tighten AD-1 and AD-3).**
> Each slice has one public surface, `src/features/<slice>/api.ts`, exporting only query functions and *commands*: plain async functions that take `userId` as an explicit argument. The public surface is the only cross-slice import allowed, and an ESLint `no-restricted-imports` rule enforces this. Server Actions call commands; a command never calls `getCurrentUser()` itself. Required surfaces: `plan.api` exports `getCurrentPlan`, `ensureCurrentWeek`, `createProgram`, `applyProposal`, `replanFromProfile`; `logging.api` exports `getLogsForEngine`, `getSessionLog`; `onboarding/profile.api` exports `getProfile`. Nothing that writes an entity lives in `shared/`.

### H2 — Planned-session identity is lost when a new version is created · critical

AD-7 makes versions immutable and says a new version "points to the previous one". The ER diagram puts `PLANNED_SESSION` under `PLAN_VERSION`, and the session log has a unique key on (planned session). So every new version must create new `planned_session` rows with new UUIDs.

**Unit A — Story 3.1 (logging).** Session logs have `planned_session_id` as a FK with a unique key, as AD-7 says. The user logs Tuesday's session against v3.
**Unit B — Story 4.3 / FR3 (approve or profile change).** This creates v4 and copies the remaining sessions with new ids. Tuesday's row in v4 has a new id with no log.
**Clash.** The week plan (2.3) reads v4 and shows Tuesday as not logged. The counter "X av Y" drops. The user can log Tuesday again against the new id, and the unique key does not stop it, which breaks NFR9. FR3's "sessions already logged are kept" has no defined mechanism: does v4 copy logged sessions, or leave them out? Progression (3.3) joins logs to the v3 rows and v4 rows differently.

**Proposed rule (new AD, "Session slots").**
> A planned session has a stable `slot_id` (UUID), created when the session is first generated and copied unchanged into every later version that keeps that session. A moved session keeps its slot; a removed one is gone from the new version; a new one gets a new slot. `session_log` references `slot_id`, unique on (`user_id`, `slot_id`). A new version always copies past and logged slots unchanged, and the engine rejects any proposal that touches a logged or past slot. Views join logs on `slot_id`, never on the planned-session row id.

### H3 — What a plan version spans, and whether week generation creates one · critical

AD-7 lists three things that create a version: approval, profile change, and new program. FR4 next-week generation is not on the list. The spine never says whether a version holds one week or the whole program.

**Unit A — Story 2.2 (plan engine and week generation).** Dev A treats a version as a program-long container. On a new week, Dev A *appends* that week's `planned_session` rows to the current version, since "generation" is not a versioning event in AD-7. That edits a version, which AD-7 forbids in its first sentence, so Dev A may instead conclude that generation does not count as editing.
**Unit B — Story 4.3 (approve).** Dev B treats a version as a one-week snapshot and checks `proposal.base_version_id == current`.
**Clash.** If week generation appends, a proposal made Sunday at 23:50 still validates on Monday against a version that now holds a different week. If generation creates a new version, Dev A's queries that read "all sessions of the version" lose last week. In both cases R8 ("not carried forward") and exclusions (H8) behave differently depending on whether next week is built from the latest version's contents or from the template.

**Proposed rule (tighten AD-7).**
> A plan version covers exactly one plan week (`program_id`, `week_start`), unique on (`program_id`, `week_start`, `version_no`). Week generation creates version 1 of the new week, with `previous_version_id` set to the last version of the prior week. Only the newest version of the current week is "current". Next week is always generated by the engine from (profile, program, template, logs, standing exclusions), never by copying last week's sessions, so one-week changes (R8, a single moved session) cannot carry forward. A proposal whose base version is from an earlier week is rejected as stale.

### H4 — The proposal shape is defined twice, and nobody owns the "after" values · critical

The coach result schema lives in `shared/coach-provider` (Conventions). `engine.validateProposal` takes a "proposal" as plain data (AD-2), but the engine may import only `shared/lib`, so it cannot import that schema. The spine never says what a proposal *contains*.

**Unit A — Story 4.2 (coach schema).** Dev A designs the schema the language model fills in: a full replacement week, `sessions: [{date, type, exercises:[{name, sets, reps, loadKg}]}]`. Validation goes through Zod. For R8 the model writes `sets: 3`.
**Unit B — Story 2.2 (engine).** Dev B defines `type Proposal = { ops: Array<{kind:'move', slotId, toDate} | {kind:'remove', slotId} | {kind:'reduce', slotId}> }` in `shared/engine/types.ts`.
**Clash.** The shapes do not map onto each other. Dev A's version lets the model set loads and set counts, which breaks AD-2 ("No other code computes loads") and Story 4.2 ("the code sets the size of the reduction"). Exercise names from the model do not resolve to library ids. Neither side owns the before → after diff on the proposal card (FR11): the coach computes it from the model's output, or the engine computes it from the ops.

**Proposed rule (new AD, "Proposals are intents").**
> A proposal is a list of *intent operations* defined once as TypeScript types in `shared/engine/proposal.ts`: `excludeDates`, `moveSession(slotId, toDate)`, `removeSession(slotId)`, `reduceR8(slotId, reason: 'energy'|'time')`, `swapExercise(slotId, exerciseId, toExerciseId?)`, `setSessionCount(n)`. Operations carry no loads, distances, set counts or percentages. The Zod schema in `shared/coach-provider` is derived from these types and checked by a compile-time equality test. Slots and exercises are referenced by short keys given to the model in its input (H18), never as free text. `engine.applyProposal(plan, ops, ctx)` returns either `{ ok, after, diff }` or `{ ok:false, brokenRules }`; the card renders `diff` only.

### H5 — The medical pre-check blocks the "knee hurts → swap" flow; AD-10 kills its follow-up · high

AD-9 says a word-list match returns the fixed R11 reply and "does not send the message". FR13 and Appendix C require that "My knee hurts" also gets a question about swapping the affected exercise. AD-10 says earlier chat history is never sent.

**Unit A — Story 4.4 (coach medical check).** Dev A follows AD-9 literally. "kneet" matches, the fixed reply is returned, the call stops, and no swap question is asked.
**Unit B — Story 4.5 (scenario tests, Demo provider).** Dev B records a demo response for "My knee hurts" with `medicalCondition: true`, a reply and a `swapExercise` proposal. The provider is never called, so that recording is dead and the Appendix C row fails.
**Second clash.** If Dev A does ask the swap question, the user's reply "ja" reaches the provider with no history (AD-10) and no plan context about the knee. The model cannot know which exercise to swap.
**Also unspecified:** whether the list tells "knee" (a body part, which gets the swap offer) apart from "chest pain" (a general symptom, no offer), and whether English input is covered (Appendix C is written in English).

**Proposed rule (tighten AD-9).**
> The medical check is a pure function `classifyMedical(text) → { match: false } | { match: true, bodyParts: BodyPart[] }`, kept in `shared/lib` and fed by two Norwegian lists: symptoms (no swap offer) and body parts mapped to library muscle groups. On a match, nothing goes to any provider. The app shows the R11 constant. If `bodyParts` is not empty and at least one upcoming slot in the current version trains those muscle groups, the coach slice offers in code a "Bytt øvelse" action per affected exercise. That action builds a `swapExercise` intent directly (the engine picks the replacement, R5) and goes through the normal validate → card → approve path. No language-model turn and no chat history are needed. The Demo recordings for medical scenarios are removed, since the provider is never reached.

### H6 — Approval idempotency and the transaction belong to two owners · high

AD-7 asks for "a unique key on (proposal) for an approval" but does not say which table holds it. AD-3 gives `change_proposal` to coach and `plan_version` to plan.

**Unit A — Story 4.3 (coach).** Dev A adds `approved_at` and a status on `change_proposal`. Coach sets the status first, then calls plan.
**Unit B — Story 2.2 (plan).** Dev B adds `plan_version.source_proposal_id UNIQUE` and returns the existing version on conflict.
**Clash.** On a double click, request 1 sets the status and request 2 sees "approved" and returns early, *before* request 1's version is committed, so the UI shows an older plan. If plan's insert fails (a stale base), coach has already marked the proposal approved. There are two sources of truth for "is this approved".

**Proposed rule.**
> Approval is one command, `plan.api.applyProposal(userId, proposalId)`, run in one DB transaction that (1) locks the proposal row (`SELECT … FOR UPDATE`), (2) returns the existing version if `plan_version.source_proposal_id = proposalId` already exists (unique), (3) rejects if the base version is not current, (4) re-runs `engine.applyProposal` on the current data, since logs may have changed since the proposal was made, (5) inserts the version and its slots, and (6) sets the proposal status. Plan may write the proposal's `status` column only inside this command. This is the one sanctioned exception to AD-3, and the spine names it.

### H7 — "Current plan version" and "current program" are computed differently · high

There are many programs per user (USER ||--o{ PROGRAM) and many versions per program, but no rule picks the current one.

**Unit A — Story 2.3 (week plan view).** The current version is `ORDER BY created_at DESC LIMIT 1`.
**Unit B — Story 4.3 (stale check).** The current version is `MAX(version_no)` within the active program, where the active program is `ended_at IS NULL`.
**Clash.** After a new program (2.4) or a focus change, the old program's last version can have a later `created_at` than the new program's v1 if they are created in the same request. The two queries then disagree, and a proposal approved against the "wrong current" passes or fails at random. Story 2.4's "Fortsett med dette" adds no rows, so it is unclear whether the program is still "in week 9" or rolls into week 10 of the same program.

**Proposed rule.**
> `user_state` (owned by plan) holds `current_program_id`. `program` holds `current_version_id`. Both are updated only inside plan's commands, in the same transaction as the insert. The single query `plan.api.getCurrentPlan(userId)` is the only way any slice resolves "current". Ordering by timestamp is banned for this purpose.

### H8 — Day exclusions: recurring weekday or dated, program or week scope · high

The ER diagram has `PROGRAM ||--o{ DAY_EXCLUSION`. R9 says no sessions "on days the user has told the coach they cannot train". The scenario "I'm away Thursday to Sunday" is about one week.

**Unit A — Story 4.2/4.3 (coach).** Dev A emits `excludeDays: ['thu','fri','sat','sun']`, and plan stores them as weekday rows on the program.
**Unit B — Story 2.2 (engine).** Dev B reads exclusions as dates (`YYYY-MM-DD`) and applies them only within the matching week.
**Clash.** With A's data, every later week also skips Thursday to Sunday, so a four-session runner is squeezed into three days for the whole program, which breaks R2 and R9. With B's reading, the weekday rows never match a date, and the exclusion has no effect even this week. It is also unspecified whether an exclusion is a separate entity written on approval or just a fact implied by the version's sessions.

**Proposed rule.**
> A day exclusion is either `{kind:'date', date}` (one-off) or `{kind:'weekday', weekday}` (standing, until removed). It is created only by approving an `excludeDates`/`excludeWeekdays` intent, written in the same transaction as the version. Dated exclusions affect only the week that contains them; weekday exclusions are input to every later week generation. The coach input marks which kind the user meant, and the default is `date`.

### H9 — R8 reduction leaves no marker that progression can find · high

R12 and the progression table say "Sessions reduced by R8 … are skipped". The spine gives no place to record that a session was R8-reduced.

**Unit A — Story 4.2 (coach).** Dev A records `reason: 'R8'` on `change_proposal` only. The approved version just holds the session with 3 sets instead of 4.
**Unit B — Story 3.3 (progression).** Dev B checks `planned_session.reduced_by_r8` on the slot of each log, finds no such column, and treats the session as normal. A "hard" on the reduced session then counts towards R12, and a "completed, ok" on 3 of the 4 original sets progresses the load, both against the table.
**Clash.** The two developers disagree on where the flag lives, and nothing in the spine decides it.

**Proposed rule.**
> Every planned session carries `adjustments: Array<'R8_energy'|'R8_time'|'swapped'|'moved'>`, set only by `engine.applyProposal`. The engine's progression functions read the flag only from the slot the log points to. Logging copies the planned targets (sets, reps, load, distance) into the session log when it is created, so a later version cannot change what the log was measured against.

### H10 — Session status and exercise completion are derived in two places · high

FR7 says status is derived from sets. R6 says an exercise is completed when "all its planned sets" are completed. AD-2 bans rule checks outside the engine, but "derive the status" is not named as an engine function.

**Unit A — Story 3.1 (logging).** Dev A stores `session_log.status` computed in the logging slice. A removed set lowers the planned count, so 3 of 3 logged gives "completed".
**Unit B — Story 3.3 (engine).** Dev B recomputes completion from the raw `set_log` rows against the *planned* sets, so 3 of 4 gives "not completed".
**Clash.** The finished-session screen says "Fullført" while next week holds the load. It is undefined whether "remove a set" means the user did fewer sets (an incomplete exercise) or deleted a wrong entry.

**Proposed rule.**
> `engine.deriveStatus(plannedTargets, setLogs) → { session: 'completed'|'partly'|'not', perExercise }` is the only derivation. Logging calls it on "Fullfør økt" and stores the result, and progression uses the same function. "Remove a set" deletes a wrongly logged entry. The planned set count never changes during logging, and to do fewer sets the user logs 0 reps.

### H11 — Running goal reached: who detects it, who stores it, who resets it · high

`program.running_goal_reached` is owned by plan (AD-3). The celebration happens on the finished-session screen (logging, FR17/3.4). The goal is set in Profil (profile slice).

**Unit A — Story 3.4 (logging).** Dev A checks `distance >= goalKm && status == completed` inside the logging slice to show the celebration. That is a rule check outside the engine (breaks AD-2), and logging may not write plan's flag.
**Unit B — Story 2.4 (plan).** Dev B sets the flag during next-week generation, a week late, so the finished-session screen never sees it.
**Unit C — profile.** Profile changes `profile.goal` but cannot reset plan's flag, so a new goal is never celebrated.
**Clash.** These are three units with three different rules for the same fact.

**Proposed rule.**
> `engine.isRunningGoalReached(goal, runLog)` is the only check. Logging's finish command calls `plan.api.recordRunCompleted(userId, slotId)`, which runs the check and sets `program.goal_reached_at` in the same transaction, then returns `{ goalReached }` for the screen. A running-goal change in Profil calls `plan.api.replanFromProfile`, which starts a new running program (H15), so `goal_reached_at` is reset by construction.

### H12 — Lazy next-week generation is a write on a read path · high

FR4 says next week is generated "the first time the user opens the app in the new week". AD-4 says writes happen only in Server Actions or Route Handlers. Opening the app is a GET that renders a Server Component.

**Unit A — Story 2.2.** Dev A follows AD-4 and generates the new week in a Server Action fired from a client `useEffect` on the week plan.
**Unit B — Story 4.1 / 3.4.** Dev B's coach page (or the finished-session "next session") reads `getCurrentPlan` on Monday before the user has opened the week plan, and gets last week's version. The coach proposes changes against last week, and approval is rejected as stale (or, under H3's ambiguity, accepted).
**Also:** two tabs open at once → two generations. "Only once" (2.2) has no enforcement.

**Proposed rule.**
> `plan.api.ensureCurrentWeek(userId, todayOslo)` is idempotent: it uses the unique key (`program_id`, `week_start`, `version_no=1`) and `INSERT … ON CONFLICT DO NOTHING`. `getCurrentPlan` calls it every time, so every read entry point sees the current week. AD-4 is amended to allow this one named idempotent write from server-side reads. The new-week banner is derived (no log in the current week yet), not stored.

### H13 — Demo data: hand-seeded plans and recorded responses with absolute ids and dates · high

AD-14 says compose seeds demo users for profiles A–D. Story 1.4 asks for "each with a plan and some logs". The seed lives in `shared/db` (spine tree), outside every owning slice, and AD-2 says no code but the engine computes plans.

**Unit A — Story 1.4 (seed).** Dev A writes SQL/TS fixtures with fixed plan rows and logs dated `2026-11-17`, and session ids hardcoded so the demo recordings can point at them.
**Unit B — Story 2.2 (engine).** Dev B's generated plan for profile B uses different exercises, or a slightly different template, than the hand-written seed.
**Clash.** Demo users show plans the engine would never produce, which hides engine bugs from the examiner. After a week, all seeded logs are in the past and the "current week" is empty, so `ensureCurrentWeek` produces a week with no history, or logs reference slots that do not exist. The recorded coach responses (4.5) refer to hardcoded ids and break as soon as the seed is regenerated. Rerunning `docker compose up` either duplicates demo users or wipes changes. On Vercel, every examiner who presses "Prøv demo" shares one user, and the spine does not say which of the four users that is.

**Proposed rule (new AD, "Demo data is generated, relative and resettable").**
> Profiles A–D exist once as engine fixtures in `shared/engine/fixtures.ts`, used by both the Vitest tests and the seed. The seed creates demo users only through the slices' public commands (`onboarding.api`, `plan.api`, `logging.api`), so every plan comes from the engine. All seeded dates are relative to the seed's `todayOslo`: program start is two weeks back, with logs for those weeks. The seed is idempotent per demo user: it deletes and recreates that user only. "Prøv demo" opens a picker for A–D, defaulting to D (the profile with the most scenarios). Demo users are flagged `is_demo`, are reset by an action on the badge, and cannot be deleted through FR16.

### H14 — Demo provider lookup key is undefined · medium

AD-8 says recordings are "keyed by the Appendix C scenarios", but the spine does not say how a typed message maps to a key.

**Unit A — Story 4.1 (Demo provider).** Dev A matches exact Norwegian strings ("Jeg er bortreist torsdag til søndag").
**Unit B — Story 4.5 (tests and e2e).** Dev B's Playwright test types the English Appendix C text. An examiner types "borte tor–søn".
**Clash.** Every input that does not match exactly falls into an undefined path: an error, an empty reply, or a crash. Recordings that hold a proposal with absolute slot ids break against a freshly seeded user (see H13).

**Proposed rule.**
> Each recording file holds `{ id, profile, triggers: string[] (normalised Norwegian keywords), result }`. Matching lowercases the text, strips diacritics and picks the first recording whose triggers all occur. When nothing matches, the provider returns a fixed Norwegian "I demo-modus forstår coachen bare eksempelmeldingene: …" result listing the example prompts, and the chat UI shows those prompts as suggestion chips. A recorded `result` refers to slots by relative key (`today`, `next:long`, `weekday:thu`), which the coach slice resolves against the current version before validation.

### H15 — Profile change → replan: push or pull, and which changes start a new program · high

FR3 says a confirmed profile change gives a new version from today. R13 says a focus change restarts the week count, so it is a new program, while other changes do not. AD-7 lists "a profile change" as creating a *version*. Onboarding *creates* the profile, profile *updates* it, and plan owns program and version.

**Unit A — profile slice (1.3 AC4).** Dev A updates `profile` and expects plan to notice ("pull") at the next `getCurrentPlan`.
**Unit B — Story 2.2/2.4 (plan).** Dev B expects an explicit `replan` call ("push"), and treats every profile change as a new version of the same program, focus included.
**Clash.** Either the plan never updates, or switching from strength to running keeps the strength program's week count and its 8-week card. It is unclear whether onboarding step 5 creates program and v1 through plan, or whether onboarding writes those rows itself. "After the user confirms" also needs a preview: neither slice owns the preview.

**Proposed rule.**
> Profile and onboarding never write plan entities. Onboarding finishes by calling `plan.api.createProgram(userId, profile, todayOslo)`. The profile slice's confirm action updates the profile and calls `plan.api.replanFromProfile(userId, oldProfile, newProfile, todayOslo)` in one transaction. Plan decides between *new program* (focus, running goal, or sessions per week? the team must decide R13's scope here) and *new version of the current week*. The preview uses the same plan function with `dryRun: true`.

### H16 — Program week index and the first, partial week · medium

AD-11 fixes Monday–Sunday but does not define "week 9 counted from the program start" (R13) or the "first plan week" (R7 fast-run distance).

**Unit A — Story 2.4.** Week n is `floor((today − start_date)/7) + 1`. A program started on Wednesday rolls weeks on Wednesdays.
**Unit B — Story 2.2.** Week n is counted by Monday boundaries from the Monday on or before `start_date`.
**Clash.** The week-9 card shows on different days, and the R7 fixed fast-run distance is taken from different weeks. Onboarding on Friday with the pattern Mon/Wed/Sat leaves it undefined whether Monday and Wednesday are generated in the past (and count as "not logged" in the counter) or left out.

**Proposed rule (tighten AD-11).**
> `shared/lib/dates` exports `weekStart(dateOslo)` and `programWeekIndex(programStart, todayOslo) = (weekStart(today) − weekStart(programStart))/7 + 1`. Week 1 is the week containing the program start. In week 1, sessions are generated only on pattern days ≥ the start date. The counter "X av Y" counts only generated slots. R7's "first plan week" is the first week that contains an easy short run.

### H17 — Recommended load: materialised on the version or computed at render · medium

FR5 shows the previous load and the recommended load. AD-2 says only the engine computes loads, but not *when*.

**Unit A — Story 2.3 (plan view).** Dev A computes the recommended load at render time from the latest logs.
**Unit B — Story 3.1 (logging).** Dev B pre-fills each set from `planned_session.target_load_kg`, which was stored when the week was generated.
**Clash.** An exercise appears twice in a week (full body ×3). After Monday's log, the plan view shows a higher recommendation for Thursday than the logging screen pre-fills. Progression is meant to apply "next week" (FR14), so render-time computation also breaks that rule.

**Proposed rule.**
> All targets (sets, reps, load, distance, R8 adjustment) are materialised on the slot when the version is created and never recomputed at render. "Previous load" and "previous pace" come from a single `logging.api.getLastResult(userId, exerciseId | runType)`. The first time an exercise is done, the target load is `null` and the UI shows sets × reps only.

### H18 — Exercises inside a planned session: child table or JSON; exercise ids · medium

The ER diagram has no planned-exercise entity. `SET_LOG` must point at *something*.

**Unit A — Story 2.2.** Dev A stores exercises as JSONB on `planned_session` and uses Free Exercise DB string ids (`Barbell_Squat`).
**Unit B — Story 3.1.** Dev B's `set_log` has `planned_exercise_id uuid FK`, assuming a child table, following the UUID convention.
**Unit C — Story 2.1.** Dev C puts the library in a DB table with UUIDs. Dev A instead imports the JSON from `data/exercises/` straight into the engine, an import outside `shared/lib` that AD-2's purity forbids.
**Clash.** The FKs do not resolve, and the ids do not match.

**Proposed rule.**
> `planned_exercise` is a child table of `planned_session` (`slot_exercise_key` is stable across versions, like `slot_id`). `exercise_id` is the library's own stable string id, an explicit exception to the UUID convention. The library is a JSON file in `data/exercises/`, loaded by a `shared/lib/exercise-library.ts` loader that validates it with Zod at startup, and is passed to the engine as an argument. `set_log` references (`session_log_id`, `exercise_id`, `set_index`).

### H19 — The engine's clock and the library as engine inputs · medium

AD-2's purity rule bans imports, not ambient inputs.

**Unit A — Story 2.2.** Dev A calls `new Date()` and `Math.random()` (for exercise variety, R13) inside the engine. No import is broken.
**Unit B — Story 3.3 / AD-15 tests.** Dev B's tests for profiles A–D are flaky by weekday and by random seed, and the demo seed differs on every boot.
**Proposed rule.**
> Engine functions are deterministic: `todayOslo`, the library, and an optional `seed` are explicit parameters. A lint rule bans `Date`, `Math.random`, `process` and `fs` in `shared/engine`. Exercise choice is deterministic for a fixed seed (for example, the user id).

### H20 — Log dates: planned date vs performed date vs UTC moment · medium

AD-11 stores planned days as dates and log time as UTC. R7's 30-day window and "last completed week" need a *date* per run.

**Unit A — Story 3.1.** Dev A stores only `logged_at timestamptz`.
**Unit B — Story 3.3.** Dev B attributes a run to `planned_session.date`. A Sunday long run logged Monday at 00:30 Oslo time falls in the next week by A's data and the previous week by B's. The weekly-distance 10 % cap then compares the wrong weeks.
**Proposed rule.**
> `session_log` stores `performed_on date` (Oslo time, set on the server from `todayOslo` at the first logged set) besides `finished_at timestamptz`. All engine windows (R7 30 days, weekly distance, R12 order) use `performed_on`, with the slot's week as a tie-breaker. A session can be logged only for a slot in the current week, and only on or after its planned date (or the team writes down another rule).

### H21 — Proposal lifecycle and storage of rejected / rule-breaking proposals · medium

**Unit A — Story 4.2.** Dev A drops rule-breaking proposals without storing them (FR12: "discarded") and stores only a coach message explaining why.
**Unit B — Story 4.3.** Dev B's card loads `proposal` by `coach_message.proposal_id` and expects a status enum `pending|approved|rejected|stale`. Several pending proposals stay "pending" after a newer one is approved, and the UI shows active Approve buttons that always fail as stale.
**Proposed rule.**
> `change_proposal.status ∈ {pending, approved, rejected, stale, invalid}`. An invalid proposal is stored with `broken_rules` (to support FR12 and the test evidence) and is never shown as a card. Approving one proposal marks every other pending proposal of that user `stale` in the same transaction. The chat renders the card's state from the status.

### H22 — A plan change during an in-progress session · medium

NFR11 allows a session to be in progress (sets saved one by one). R8 is typically asked for *today*.

**Unit A — Story 3.1.** The in-progress log is bound to slot S with 4 planned sets.
**Unit B — Story 4.3.** The user tells the coach mid-session that they are tired. Approval creates a new version where S has 3 sets (or a swapped exercise).
**Clash.** It is undefined whether the open log follows the new targets. With H9's copy of the targets, it does not, and the reduction has no effect. Without the copy, completion is judged against targets the user never saw.
**Proposed rule.**
> A slot with a started log is *locked* for proposals. The engine rejects operations that touch it, and the coach says so ("Økten er allerede i gang"). R8 then applies to the next session (R8's own fallback).

### H23 — User-chosen exercise order: who owns it · low

FR5 says the user chooses the order. It is not listed in AD-3.
**Unit A — 2.3** stores the order on `planned_exercise.position` (plan owns it). **Unit B — 3.1** lets the user reorder during logging and needs to write it, but may not write plan's table.
**Proposed rule.**
> The chosen order is session-log data (`set_log` order, or `session_log.exercise_order`), owned by logging. The planned order is only the default.

### H24 — Better Auth id type vs the UUID convention · medium

The conventions say "UUID primary keys". Better Auth's Drizzle adapter generates `text` ids by default.
**Unit A — 1.2** keeps the default `user.id text`. **Unit B — 1.3/1.5** writes `profile.user_id uuid REFERENCES user(id) ON DELETE CASCADE`, and the migration fails, or the cascade (FR16) is missing.
**Proposed rule.**
> Either configure Better Auth's id generation to UUID (`advanced.database.generateId`) and type `user.id` as `uuid`, or state that `user_id` FKs are `text`. Every user-owned table has `user_id … NOT NULL REFERENCES user(id) ON DELETE CASCADE`, and a test checks that deleting a user leaves zero rows in every user-owned table.

### H25 — Duration, pace and bodyweight-load formats · low

**Unit A — 3.1** stores run time as a `"mm:ss"` string and bodyweight load as `0`. **Unit B — 3.4/2.3** computes pace from `duration_seconds integer` and treats `load_kg = 0` as "a starting load of 0 is logged", so R6 then tries to add 10 % of 0 and falls back to +1 rep, which happens to be right but for the wrong reason.
**Proposed rule.**
> Durations are stored as integer seconds and pace is derived (sec/km). `load_kg` is `numeric(5,1)`, `null` for bodyweight exercises, and the engine branches on the library's `bodyweight` flag, never on the load value.

### H26 — `medicalCondition: true` alongside a proposal · medium

AD-9 says to show the R11 reply "instead of the model's text". It does not say what happens to a proposal in the same result.
**Unit A — 4.4** replaces the text but still renders the proposal card. **Unit B — 4.2** validates and stores the proposal as pending.
**Clash.** A pain message then yields an approvable plan change straight away, which goes against "no automatic plan change" and the spirit of R11.
**Proposed rule.**
> When `medicalCondition` is true, the whole result is replaced: the reply is the R11 constant, any proposal is dropped and not stored, and the H5 swap offer (built in code) applies.

### H27 — NFR5 says SQLite; AD-5 says PostgreSQL; AD-5 binds NFR5 · low

This is not a parallel-build clash, but a reviewer reading the trace links finds AD-5 "binding" a requirement it contradicts. A developer reading the PRD for Story 1.1 may set up SQLite.
**Proposed rule.**
> Add a line to the spine's Deferred list or a PRD change (correct-course) that replaces NFR5's SQLite with "PostgreSQL via `docker compose`, with no external account needed", and note the deviation in PRD §7.

---

## Rules to add to the spine (consolidated)

1. **AD-1/AD-3 amendment: slice public surface** (`features/<slice>/api.ts`, commands take `userId`, lint-enforced). Fixes H1, H6, H11, H15.
2. **New AD: session slots** (stable `slot_id`/`slot_exercise_key`, logs reference slots, logged and past slots immutable). Fixes H2, H18, H22.
3. **AD-7 amendment: a version is one week**; week generation creates v1 of the week; current version is a pointer; one idempotent `ensureCurrentWeek`. Fixes H3, H7, H12.
4. **New AD: proposals are intent operations** typed in the engine, with the provider schema derived from them; engine returns `after` + `diff`; model never sets values. Fixes H4, H8, H9, H14.
5. **AD-9 amendment: `classifyMedical` with body parts → code-built swap offer**; `medicalCondition` drops the whole result. Fixes H5, H26.
6. **New AD: demo data generated through slices from engine fixtures, relative dates, idempotent per user, demo picker, resettable.** Fixes H13, H14.
7. **AD-11 amendment: `weekStart`, `programWeekIndex`, `performed_on`, partial first week.** Fixes H16, H20.
8. **AD-2 amendment: determinism** (clock, library and seed as parameters; `deriveStatus`, `isRunningGoalReached` and progression live only in the engine; targets materialised on slots). Fixes H10, H11, H17, H19.
9. **Conventions additions:** proposal status enum, integer seconds, nullable `load_kg`, the auth id type and a cascade test. Fixes H21, H24, H25.
