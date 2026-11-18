# Review: reconcile spine against PRD v1.1 and UX

**Reviewed:** `ARCHITECTURE-SPINE.md` (draft, 2026-11-16) against `prd-flex-pt.md` (v1.1), `EXPERIENCE.md`, `DESIGN.md` and `.memlog.md`.
**Lens:** what in the PRD or UX did not land in the spine where two independently built stories could implement it in incompatible ways, and where the spine contradicts its sources. The spine was not edited.

**Verdict:** The spine is solid on stack, ownership, the coach boundary and the pure engine. But it has one internal contradiction (slices may not import each other, yet must call each other), and it leaves the plan-version and logging data model open. Stories E2 and E3 would collide there. It needs one more pass before epics.

Known and accepted: PRD NFR5 (line 54) and §4 (line 83) still say SQLite; spine AD-5 uses PostgreSQL (memlog line 17). This is only noted here; the PRD must be updated through correct-course.

Severity: **critical** = stories will build incompatible data or code paths; **high** = a likely mismatch or a requirement with no home; **medium** = a convention two stories will choose differently; **low** = a clarity or completeness gap.

---

## Critical

### C1. Spine contradicts itself on cross-slice calls
- **Source:** Spine line 43 ("A slice never imports from another slice"), AD-1 line 49 ("A feature slice may import only from `src/shared/` and its own folder"), vs AD-3 line 61 ("other slices read it through the owner's exported query functions") and line 69 ("`coach` applies an approved proposal by calling `plan`'s exported function").
- **Problem:** Several flows need one slice to call another: coach writes a plan version, onboarding triggers plan generation (FR2 step 5), profile triggers replanning (FR3), logging reads planned sessions, plan reads logs for progression (FR14), and logging shows the next session (FR17). As written, AD-1 forbids every one of these calls, while AD-3 requires them. One story will import `features/plan` directly; another will copy the query into `shared/`.
- **Fix:** Pick one rule and state it in AD-1. Either (a) each slice exposes a public `index.ts` (queries and commands), and other slices may import only that file. Add a lint rule (`eslint-plugin-boundaries` or `no-restricted-imports`) and allow it in the dependency diagram. Or (b) move cross-slice reads and commands into `shared/` services. Option (a) matches AD-3 and is less churn.

### C2. Plan versions vs session logs: the link breaks when a new version is created
- **Source:** Spine AD-7 line 93 (versions immutable; a new version for each change), ER line 196 (`PLANNED_SESSION ||--o| SESSION_LOG`), PRD FR3 line 30 ("replans the rest of the current week from today; sessions already logged are kept"), FR5 line 32 (counter "X av Y økter").
- **Problem:** If a log points to a planned session in version N, and version N+1 copies its sessions, then the logs, the week counter, the ✓ on day rows, and the "next session" are all computed against the wrong version. The plan story and the logging story will each pick their own way to solve this (copy the log link, look it up by date and type, or keep logged sessions only in the old version).
- **Fix:** Add an AD that defines a stable identity, for example `planned_session.slot_id` (or `program_id + date + order`) that is carried across versions. Logs reference the slot, not the version row. A new version must copy logged slots unchanged. Also state whether a plan version covers one week or the whole program, and that "current version" means the latest version of the current week.

### C3. Weekly plan generation "first visit, only once" has no owner, trigger or idempotency
- **Source:** PRD FR4 line 31, Story 2.2 line 139 ("generated on the first visit in a new week … and only once"); EXPERIENCE Flow 4 line 246; spine AD-7 line 93 (idempotency only for session log and approval).
- **Problem:** It is not decided which request triggers generation (opening Uke, any authenticated page, or the coach tab). Next.js Server Components should not write during render, and two tabs, or a prefetch plus the real load, can generate two weeks. It is also not decided what happens when the user skipped one or more weeks (generate only the current week, or every week in between, and from which logs).
- **Fix:** Add to AD-7 (or a new AD): `plan.ensureCurrentWeek(userId, today)` is called from one place (for example the authenticated layout's server action, or the Uke route before render). It is protected by a unique key on `(program_id, week_start_date)` with `INSERT … ON CONFLICT DO NOTHING`. Skipped weeks are not backfilled; the new week is based on all logs so far. Unlogged weeks count as "Not logged" (no change).

---

## High

### H1. Active session (NFR11) and set-by-set editing have no data model; the deferral is too late
- **Source:** Spine Deferred line 251 (decided in Story 3.1); spine AD-7 line 93 (unique session log per planned session; repeated request returns existing); PRD FR7 line 34, NFR11 line 60; EXPERIENCE line 36 (a logged set can be tapped and edited or removed during the active session), lines 142 and 164 (locked after «Fullfør økt»), line 156 ("Samme sett kan ikke lagres to ganger"), line 167.
- **Problem:** History (3.2), progression (3.3), the week counter (2.3) and the finished-session view (3.4) all need to know the difference between an in-progress and a finished log. The spine has no `state` (in progress / finished) on the session log. It has no rule that the server rejects writes to a finished log, and no idempotency key for a single set. Also, the AD-7 rule "a repeated log request returns the existing result" is ambiguous when sets are created one at a time.
- **Fix:** Decide now, at the spine level: (1) a session log is created when the first set is logged, with `status = in_progress | finished` and `finished_at`. (2) Set logs carry a client-generated id (UUID) that is unique, so a repeated "Logg sett" is a no-op. (3) Every write to a set or run log checks `status = in_progress` on the server. (4) Restore = open the user's single in-progress log. The current exercise is derived from the logged sets, so no browser storage is needed. Leave only the UI details to Story 3.1.

### H2. R11 swap question cannot work if the message is never sent to the model
- **Source:** Spine AD-9 line 105 ("On a match the app returns the fixed R11 reply and does not send the message"); PRD FR13 line 40 (for pain in a specific exercise or body part, the coach also asks to swap; "a swap is a normal change proposal"); EXPERIENCE lines 129, 236–238, 242 (no swap question for acute symptoms or pain without a specific exercise).
- **Problem:** After the word-list match, nothing is sent, so nothing knows which exercise is meant. Nothing decides between "knee hurts during squats" (swap question) and "chest pain" (no question). And nothing defines what «Ja, bytt» sends: the original message is withheld, and AD-10 sends no chat history. The coach story and the medical-check story will each invent their own way to do this.
- **Fix:** Extend AD-9 so the deterministic check returns `{ kind: 'acute' | 'localized' | 'general', exerciseId?, bodyPart? }`. It uses two word lists (acute symptoms; body parts and exercise names from the user's current plan). For `localized`, the app shows R11 plus the swap question. «Ja, bytt» calls a code-built swap request: the engine picks an alternative from the library (R5) and creates a proposal. No message text goes to the model. State that the original pain message is never forwarded, even after «Ja, bytt».

### H3. R8 reduction marker and R7 fixed fast-run distance have no home in the data model
- **Source:** PRD R8 line 235, R12 line 239, progression table line 265 ("Session reduced by R8 … Skipped"), Story 3.3 line 164; R7 line 234 (fast short run distance "set once to the distance of the easy short run in the user's first plan week"); spine AD-3 line 67 and ER lines 190–203.
- **Problem:** Progression (Story 3.3) has to know which sessions were reduced by R8, but the coach (Story 4.2) creates them. If the marker is not a defined field, 4.2 will store the reduction as just "fewer sets", and 3.3 will then count it toward R12. The fixed fast-run distance must also be stored once per program. Otherwise the engine will recompute it from the first week's version and could get a different value.
- **Fix:** Add to the AD-3 table and the ER diagram: `planned_session.reduction` (`null | 'r8'`, written only through the engine) and `program.fast_run_distance_km` (set at program creation). Name these as engine inputs in AD-2.

### H4. Demo mode: which user, global or per user, and how the shared demo state is reset
- **Source:** Spine AD-6 line 87 ("signs in as a seeded demo user"), AD-8 line 99 (`COACH_MODE` selects the provider for the whole app), AD-14 line 135 (seed A–D only in `docker compose up`); PRD NFR1 line 50 (badge "while in demo mode"), Story 1.4 line 123 (one user per profile A–D, "so every scenario in Appendix C can be tried"); EXPERIENCE line 140 (badge while the demo user is logged in; it shows that coach replies are recorded).
- **Problem:** (a) One «Prøv demo» button, but four seeded users: does the user pick a profile, or always get the same one? (b) Is the badge shown based on `COACH_MODE=demo` or on the user being a demo user? On the published Vercel app with `COACH_MODE=live`, a demo user would get live replies under a "recorded" badge. (c) Several examiners share the same demo rows. One can delete the account (FR16) or finish all sessions, and that breaks the demo for the next. (d) It is not stated whether the published app is seeded.
- **Fix:** In AD-6 and AD-8: the provider is chosen per request as `user.isDemo || COACH_MODE === 'demo' ? Demo : Live`, and the badge is shown when `user.isDemo`. «Prøv demo» either opens a profile picker (A–D) or creates a fresh copy of the chosen seed for each click. Prefer the copy, because then FR16 and logging cannot spoil the shared data. Seeding is an idempotent script run by both Docker and the Vercel deploy.

### H5. The Demo provider has no rule for matching free text to recorded responses
- **Source:** Spine AD-8 line 99 ("recorded responses … keyed by the Appendix C scenarios"); PRD Appendix C lines 281–288; EXPERIENCE Flow 1 line 204 ("Må bli ferdig på 40 min i dag"), Flow 4 line 248 ("Jeg kan ikke onsdag").
- **Problem:** Examiners type free text. It is not decided how a message selects a recording (exact text, keywords, or profile plus intent). It is also not decided what happens for a message that matches no recording, or for the UX flows, which are not in Appendix C. The provider story and the e2e test story will key the recordings differently.
- **Fix:** State that the recordings are keyed by `(profile, intent)`, with a small Norwegian keyword matcher per intent. Add a fixed fallback reply that lists the example messages. Recorded results go through the same Zod schema and `engine.validateProposal` as live results. Add the two UX flows (time limit, "kan ikke onsdag") to the set of recordings.

### H6. Proposal schema, diff lines and the rule-break explanation have no owner
- **Source:** Spine AD-2 line 55, AD-8 line 99, Conventions line 151 (the schema lives in `shared/coach-provider`, but its content is not defined); PRD FR10–FR12 lines 37–39, R8 line 235 ("the code sets the reduction"), Story 4.2 line 178; EXPERIENCE lines 81 and 126 (card shows only changed lines, "Knebøy 3 → 2 sett"; rule break uses a fixed friendly template with "[grunn]").
- **Problem:** Without defined change types, the model may return absolute values (for example "3 sets → 2"), while R8 requires the code to set the size. Also not decided: who computes the before → after lines (the coach UI, or the engine), and whether the "[grunn]" text in FR12 comes from the model or from the rules that were broken. If it comes from the model, AD-2 is bypassed in spirit.
- **Fix:** In AD-2 or AD-8: the proposal is a list of intents (`move_session`, `exclude_days`, `reduce_r8`, `limit_sessions`, `swap_to_bodyweight`, `swap_exercise`) without loads or distances. The engine applies them and returns `{ plan, diff: ChangeLine[] , broken: RuleId[] }`. The Norwegian text for each rule break is a constant map keyed by `RuleId` in code. The model's own text is used only for the friendly lead-in.

### H7. "Day exclusions": scope and lifetime are not defined
- **Source:** Spine AD-3 line 67 and ER line 202 (`DAY_EXCLUSION`); PRD R9 line 236, Appendix C line 283 ("away Thursday to Sunday"); EXPERIENCE Flow 4 line 248 ("Jeg kan ikke onsdag").
- **Problem:** It is not stated whether an exclusion is a calendar date (only this week) or a weekday (every week). It is also not stated whether it is applied by the coach proposal only, or also by the weekly generation in C3. The plan engine and the coach will interpret it differently, and next week's plan will either keep or forget the exclusion.
- **Fix:** State that an exclusion is a set of calendar dates tied to one week, created only through an approved proposal. Weekly generation ignores the previous week's exclusions. (A recurring weekday is stage 2, unless the team wants it now.)

### H8. Program week counting (R13) is not defined against Monday-to-Sunday weeks
- **Source:** Spine AD-11 line 117; PRD R13 line 240 ("8 weeks, counted from the program start … first visit in week 9"), Story 2.4 lines 145–146; EXPERIENCE lines 121 and 161 (the card disappears when a choice is made; "no answer keeps").
- **Problem:** Onboarding can happen on a Thursday. It is not decided whether that partial week is week 1, or whether the program starts the next Monday. The program-card state ("answered" or "not answered") is not stored anywhere. Also not decided: does "no answer" mean the card shows again next week, or only in week 9?
- **Fix:** In AD-11: `program.start_date` is the Monday of the onboarding week, and that partial week is week 1. `program.week_number(today)` lives in `shared/lib`. Add `program.renewal_answered_at` (owner: plan). Decide whether the card is shown only in week 9 or in every week after 8 until it is answered, and write that down.

---

## Medium

### M1. Banner, hint and "first time" states: derived or stored, and on which device
- **Source:** PRD FR4 line 31 (banner until the first session of the week is logged); EXPERIENCE lines 134–135 ("hint-card … Lukkingen huskes"), lines 62 and 71 (welcome hint and first-log hint); spine AD-12 line 123 (only the theme is on the device).
- **Problem:** The banner can be derived (no finished log in the current week). If it is stored instead, the plan and logging stories may disagree, for example over whether a session that is still in progress counts. It is not stated whether hint dismissal is stored in a cookie, in localStorage, or in the database.
- **Fix:** State that the banner is derived: shown when no session log with `status = finished` exists for this week. Hint dismissals are stored per user in the database, with a small `user_flags` field or table owned by `profile`, or on the device, like the theme. Pick one.

### M2. The meaning of "logged" for the counter, ✓, banner and history is not fixed
- **Source:** PRD FR5 line 32 ("X av Y økter"), FR7 line 34 (status derived: completed / partly / not completed), Story 2.3 line 142; EXPERIENCE line 124 (completed days show ✓), line 142.
- **Problem:** It is not decided whether a finished session with status "not completed" (0 sets) counts in "X av Y" or removes the banner. It is also not decided whether the status is stored or computed in each place. The week view (2.3), history (3.2) and progression (3.3) can disagree.
- **Fix:** Add one engine function, `sessionStatus(log, plannedSession)`, used everywhere. Status is never stored, or it is stored only by logging when the session is finished. Define "logged" as `status = finished`, whatever the completion is.

### M3. Number, duration and pace formats for Norwegian UI
- **Source:** Spine Conventions line 149 (km, kg rounded to 0.5; no time unit or display locale); PRD FR5 line 32 (pace min:sec per km), FR7 line 34 (time min:sec); EXPERIENCE lines 65, 75, 115 ("62,5 kg", "0,5 kilo"), 120 ("Pace = tid / distanse"), assumption 14 line 344 (steps of 0.1 km and 5 s).
- **Problem:** Not decided: whether run time is stored as seconds or as a string; how pace is rounded (5:41.6 → 5:42 or 5:41); and whether the UI shows decimal comma or point. The run-logging story and the week-plan pace story will each write their own formatter.
- **Fix:** Add to Conventions: durations are stored as integer seconds, distances as numeric km with 2 decimals, and pace is computed as `round(seconds / km)` and formatted `m:ss`. Display uses `Intl.NumberFormat('nb-NO')` (decimal comma) through one formatter module in `shared/lib`. Steppers use 0.5 kg, 1 rep, 0.1 km and 5 s.

### M4. Fast short run "target to beat" and FR17 comparison logic have no home
- **Source:** PRD FR17 line 44 (compare with the previous session of the same type: heavier load or longer distance), §3 line 71; EXPERIENCE lines 66, 75, Flow 6 line 260; R7 line 234.
- **Problem:** "Previous session of the same type" and "heavier load" (which exercise? the sum? the top set?) are rule-like comparisons. Without a home, logging (3.4) and the week plan (2.3) will each write their own lookup of "previous run of the same type".
- **Fix:** Put `previousOfType(logs, sessionType)` and `compareWithPrevious(...)` in `shared/engine`, as pure functions. Define "heavier" (for example, any exercise with a higher top-set load, naming the largest increase). Also state that the fast-run message is shown only for `run_type = fast_short`.

### M5. Accessibility rules that are cross-cutting but not in the spine
- **Source:** PRD NFR8 line 57; EXPERIENCE Accessibility Floor lines 185–195 (`lang="nb"`, focus trap in modals, reduced motion, 200 % text, announcements via live regions); DESIGN line 360 (all sizes in `rem`); spine AD-13 line 129 (tokens only).
- **Problem:** AD-13 covers colours and shapes, but it says nothing about these rules: `rem` only, `prefers-reduced-motion` as the one switch for confetti and progress animation, one modal/dialog primitive with focus trap, and a live region for coach replies. Each screen story will implement its own.
- **Fix:** Extend AD-13: `shared/ui` provides `Dialog` (focus trap and return), `LiveRegion`, `useReducedMotion`, and a `<html lang="nb">` root layout. Units are `rem` only (a lint or stylelint rule against `px` font sizes). Playwright runs `@axe-core/playwright` on the main screens in both themes (AD-15).

### M6. Route protection and the onboarding gate are not specified
- **Source:** PRD Story 1.2 line 113 ("Logged-out users cannot open any page except sign up and log in"); EXPERIENCE line 32 (after deletion, back to login), Flow 2; spine AD-6 line 87.
- **Problem:** AD-6 defines how to get the current user in server code, but not how pages are protected (Next.js proxy/middleware or a check in each layout), nor that a user without a profile is sent to onboarding. Each slice story may add its own check, or forget it.
- **Fix:** Add to AD-6: one authenticated route-group layout in `src/app/(app)/layout.tsx` checks the session and the profile and redirects to `/logg-inn` or `/onboarding`. Public routes are listed explicitly.

### M7. Idempotency is defined only for logging and approval; other repeatable actions are not covered
- **Source:** PRD NFR9 line 59 ("repeating an action … has no extra effect"); EXPERIENCE line 130 («Prøv igjen» — "Flere raske trykk gir én sending"), line 151; spine AD-7 line 93.
- **Problem:** Sending a chat message and pressing «Prøv igjen», «Ja, nytt program», confirming a profile change (FR3), and generating the week (C3) can all create duplicates.
- **Fix:** Generalise AD-7: every mutating server action takes a client-generated `requestId` (UUID) or has a natural unique key. List the keys: `coach_message.client_id`, `program(user_id, started_from_program_id)`, `plan_version(program_id, based_on_version_id)` (this also makes stale confirmations fail), and the week key from C3.

### M8. Coach language, tone and limits on the live model are not set
- **Source:** PRD NFR10 line 59 (Norwegian bokmål, one encouraging tone; the medical reply stays neutral), NFR7 line 56 (timeout); EXPERIENCE Voice and Tone lines 54–58; spine AD-8 line 99, Conventions line 147.
- **Problem:** No rule says where the system prompt lives, that it requires bokmål and the du-form tone, what the timeout is, or the max token count. Vercel's function time limit also applies. The coach story and the scenario test story (4.5) will set these ad hoc.
- **Fix:** Add to AD-8: the system prompt is a versioned file in `shared/coach-provider/prompt/`, it requires bokmål and the tone from EXPERIENCE.md, and it contains no user personal data. Set a timeout (for example 20 s, below the Vercel limit), set `max_tokens`, and do not retry automatically (the user retries with «Prøv igjen»).

### M9. Fixed Norwegian texts (R11, rule breaks, quotes, anchors) have no single source
- **Source:** PRD FR13 line 40 (verbatim reply), Appendix A effort scale line 245; EXPERIENCE lines 93–107 (anchors; 20–30 quotes "fast liste i appen"); spine AD-9 line 105 (R11 is a constant).
- **Problem:** The anchor texts are needed by logging (Fullfør økt) and maybe by the coach; the quotes are needed by FR17; the R11 text by coach and Demo recordings. Without a single location, the text will be duplicated and drift (the R11 text must be verbatim).
- **Fix:** Add to Conventions: fixed product texts live in `src/shared/lib/texts/` (or `shared/ui/copy`) as typed constants. Demo recordings and tests reference the constant, not a copy. An engine test asserts that the R11 text is exactly the PRD string.

### M10. Profile change, new goal and new focus: which slice creates the program or version
- **Source:** Spine AD-3 lines 66–67, capability map line 239 (FR3 → profile; "running goal" listed in both the `plan` and `profile` folders, lines 212 and 215); PRD FR3 line 30, R13 line 240 (a focus change resets the week count), R14 line 241; EXPERIENCE NOTE FOR UX 6 line 355.
- **Problem:** Changing focus requires a new program; changing sessions per week requires a new version with the same program; a new running goal resets `running_goal_reached`. The spine lists "running goal" in both slices, and it does not say that profile must call plan (see C1). Two stories will each create programs.
- **Fix:** In AD-3: profile updates the profile row and then calls `plan.onProfileChanged(old, new)`. Plan decides between a new program (focus changed) and a new version (other fields), and it owns `running_goal_reached`. Remove "running goal" from the `plan` folder comment, or clarify what each slice does with it.

### M11. Health data hosting region and the free-tier pause
- **Source:** PRD §4 line 90 (treated as health data); memlog line 18 (Supabase free projects pause after one week without use); spine AD-14 line 135, Deferred line 253.
- **Problem:** The region is not stated (EU or not) for data the PRD treats as health data. The pause can also make the published app fail on the day the examiner tries it. Neither is in the spine.
- **Fix:** Add to AD-14: the Supabase project and the Vercel function region are in the EU (for example `eu-north-1` / `arn1`). Note the free-tier pause, with a step to wake the database before the delivery date.

---

## Low

### L1. Exercise library is an engine input, but it is not listed in AD-2
- **Source:** Spine AD-2 line 55 (inputs: profile, program, logs, plan version, proposal), Deferred line 252; PRD R5 line 232, R13 line 240 (new exercises, loads carried over).
- **Fix:** Add "exercise library" to the AD-2 inputs, passed in by the caller (the engine does not read files). State that exercise ids are stable strings from Free Exercise DB, so loads can be carried over to a new program by id.

### L2. Better Auth error messages and the password rule must be Norwegian
- **Source:** PRD Story 1.2 line 112; EXPERIENCE line 230; spine Conventions line 150.
- **Fix:** Note in AD-6 that the minimum password length is set in the Better Auth config, and that its error codes are mapped to Norwegian messages in `account`.

### L3. "System" theme and the first server render
- **Source:** Spine AD-12 line 123; EXPERIENCE line 280.
- **Fix:** State that "system" is rendered with CSS `prefers-color-scheme` (no server knowledge needed), and that the cookie only forces light or dark. This avoids a flash and a hydration mismatch.

### L4. "Today" in the coach context
- **Source:** Spine AD-10 line 111 (only message, plan version and profile fields are sent); PRD R8 line 235 ("that day's session").
- **Fix:** Allow today's date and weekday (Europe/Oslo) in the payload of AD-10. This is not personal data, and the model needs it to read "i dag" and "torsdag til søndag".

### L5. Commit language vs group rules
- **Source:** Spine Conventions line 147 (commit messages in English); CLAUDE.md (group's own rules for commit and language take precedence).
- **Fix:** Check with the group. If their rule is Norwegian commit messages, align the convention line.

### L6. Coach messages and medical statements are stored as health data, but this is not stated
- **Source:** PRD §4 line 90, FR16 line 43; spine AD-10 line 111 (not written to logs), ER line 199.
- **Fix:** State that R11-matched messages are stored like other coach messages (or are not stored at all, which is the safer choice). Either way they are deleted by the FR16 cascade.

---

## Contradictions with the PRD or UX (summary)

| # | Spine says | Source says | See |
| --- | --- | --- | --- |
| 1 | A slice never imports from another slice (line 43, AD-1) | The spine's own AD-3 (lines 61, 69) requires cross-slice calls | C1 |
| 2 | On an R11 match the message is not sent (AD-9) | FR13: also ask about a swap and make a proposal for a specific exercise | H2 |
| 3 | Idempotency only for logging and approval (AD-7) | NFR9 and EXPERIENCE line 130: every repeated action, including chat resend | M7 |
| 4 | The demo badge and recordings follow `COACH_MODE` (AD-8) | EXPERIENCE line 140: the badge is shown while the demo user is logged in and means the replies are recorded | H4 |
| 5 | PostgreSQL (AD-5) | PRD NFR5 and §4: SQLite (known, accepted) | — |
