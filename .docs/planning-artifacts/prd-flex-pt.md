# Flex PT – Product Requirements Document

**Status:** Draft v0.5 · **Based on:** Product brief (2026-09-17), teacher feedback (2026-10-06) and [research on the training rules](research/academic-lit-treningsregler-r1-r11-2026-10-31/research.md) (2026-10-31) · **Scope:** Version 1 (MVP, stage 1)

## 1. Goals and background

### Goals

- A user gets a realistic weekly training plan based on their profile right after onboarding.
- A user can adapt the plan to a changed week through conversation with the coach, and the change is visible in the plan.
- Every plan and every plan change follows explicit, testable training rules.
- Anyone can run the app locally without the team's keys or paid accounts (demo mode).

### Background

People with busy, shifting schedules struggle to follow fixed training programs. When a week does not go as planned, they must rearrange sessions themselves or start over, which reduces continuity and motivation.

Flex PT combines a personal weekly plan, session logging and a conversational coach. The core design principle for v1 is: **the code decides, the language model proposes, the user approves.** A rule-based plan engine generates and validates all plans. The language model interprets what the user says and proposes structured changes, which are checked against the rules and shown to the user for approval.

## 2. Requirements

Requirements are numbered so they can be traced to stories, code and tests. The Source column refers to the five core capabilities in the product brief. Rules R1–R12 are listed in Appendix A.

### Functional requirements

| ID | Requirement | Source |
| --- | --- | --- |
| FR1 | A user can register with email and password, log in and log out. | Capability 1 |
| FR2 | During onboarding, the user first chooses a focus: running or strength. **Running:** the user picks a goal (first 5 km, 10 km or half marathon), enters how far they can already run (their longest run, R7) and how many sessions per week they want. **Strength:** the user picks how many days per week to train, a main focus (upper body, lower body or full body) and gym experience (beginner or experienced). For both, the user also sets available days and equipment. | Capability 1 |
| FR3 | The user can edit the profile later. A changed profile produces a new plan version after the user confirms. | Capability 1 |
| FR4 | The system generates a weekly plan from the profile using the rule-based plan engine (R1–R12). | Capability 2 |
| FR5 | The plan shows each session with day, type and content: exercises with sets, reps and load, or run duration and distance. | Capability 2 |
| FR6 | Exercises are selected from the exercise library and filtered by the user's equipment. | Capability 2 |
| FR7 | The user can log a session as completed, partly completed or not completed, with perceived effort (easy, ok, hard), energy level and an optional note. The effort options are shown with fixed anchors (see Appendix A, effort scale). For strength, completion is recorded per exercise through the logged sets and reps; effort is given once per session. | Capability 3 |
| FR8 | The user can view their training history. | Capability 3 |
| FR9 | The user can send free-text messages to the coach about changes in availability, energy or equipment. | Capability 4 |
| FR10 | The coach returns a structured change proposal, which is validated against R1–R12 before the user sees it. | Capability 4 |
| FR11 | A valid proposal is shown as before and after. Approval creates a new plan version; rejection leaves the plan unchanged. | Capability 4 |
| FR12 | If a proposal breaks a rule, it is discarded, the plan is unchanged, and the coach explains why. | Capability 4 |
| FR13 | If the user mentions a medical condition (symptoms, pain or injury), the coach gives the fixed reply: "Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging." It gives no diagnosis and no advice about the condition (R11). | Capability 4 |
| FR14 | Next week's plan adjusts load based on logged sessions and perceived effort (R6, R7, R12). | Capability 5 |
| FR15 | The current plan shows what changed compared with the previous version. | Capability 5 |

### Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR1 | The app runs in demo mode without an API key, with a seeded test user and recorded coach responses. |
| NFR2 | A user can never read or change another user's data (profile, plan, logs, messages). |
| NFR3 | Passwords are hashed. Secrets exist only in `.env`, which is git-ignored; `.env.example` is committed. |
| NFR4 | Only training-relevant fields are sent to the language model, never name or email. |
| NFR5 | The app runs locally by following the README, with documented prerequisites and an SQLite database. |
| NFR6 | The plan engine and validation are covered by automated tests, using test profiles A–D as fixtures. |
| NFR7 | If the language model fails or times out, the user sees a clear message and the plan is unchanged. |
| NFR8 | Basic accessibility: labelled form fields, keyboard navigation, readable contrast, and a layout that works on mobile width. |

## 3. UI design goals

The interface should make the next session obvious and make changes feel safe: nothing in the plan changes without the user seeing it first. Mobile-first web, calm and clear, with the week plan as the home screen.

| Screen | Purpose | Requirements |
| --- | --- | --- |
| Sign up and log in | Create an account or log in | FR1 |
| Onboarding | Short step-by-step form: focus (running or strength), then the questions for that focus (FR2), then days and equipment | FR2 |
| Week plan (home) | This week's sessions per day, next session highlighted, changes since last version marked | FR4, FR5, FR15 |
| Session detail and log | Exercises for the session, where the user can write down their weight and number of reps per set or their run statistics. Effort is chosen as easy, ok or hard, each with its anchor text visible. | FR5, FR7 |
| Coach chat | Conversation with the coach; a proposal card with before and after, and Approve and Reject buttons | FR9–FR13 |
| History | Logged sessions, newest first | FR8 |
| Profile | View and edit profile | FR3 |

The team should sketch at least the week plan, the log form and the proposal card before implementation, and keep the sketches in the repo.

## 4. Technical assumptions

These assumptions guide the architecture document, where the final choices and their reasons are recorded.

- **Web app in one repository**, with frontend, backend and tests together.
- **SQLite** as the database, so the app runs locally without a database server.
- **Rule-based plan engine** as pure functions (profile and logs in, plan out), with no language model or database inside it.
- **Coach service behind one interface** with two implementations: *Live* (calls the language model) and *Demo* (returns recorded responses), selected by `COACH_MODE` in `.env`.
- **Structured output:** the language model returns change proposals as JSON in a fixed schema, which the code validates.
- **Plan versioning:** each approved change creates a new plan version; earlier versions are kept.
- **Exercise library:** a curated subset of 30–50 exercises from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (public domain), stored in the repo and reviewed by the team.
- **Training types in v1:** strength and running.
- **Health data:** the combined user record is treated as health data in the design until this has been assessed legally, because pain statements tied to a user very likely qualify.
- **Stack:** Next.js (decided by the team). The architecture document records the details.
- **Language model:** Claude (decided by the team).

## 5. Epics and stories

Four epics cover v1, built in order. Each story becomes one branch, one pull request and its own tests. Acceptance criteria are first drafts to be refined before implementation.

| Epic | Goal | Requirements |
| --- | --- | --- |
| E1 Foundation and accounts | Runnable project, login, profile, demo data | FR1–FR3, NFR1–NFR5 |
| E2 Plan engine and weekly plan | Rule-based plan from the profile, shown clearly | FR4–FR6, FR15, NFR6 |
| E3 Logging and progression | Log sessions and adjust next week | FR7, FR8, FR14 |
| E4 Coach dialogue | Chat that proposes validated changes the user approves | FR9–FR13, NFR4, NFR7 |

### E1 Foundation and accounts

1. **Story 1.1 – Project setup.** As a developer, I want a runnable project skeleton so that all stories build on the same base.
   - App starts locally with one documented command.
   - Test runner, linter and `.env.example` are in place.
   - README stub lists prerequisites and start command.
2. **Story 1.2 – Register and log in (FR1, NFR3).** As a user, I want an account so that my data is saved.
   - Passwords are hashed; invalid email or short password gives a clear error.
   - Logged-out users cannot open any page except sign up and log in.
3. **Story 1.3 – Onboarding profile (FR2, FR3).** As a user, I want to describe my goal and week so that I get a fitting plan.
   - All fields required; values limited to the defined options.
   - Profile is unchanged after logging out and in again.
4. **Story 1.4 – Demo mode and seed data (NFR1).** As a reviewer, I want to run the app without a key so that I can test it.
   - `COACH_MODE=demo` uses recorded coach responses.
   - A test user with profile C (running), a plan and some logs is created at start-up.

### E2 Plan engine and weekly plan

1. **Story 2.1 – Exercise library (FR6).** As the team, we want a curated exercise library so that plans use real, reviewed exercises.
   - A script selects the subset from Free Exercise DB; the result is committed and reviewed.
   - Each exercise has equipment and muscle groups.
2. **Story 2.2 – Plan engine (FR4, NFR6).** As a user, I want a plan that fits my week so that I can follow it.
   - Profiles A–D produce the expected plans in Appendix B.
   - No generated plan breaks R1–R12 (tested).
3. **Story 2.3 – Week plan view (FR5, FR15).** As a user, I want to see my week so that I know what to do next.
   - Next session is highlighted.
   - Changes since the previous version are marked.

### E3 Logging and progression

1. **Story 3.1 – Log a session (FR7).** As a user, I want to log how a session went so that the plan builds on what I did.
   - Status, effort and energy are required; note is optional.
   - The effort options show the anchor texts from the effort scale in Appendix A.
2. **Story 3.2 – History (FR8).** As a user, I want to see what I have done so that I can follow my progress.
   - Logged sessions shown newest first; empty state explains what to do.
3. **Story 3.3 – Progression (FR14).** As a user, I want next week to reflect my logs so that I keep progressing.
   - Strength follows R6: completed exercises in a session logged "easy" or "ok" progress; "hard" keeps load; in a partly completed session only the exercises that were not completed keep load.
   - Running follows R7: easy runs and the long run progress separately; "easy" or "ok" allows an increase, "hard" keeps the distance for that session type. Weekly distance increases at most 10 %, and no planned run breaks the 30-day limit. The user's self-reported longest run is the starting point.
   - Two "hard" or not-completed results in a row on the same exercise or run type reduce it by 10 % (R12).
   - A session reduced by R8, a not-completed session and an unlogged session give no increase; R8-reduced and unlogged sessions do not count towards R12.
   - Each row in the progression table in Appendix A has an automated test (NFR6).

### E4 Coach dialogue

1. **Story 4.1 – Coach chat and provider (FR9, NFR4, NFR7).** As a user, I want to tell the coach about my week so that I don't have to replan myself.
   - Live and Demo providers share one interface.
   - Only training-relevant fields are sent; errors give a clear message.
2. **Story 4.2 – Structured proposal and validation (FR10, FR12).** As a user, I want only safe changes suggested so that I can trust the coach.
   - Proposals follow the JSON schema; invalid JSON or rule breaks are discarded with an explanation.
3. **Story 4.3 – Approve or reject (FR11, FR15).** As a user, I want to decide on each change so that I stay in control.
   - Before and after shown; approval creates a new plan version; rejection changes nothing.
4. **Story 4.4 – Pain and injury (FR13).** As a user, I want safe advice if I mention pain so that I don't make an injury worse.
   - Any mention of a medical condition gives the fixed reply from R11; no diagnosis is given.
   - The plan is not changed automatically.
5. **Story 4.5 – Coach scenario tests.** As the team, we want fixed scenarios so that coach behaviour can be checked.
   - The six scenarios in Appendix C pass with recorded responses; results against the live model are documented.

## 6. Out of scope for v1

- **Stage 2:** selectable coaching style, visible plan history, more change types (equipment, new goal).
- **Stage 3:** coach memory across conversations, more training types and goals.
- **Later versions:** Strava, Apple Health and Garmin import; calendar integration; nutrition; cycle and pregnancy programs; gamification; subscriptions.

## 7. Open questions

- [x] Which stack? Next.js.
- [x] Which language model? Claude. Who holds the key is still to be settled (NFR3).
- [x] Which source do we cite for the values in R1–R11? See the Basis column in Appendix A and the [research report](research/academic-lit-treningsregler-r1-r11-2026-10-31/research.md).
- [x] Which values do we set where Appendix A said "team to set" (R7, R8)? Set in Appendix A.
- [x] Who reviews R11 and the list of acute symptoms? No longer needed: R11 gives a fixed reply and no medical advice.
- [ ] Should a check in the code run before a message reaches the language model, so that pain statements are handled under NFR4 and FR13? To be settled in the architecture document.
- [x] Which fixed goals are offered in v1? Running (first 5 km, 10 km, half marathon) and strength (focus upper body, lower body or full body). See FR2.
- [x] Is running in v1, or strength only? Both.

## Appendix A – Training rules

Bracketed numbers in the Basis column refer to the [research report](research/academic-lit-treningsregler-r1-r11-2026-10-31/research.md). **Team choice** means a product decision, and **convention** means common practice that we did not find tested. Most sources were read only as abstracts or excerpts, so the report's confidence ratings apply.

| Rule | Description | Basis |
| --- | --- | --- |
| R1 | Sessions per week = the lower of desired sessions and available days, max 5. Strength goals train each major muscle group at least 2 days per week. | At least 2 days: ACSM 2026 [1]. Max 5: team choice. |
| R2 | At least one rest day per week; never more than 3 training days in a row. | Convention, kept as a safety choice. No limit found; small trials of 3 days in a row showed no penalty [12]. |
| R3 | No two heavy strength sessions for the same body part, or two hard runs, on consecutive days. | Convention. Recovery varies with effort and volume, so 48 hours is not a proven limit [7][28]. |
| R4 | Template by session count: 2 → 2 full body · 3 → 3 full body, or 2 strength + 1 run · 4 → upper/lower ×2, or 2 strength + 2 runs · 5 → upper/lower and push/pull/legs, or upper/lower ×2 + 1 run. Running focus: all sessions are runs, one of them long and the rest easy (to be refined). Strength focus: the chosen main focus gets extra volume. | Team choice. Full body and split give similar results at equal volume [8]. |
| R5 | Exercises only from the library, matching the user's equipment. | Team choice. |
| R6 | Strength progression, per exercise: all sets completed and session effort "easy" or "ok" → increase load by the smallest available step if it is at most 10 % of the current load, otherwise add one rep; effort "hard" or exercise not completed → keep. The session effort applies to every exercise in the session; whether an exercise was completed is read from its logged sets and reps. "Easy" and "ok" are treated the same in v1. | 10 % limit: upper end of ACSM 2009 [14], not confirmed in the 2026 update. Load or reps: [15]. The effort scale and treating "easy" like "ok": team choice, as suggested in the research report. |
| R7 | Running progression, measured in distance: weekly distance increases at most 10 % from the last completed week, and no planned run is more than 10 % longer than the longest run in the last 30 days. The first run, and any run when there is no recent run, is based on the longest run the user entered themselves (at most 10 % above it). Easy runs and the long run progress separately: a completed run with effort "easy" or "ok" allows an increase for that run type; "hard", partly completed or not completed → keep the distance for that run type. | 30-day limit: observational association [3]. Weekly 10 %: convention, not injury prevention [2][19]. Effort for running and separate run types: team choice. |
| R8 | Low energy → next session has reduced volume, decided by the code: one set fewer for strength, running distance 25 % shorter. The reduction applies only to that session and is not carried forward: if the plan says 4 sets and the user is tired on Monday and Tuesday, both sessions get 3 sets. | Team choice. Not tested directly; indirect support that a small reduction costs little [17]. |
| R9 | No sessions on days marked unavailable. | Team choice. |
| R10 | A missed session is moved only if R2, R3 and R7 still hold; key sessions (e.g. long run) take priority. | Convention [21]. |
| R11 | The user mentions a medical condition (symptoms, pain or injury) → the fixed reply "Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging."; no diagnosis, no automatic plan change. Load is never adjusted from a pain score. | Team choice: the app does not give medical advice. No study tested this for apps. |
| R12 | Step back: two results in a row that are "hard" or not completed (a partly completed run, or an exercise whose sets were not all completed, counts as not completed), on the same strength exercise or the same run type (easy run or long run) → reduce its load or distance by 10 %, rounded to the nearest available step. Sessions reduced by R8 and unlogged sessions are skipped when counting and do not break the run. After a step back the count starts again from zero. | Team choice. Protects against a starting level that is set too high (for example an overestimated longest run, R7) and against stalling on "hard" for weeks. Not tested directly. |

### Effort scale

The scale is a team choice; we found no validation of a three-point scale (research report). The anchors make it more consistent between users. They are based on reps in reserve for strength and the talk test for running.

| Effort | Strength | Running |
| --- | --- | --- |
| Easy | "I could have done 4 or more reps more" | "I could talk in full sentences" |
| Ok | "I had 2–3 reps left" | "I could talk in short sentences" |
| Hard | "I had 0–1 reps left, or my technique broke down" | "I could only say single words" |

### Progression table (R6, R7, R8, R12)

What a logged result means for the next session of the same exercise or run type. Each row is an automated test case (NFR6).

| Logged result | Strength (per exercise) | Running (per run type) | Counts towards R12 |
| --- | --- | --- | --- |
| Completed, "easy" or "ok" | Increase by R6 | Increase within R7 limits | No, resets the count |
| Completed, "hard" | Keep | Keep | Yes |
| Partly completed | Not completed exercises keep; completed exercises follow the session effort | Keep | Yes, for the parts not completed |
| Not completed | Keep | Keep | Yes |
| Not logged | No change | No change | Skipped |
| Session reduced by R8 | Keep | Keep | Skipped |
| Second "hard" or not completed in a row | −10 % (R12) | −10 % (R12) | Count resets |

## Appendix B – Test profiles

| Profile | Goal and experience | Days and equipment | Expected weekly plan |
| --- | --- | --- | --- |
| A | Strength · beginner at the gym · full body | 2 sessions per week · Tue, Thu · gym | 2 full-body sessions: Tue, Thu |
| B | Strength · experienced at the gym · full body | 5 sessions per week · all days available · gym | 5 sessions: Mon lower, Tue upper, Thu push, Fri pull, Sat legs; Wed and Sun rest; app explains why |
| C | Running · beginner · goal 10 km · can run 3 km | 3 sessions per week · Mon, Wed, Sat | 3 runs: Mon easy, Wed easy, Sat long |
| D | Running · experienced · goal half marathon · can run 15 km | 4 sessions per week · Mon, Wed, Fri, Sun | 4 runs: Mon, Wed, Fri easy, Sun long |

## Appendix C – Coach scenarios

| Profile | User message | Expected plan change |
| --- | --- | --- |
| D | "I'm away Thursday to Sunday" | No sessions Thu–Sun; at most one session moved earlier |
| D | "I only have time for two sessions this week" | 2 sessions; long run kept as key session |
| D | "I'm completely out of energy today" | Today's session reduced by R8 |
| B | "The gym is closed, I need to do a home workout without any equipment" | Strength exercises swapped to dumbbell versions; session count unchanged |
| B | "My knee hurts" | No automatic plan change; fixed reply from R11 |
| B | "I have chest pain" | No automatic plan change; fixed reply from R11 |

## Change log

| Date | Version | Change |
| --- | --- | --- |
| 2026-10-11 | 0.1 | First draft from product brief and teacher feedback |
| 2026-10-31 | 0.2 | Training rules updated from research: R1, R4, R6, R7, R8, R10 and R11 changed, Basis column added, FR13, Stories 3.3, 4.4 and 4.5 and Appendix C updated, health data assumption and open questions added |
| 2026-10-31 | 0.4 | Fixed goals and onboarding flow defined (FR2); test profiles A–D replaced (two strength, two running); Appendix C scenarios assigned to profiles; open questions on fixed goals and running closed |
| 2026-10-31 | 0.3 | Open questions answered: stack Next.js, model Claude; R7 uses the user's own longest run; R8 set to 25 % less distance or one set fewer, not carried forward; R11, FR13, Story 4.4 and Appendix C changed to a fixed reply for medical conditions |
| 2026-10-31 | 0.5 | Perceived effort defined: R6 clarified (session effort applies to all exercises, "easy" = "ok"), R7 uses effort and progresses easy runs and the long run separately, new R12 step back after two "hard" or not-completed results in a row; effort scale with anchors and progression table added to Appendix A; FR4, FR7, FR10, FR14, the log screen and Stories 2.2, 3.1 and 3.3 updated |
