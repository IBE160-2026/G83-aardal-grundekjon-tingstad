# Flex PT – Product Requirements Document

**Status:** v1.5 · **Based on:** Product brief (2026-09-17), teacher feedback (2026-10-06), [research on the training rules](research/academic-lit-treningsregler-r1-r11-2026-10-31/research.md) (2026-10-31) and the [UX documents](ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/) (2026-11-11) · **Scope:** Version 1 (MVP, stage 1)

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

Requirements are numbered so they can be traced to stories, code and tests. The Source column refers to the five core capabilities in the product brief. Rules R1–R14 are listed in Appendix A.

### Functional requirements

| ID | Requirement | Source |
| --- | --- | --- |
| FR1 | A user can register with email and password, log in, and log out from the Profile screen. | Capability 1 |
| FR2 | Onboarding has five steps, one question per screen: (1) focus, running or strength; (2) the questions for that focus – **running:** goal (first 5 km, 10 km or half marathon) and how far the user can already run (their longest run, R7); **strength:** main focus (upper body, lower body or full body) and gym experience (beginner or experienced); (3) sessions per week, 2–5; (4) strength only: "Where do you train?" – at the gym or at home (bodyweight); (5) the plan is generated. Onboarding does not ask for available days; the plan engine places the sessions by fixed day patterns (R9), and the user tells the coach about days that do not suit them (FR9). Full body means that both upper and lower body are trained during the week, not necessarily in every session. Onboarding does not ask for weights; the starting load comes from the first logged session (R6). | Capability 1 |
| FR3 | The user can edit the profile later, set a new running goal, and choose light, dark or system theme. A changed profile produces a new plan version after the user confirms. The new version replans the rest of the current week from today; sessions already logged are kept. | Capability 1 |
| FR4 | The system generates a weekly plan from the profile using the rule-based plan engine (R1–R14). A plan week runs Monday to Sunday. Next week's plan is generated the first time the user opens the app in the new week, based on the logs so far, and a new-week banner is shown at the top of the week plan until the first session of the week is logged. The week plan always shows the current week; earlier sessions are found in History. A strength program lasts 8 weeks (R13); a running program lasts until the goal is reached (R14). | Capability 2 |
| FR5 | The plan shows each session with day, type and content: exercises with sets, reps and load, or run type and distance. The week plan shows a counter of logged sessions against planned sessions this week ("X av Y økter"). Today's strength session lists all its exercises, and the user chooses the order. An exercise logged before shows the previous load and the recommended load (R6); an exercise not logged yet shows sets and reps only. Each run shows the pace (min:sec per km) from the previous run of the same run type; nothing is shown the first time. | Capability 2 |
| FR6 | Exercises are selected from the exercise library and filtered by where the user trains (R5). | Capability 2 |
| FR7 | **Strength:** sets are logged one at a time with load and reps, each adjusted with − and + or typed in. The user can remove a set or log 0 reps. When all sets of an exercise are logged, the app moves on to the next exercise. **Running:** the user logs distance (km) and time (min:sec). **Both:** after "Fullfør økt" the user chooses perceived effort once per session (easy, ok or hard, with fixed anchor texts, see Appendix A) and can add an optional note; the session is then locked. A started session (at least one logged set or saved run value) that is not finished is finished automatically at midnight (Europe/Oslo) at the end of the day it was started, without effort or note, and is then locked in the same way. The session status is derived from the logged sets and not chosen by the user: all sets completed → completed, some → partly completed, none → not completed. A set counts as completed when it is logged with at least 1 rep. Energy level is not part of the log. | Capability 3 |
| FR8 | The user can view their training history. | Capability 3 |
| FR9 | The user can send free-text messages to the coach about changes in availability, energy, time or equipment. Telling the coach about low energy or a time limit for a session is optional and is the only way energy and time limits enter the app (R8). | Capability 4 |
| FR10 | The coach returns a structured change proposal, which is validated against R1–R14 before the user sees it. | Capability 4 |
| FR11 | A valid proposal is shown on a proposal card that lists only the changed lines, each as before → after. Approval creates a new plan version; rejection leaves the plan unchanged. | Capability 4 |
| FR12 | If a proposal breaks a rule, it is discarded, the plan is unchanged, and the coach explains why. | Capability 4 |
| FR13 | If the user mentions a medical condition (symptoms, pain or injury), the coach gives the fixed reply: "Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging." It gives no diagnosis and no advice about the condition (R11). If the message concerns pain in a specific exercise or body part, the coach also asks whether the user wants to swap to another exercise; a swap is a normal change proposal that the user approves or rejects. | Capability 4 |
| FR14 | Next week's plan adjusts load based on logged sessions and perceived effort (R6, R7, R12). | Capability 5 |
| FR15 | Changes to the plan are shown as before → after on the proposal card before the user approves them (FR11). The week plan does not mark changed sessions. | Capability 5 |
| FR16 | The user can delete their account. After confirmation, the profile, plans, logs and messages are deleted permanently. | Privacy (health data, section 4) |
| FR17 | After a session is finished, the app shows a summary of the session, a motivational message that compares with the previous session of the same type (heavier load or longer distance than last time; plain encouragement the first time), a motivational quote from a fixed list, a celebration when a running goal is reached (R14), and the next planned session with its day. A small confetti celebration should be shown if time allows (should-have), and never when the phone is set to reduce motion. | Capability 5 |
| FR18 | **Moved to version 2 (2026-11-22), not built in v1; see §6.** A user who has forgotten their password can ask for a reset link by email from the login screen. The reply is the same whether or not the address has an account. The link works once and for one hour and sets a new password with the same rules as registration. Requests are limited per email address and per IP address. Demo users cannot reset a password. | Capability 1 (account security) |

### Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR1 | The app runs in demo mode without an API key, with seeded test users and recorded coach responses. The login screen has a "Prøv demo" button, and a "Demo" badge is shown at the top while in demo mode. |
| NFR2 | A user can never read or change another user's data (profile, plan, logs, messages). |
| NFR3 | Passwords are hashed. Secrets exist only in `.env`, which is git-ignored; `.env.example` is committed. |
| NFR4 | Only training-relevant fields are sent to the language model, never name or email. |
| NFR5 | The app runs locally by following the README, with documented prerequisites; one command starts the app and its PostgreSQL database in Docker. |
| NFR6 | The plan engine and validation are covered by automated tests, using test profiles A–D as fixtures. |
| NFR7 | If the language model fails or times out, the user sees a clear message and the plan is unchanged. |
| NFR8 | Accessibility: WCAG 2.2 AA as the target, in both light and dark theme; labelled form fields, keyboard navigation, readable contrast, and a layout that works on mobile width. The app respects the phone's reduce-motion setting and supports text size up to 200 % without a broken layout. |
| NFR9 | Robustness: all input is validated on the server; repeating an action (for example double-clicking Approve or logging the same session twice) has no extra effect; a change proposal based on an older plan version is rejected with a clear message. |
| NFR10 | The user interface and the coach use Norwegian (bokmål), including the effort names and anchor texts (Lett, Passe, Tung; see EXPERIENCE.md). The coach and the microcopy use one encouraging, supportive tone; the fixed medical reply (FR13) stays neutral. Code and planning documents may be in English. |
| NFR11 | An active session is restored when the user locks the phone or leaves the app and comes back: same session, exercise and set. |

## 3. UI design goals

The interface should make the next session obvious and make changes feel safe: nothing in the plan changes without the user seeing it first. Mobile-first web, calm and clear, with the week plan as the home screen. The UX documents ([DESIGN.md](ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/DESIGN.md) and [EXPERIENCE.md](ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/EXPERIENCE.md)) specify the screens, flows, feedback, error messages and empty states; the mockups are in the same folder.

| Screen | Purpose | Requirements |
| --- | --- | --- |
| Sign up and log in | Create an account, log in, or try the demo | FR1, NFR1 |
| Onboarding | Five steps, one question per screen (FR2) | FR2 |
| Week plan (home) | This week's sessions per day, next session highlighted, session counter, new-week banner, 8-week program card (R13) | FR4, FR5 |
| Session overview and log | All exercises of the session in the order the user chooses; sets logged one at a time, with previous and recommended load; runs logged with distance and time. For a fast short run, the pace from the previous fast short run is shown as a target to beat, with a short note that the run should feel hard and that the distance is fixed | FR5, FR7, NFR11 |
| Finish session | Effort (Lett, Passe, Tung with anchor texts) and an optional note | FR7 |
| Finished session | Summary, motivational message, quote, celebration and next session | FR17 |
| Coach chat | Conversation with the coach; a proposal card with only the changed lines as before → after, and Approve and Reject buttons | FR9–FR13, FR15 |
| History | Logged sessions, newest first | FR8 |
| Profile | Edit profile and running goal, theme, log out, delete account | FR1, FR3, FR16 |

## 4. Technical assumptions

These assumptions guide the architecture document, where the final choices and their reasons are recorded.

- **Web app in one repository**, with frontend, backend and tests together.
- **PostgreSQL** as the database, run in Docker locally and for the examiner, and as a hosted database when the app is published. Changed from SQLite in the architecture work (2026-11-16), so the app uses the same database everywhere.
- **Rule-based plan engine** as pure functions (profile and logs in, plan out), with no language model or database inside it.
- **Coach service behind one interface** with two implementations: *Live* (calls the language model) and *Demo* (returns recorded responses), selected by `COACH_MODE` in `.env`.
- **Structured output:** the language model returns change proposals as JSON in a fixed schema, which the code validates.
- **Plan versioning:** each approved change creates a new plan version; earlier versions are kept.
- **Exercise library:** a curated subset of 30–50 exercises from [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (public domain), stored in the repo and reviewed by the team. Each exercise is marked for the gym, for home (bodyweight) or both.
- **Training types in v1:** strength and running.
- **Health data:** the combined user record is treated as health data in the design until this has been assessed legally, because pain statements tied to a user very likely qualify.
- **Stack:** Next.js (decided by the team). The architecture document records the details, including where the theme choice is stored.
- **Language model:** Claude (decided by the team).

## 5. Epics and stories

Four epics cover v1, built in order. Each story becomes one branch, one pull request and its own tests. Acceptance criteria are first drafts to be refined before implementation.

| Epic | Goal | Requirements |
| --- | --- | --- |
| E1 Foundation and accounts | Runnable project, login, profile, demo data, theme, account deletion | FR1–FR3, FR16, NFR1–NFR5, NFR8, NFR10 |
| E2 Plan engine and weekly plan | Rule-based plan from the profile, shown clearly; 8-week program and running goal | FR4–FR6, NFR6 |
| E3 Logging and progression | Log sessions, finish them and adjust next week | FR7, FR8, FR14, FR17, NFR11 |
| E4 Coach dialogue | Chat that proposes validated changes the user approves | FR9–FR13, FR15, NFR4, NFR7, NFR9 |

### E1 Foundation and accounts

1. **Story 1.1 – Project setup.** As a developer, I want a runnable project skeleton so that all stories build on the same base.
   - App starts locally with one documented command.
   - Test runner, linter and `.env.example` are in place.
   - README stub lists prerequisites and start command.
2. **Story 1.2 – Register and log in (FR1, NFR3).** As a user, I want an account so that my data is saved.
   - Passwords are hashed; invalid email or short password gives a clear error.
   - Logged-out users cannot open any page except sign up and log in.
   - The user can log out from Profile.
3. **Story 1.3 – Onboarding profile (FR2, FR3).** As a user, I want to describe my goal and week so that I get a fitting plan.
   - Five steps, one question per screen, with a progress bar and a back button.
   - All fields required; values limited to the defined options; "Where do you train?" is asked only for strength.
   - Profile is unchanged after logging out and in again.
   - Confirming a changed profile replans the rest of the current week; logged sessions are kept.
4. **Story 1.4 – Demo mode and seed data (NFR1).** As a reviewer, I want to run the app without a key so that I can test it.
   - `COACH_MODE=demo` uses recorded coach responses.
   - "Prøv demo" on the login screen logs in as a seeded user, and a "Demo" badge is shown.
   - One test user per profile A–D (Appendix B), each with a plan and some logs, is created at start-up, so every scenario in Appendix C can be tried in demo mode.
5. **Story 1.5 – Delete account (FR16).** As a user, I want to delete my account so that my health-related data is not kept.
   - Deletion requires an explicit confirmation.
   - After deletion, no profile, plan, log or message for the user remains, and the user can no longer log in.
6. **Story 1.6 – Theme (FR3, NFR8).** As a user, I want light or dark mode so that the app is comfortable to use.
   - Profile offers light, dark and system; the choice is kept the next time the app is opened.
   - Contrast meets NFR8 in both themes.
7. **Story 1.7 – Forgotten password (FR18, NFR3). Moved to version 2; see §6.** As a user, I want to set a new password by email so that I can get back into my account.
   - «Glemt passord?» on the login screen leads to a form that sends a reset link; the reply never reveals whether the address has an account.
   - The link works once and for one hour; too many requests give a clear message.
   - The app still runs locally without keys: the link is written to the server log instead of being sent.

### E2 Plan engine and weekly plan

1. **Story 2.1 – Exercise library (FR6, R5).** As the team, we want a curated exercise library so that plans use real, reviewed exercises.
   - A script selects the subset from Free Exercise DB; the result is committed and reviewed.
   - Each exercise has muscle groups and is marked for the gym, for home (bodyweight) or both.
2. **Story 2.2 – Plan engine (FR4, NFR6).** As a user, I want a plan that fits my week so that I can follow it.
   - Profiles A–D produce the expected plans in Appendix B, on the days given by R9.
   - No generated plan breaks R1–R14 (tested).
   - Next week's plan is generated on the first visit in a new week (Monday–Sunday), and only once.
3. **Story 2.3 – Week plan view (FR4, FR5).** As a user, I want to see my week so that I know what to do next.
   - Next session is highlighted, and the counter shows logged against planned sessions.
   - The new-week banner is shown from the first visit in a new week until the first session is logged.
   - Previous and recommended load, and pace for runs, are shown as in FR5.
4. **Story 2.4 – Program length and running goal (FR4, R13, R14).** As a user, I want my program to follow my progress so that it stays relevant.
   - At the first visit in week 9 of a strength program, the week plan shows a card asking whether the user wants a new program; "Ja, nytt program" creates one by R13, and "Fortsett med dette" or no answer keeps the current program.
   - The week counter starts again when a new program is created or the focus is changed.
   - A running goal is reached by R14; the plan continues unchanged until the user sets a new goal.

### E3 Logging and progression

1. **Story 3.1 – Log a session (FR7, NFR11).** As a user, I want to log how a session went so that the plan builds on what I did.
   - Strength sets are logged one at a time with load and reps; the user can remove a set or log 0 reps; the app moves on when all sets of an exercise are logged.
   - Runs log distance and time.
   - Effort is chosen once after "Fullfør økt", with the Norwegian anchor texts; the note is optional; there is no energy field.
   - The session status is derived from the sets (a set counts with at least 1 rep), not chosen by the user.
   - An active session is restored after the phone is locked or the app is closed.
   - Logging the same session twice does not create two logs (NFR9).
2. **Story 3.2 – History (FR8).** As a user, I want to see what I have done so that I can follow my progress.
   - Logged sessions shown newest first; empty state explains what to do.
3. **Story 3.3 – Progression (FR14).** As a user, I want next week to reflect my logs so that I keep progressing.
   - Strength follows R6: the first logged load is the starting load; an exercise is completed when all its planned sets are logged with at least 1 rep; completed exercises in a session logged "easy" or "ok" progress; "hard" keeps load; in a partly completed session only the exercises that were not completed keep load. Loads are rounded to the nearest 0.5 kg; bodyweight exercises add one rep.
   - Running follows R7: easy short runs and the long run progress separately; "easy" or "ok" allows an increase, "hard" keeps the distance for that run type. The fast short run keeps a fixed distance. Weekly distance increases at most 10 %, and no planned run breaks the 30-day limit. The user's self-reported longest run is the starting point.
   - Two "hard" or not-completed results in a row on the same exercise or run type reduce it by 10 % (R12); the fast short run is not counted.
   - A session reduced by R8, a not-completed session and an unlogged session give no increase; R8-reduced and unlogged sessions do not count towards R12.
   - Each row in the progression table in Appendix A has an automated test (NFR6).
4. **Story 3.4 – Finished session (FR17).** As a user, I want feedback when I finish a session so that I stay motivated.
   - After effort is chosen, the summary, motivational message, quote and next session with its day are shown.
   - The motivational message compares with the previous session of the same type; the first time it is plain encouragement.
   - A celebration is shown when a running goal is reached; confetti, if built, is never shown when the phone is set to reduce motion, and the result is always also given as text.

### E4 Coach dialogue

1. **Story 4.1 – Coach chat and provider (FR9, NFR4, NFR7).** As a user, I want to tell the coach about my week so that I don't have to replan myself.
   - Live and Demo providers share one interface.
   - Only training-relevant fields are sent; errors give a clear message.
2. **Story 4.2 – Structured proposal and validation (FR10, FR12).** As a user, I want only safe changes suggested so that I can trust the coach.
   - Proposals follow the JSON schema; invalid JSON or rule breaks are discarded with an explanation.
   - When the user mentions low energy or a time limit for a session, the coach proposes the R8 reduction for that session; the code sets the size of the reduction.
3. **Story 4.3 – Approve or reject (FR11, FR15, NFR9).** As a user, I want to decide on each change so that I stay in control.
   - The proposal card shows only the changed lines as before → after; approval creates a new plan version; rejection changes nothing.
   - Approving twice creates only one new version; a proposal based on an older plan version is rejected with a clear message.
4. **Story 4.4 – Pain and injury (FR13).** As a user, I want safe advice if I mention pain so that I don't make an injury worse.
   - Any mention of a medical condition gives the fixed reply from R11; no diagnosis is given.
   - The plan is not changed automatically. For pain in a specific exercise, the coach asks if the user wants another exercise; a swap needs approval.
5. **Story 4.5 – Coach scenario tests.** As the team, we want fixed scenarios so that coach behaviour can be checked.
   - The six scenarios in Appendix C pass with recorded responses; results against the live model are documented.

## 6. Out of scope for v1

- **Stage 2:** selectable coaching style, visible plan history, more change types (equipment, new goal), weekly streak (at least one logged session every week), personal records (heaviest load per exercise).
- **Stage 3:** coach memory across conversations, more training types and goals.
- **Version 2: forgotten password (FR18, former Story 1.7).** Sending the reset link by email to any user needs a verified sender domain, and the team does not buy one for v1. The requirements, texts and flow (EXPERIENCE.md Flow 7) and the architecture decision (AD-19) are kept for v2. In v1 a user who has forgotten the password must register a new account.
- **Later versions:** combined running and strength plans; Strava, Apple Health and Garmin import; calendar integration; nutrition; cycle and pregnancy programs; gamification; subscriptions.

**Feedback is not gamification.** The session counter, the motivational message after a session, the motivational quote and the confetti celebration (FR5, FR17) are feedback on the user's own training. They have no points, levels, rewards or competition, so they are not the game mechanics or reward systems the brief leaves out of v1. Streaks and personal records track achievements over time and are moved to stage 2.

## 7. Deviations from the brief

| Brief | v1 | Reason |
| --- | --- | --- |
| Running and strength planned together in one app, instead of in separate apps. | The user chooses one focus, running or strength (FR2). Combined plans are moved to a later version. | Each focus needs its own templates (R4), progression rules (R6, R7) and test profiles. Doing one focus at a time keeps the rule set small enough to test fully (NFR6) and lets the team check every plan against Appendix B. Supporting both focuses in the same app still tests the core idea of one coach for both kinds of training. |
| The user states their available days in the profile. | Onboarding does not ask for available days. The plan engine uses fixed day patterns (R9), and the user tells the coach which days do not suit them (FR9). | Found in the UX work: fewer onboarding steps, and changing days through the coach is the core interaction the app is built around. |

## 8. Open questions

- [x] Which stack? Next.js.
- [x] Which language model? Claude. Who holds the key is still to be settled (NFR3).
- [x] Which source do we cite for the values in R1–R11? See the Basis column in Appendix A and the [research report](research/academic-lit-treningsregler-r1-r11-2026-10-31/research.md).
- [x] Which values do we set where Appendix A said "team to set" (R7, R8)? Set in Appendix A.
- [x] Who reviews R11 and the list of acute symptoms? No longer needed: R11 gives a fixed reply and no medical advice.
- [ ] Should a check in the code run before a message reaches the language model, so that pain statements are handled under NFR4 and FR13? To be settled in the architecture document.
- [x] Which fixed goals are offered in v1? Running (first 5 km, 10 km, half marathon) and strength (focus upper body, lower body or full body). See FR2.
- [x] Is running in v1, or strength only? Both.
- [x] How is the starting load for strength set? From the first logged session (R6).
- [x] Which run types are used? Easy long run, easy short run and fast short run (R4).
- [x] What fixed distance does the fast short run get? The same as the easy short run in the user's first plan week (R7).
- [x] When does a set count as completed, and how are 0 reps counted? A set counts with at least 1 rep; 0 reps is not completed (FR7, R6). Decided 2026-11-16.
- [x] What is a new strength program after 8 weeks? Same focus and sessions per week, new exercises where the library has alternatives, loads carried over (R13). Decided 2026-11-16.
- [x] When is a running goal reached? At the first completed run of at least the goal distance (R14). Decided 2026-11-16.
- [x] Which days are used when onboarding does not ask for them? Fixed day patterns (R9). Decided 2026-11-16.
- [x] Which equipment options are offered? At the gym, or at home with bodyweight (FR2, R5). Decided 2026-11-16.

## Appendix A – Training rules

Bracketed numbers in the Basis column refer to the [research report](research/academic-lit-treningsregler-r1-r11-2026-10-31/research.md). **Team choice** means a product decision, and **convention** means common practice that we did not find tested. Most sources were read only as abstracts or excerpts, so the report's confidence ratings apply.

| Rule | Description | Basis |
| --- | --- | --- |
| R1 | Sessions per week = the number the user chose in onboarding, 2–5. Strength goals train each major muscle group at least 2 days per week. | At least 2 days: ACSM 2026 [1]. Max 5: team choice. |
| R2 | At least one rest day per week; never more than 3 training days in a row. | Convention, kept as a safety choice. No limit found; small trials of 3 days in a row showed no penalty [12]. |
| R3 | No two heavy strength sessions for the same body part, or two hard runs, on consecutive days. The long run and the fast short run count as hard runs. If the available days make this impossible, a fast short run becomes an easy short run. | Convention. Recovery varies with effort and volume, so 48 hours is not a proven limit [7][28]. |
| R4 | Template by focus and session count. **Strength:** 2 → 2 full body · 3 → 3 full body · 4 → upper/lower ×2 · 5 → upper/lower and push/pull/legs. Every template trains both upper and lower body during the week; the chosen main focus gets extra volume. **Running** uses three run types – easy long run, easy short run and fast short run: 2 → long + easy short · 3 → long + easy short + fast short · 4 → long + 2 easy short + fast short · 5 → long + 2 easy short + 2 fast short. The long run is placed on the last training day of the week. Running and strength are not combined in v1. | Team choice. Full body and split give similar results at equal volume [8]. Run types: team choice. |
| R5 | Exercises only from the library, matching where the user trains: at the gym, or at home with bodyweight. | Team choice. |
| R6 | Strength progression, per exercise: all sets completed and session effort "easy" or "ok" → increase load by up to 10 %, rounded to the nearest 0.5 kg; if rounding gives no increase, add one rep instead. Bodyweight exercises always add one rep. Effort "hard" or exercise not completed → keep. A set counts as completed when it is logged with at least 1 rep; an exercise is completed when all its planned sets are completed. The starting load is the load the user logs the first time they do the exercise; until then the plan shows sets and reps only. The session effort applies to every exercise in the session. "Easy" and "ok" are treated the same in v1. | 10 % limit: upper end of ACSM 2009 [14], not confirmed in the 2026 update. Load or reps: [15]. The effort scale, treating "easy" like "ok", and counting a set from 1 rep: team choice. Counting from 1 rep means load can increase even when fewer reps than planned were done. |
| R7 | Running progression, measured in distance: weekly distance increases at most 10 % from the last completed week, and no planned run is more than 10 % longer than the longest run in the last 30 days. The first run, and any run when there is no recent run, is based on the longest run the user entered themselves (at most 10 % above it). Easy short runs and the long run progress separately: a completed run with effort "easy" or "ok" allows an increase for that run type; "hard", partly completed or not completed → keep the distance for that run type. The fast short run keeps a fixed distance, set once to the distance of the easy short run in the user's first plan week; instead of progressing, the app shows the pace from the previous fast short run and encourages the user to beat it. | 30-day limit: observational association [3]. Weekly 10 %: convention, not injury prevention [2][19]. Effort for running, separate run types and the fixed fast run: team choice. |
| R8 | Low energy or a time limit for a session, told to the coach in the chat → the coach proposes a reduced volume for that day's session, or for the next planned session if there is none that day. The code sets the reduction: one set fewer per exercise for strength, running distance 25 % shorter. The reduction applies only to that session and is not carried forward: if the plan says 4 sets and the user is tired on Monday and Tuesday, both sessions get 3 sets. Energy is not asked for in the session log. | Team choice. Not tested directly; indirect support that a small reduction costs little [17]. |
| R9 | Sessions are placed on fixed day patterns by session count: 2 → Tue, Thu · 3 → Mon, Wed, Sat · 4 → Mon, Wed, Fri, Sun · 5 → Mon, Tue, Thu, Fri, Sat. No sessions on days the user has told the coach they cannot train; moving sessions away from such days follows R2, R3 and R10. | Team choice. The patterns spread the sessions over the week and match the test profiles in Appendix B. |
| R10 | A missed session is moved only if R2, R3 and R7 still hold; key sessions (e.g. long run) take priority. | Convention [21]. |
| R11 | The user mentions a medical condition (symptoms, pain or injury) → the fixed reply "Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging."; no diagnosis, no automatic plan change. Load is never adjusted from a pain score. | Team choice: the app does not give medical advice. No study tested this for apps. |
| R12 | Step back: two results in a row that are "hard" or not completed (a partly completed run, or an exercise whose sets were not all completed, counts as not completed), on the same strength exercise or the same run type (easy short run or long run; the fast short run is not counted) → reduce its load or distance by 10 %, rounded to the nearest available step. Sessions reduced by R8 and unlogged sessions are skipped when counting and do not break the run. After a step back the count starts again from zero. | Team choice. Protects against a starting level that is set too high (for example an overestimated longest run, R7) and against stalling on "hard" for weeks. Not tested directly. |
| R13 | A strength program lasts 8 weeks, counted from the program start. At the first visit in week 9, the user is asked whether they want a new program. A new program keeps the focus and sessions per week, picks new exercises where the library has alternatives (R5), and carries the logged loads over. "Fortsett med dette" or no answer keeps the current program. The week count starts again when a new program is created or the focus is changed; other profile changes do not reset it. Focus and sessions per week are changed in Profil (FR3). | Team choice. |
| R14 | A running goal is reached at the first completed run of at least the goal distance. The app celebrates it (FR17) and tells the user they can set a new goal in Profil; the plan continues unchanged until the goal is changed. A running program has no time limit. | Team choice. |

### Effort scale

The scale is a team choice; we found no validation of a three-point scale (research report). The anchors make it more consistent between users. They are based on reps in reserve for strength and the talk test for running. The UI shows the Norwegian names Lett, Passe and Tung with the Norwegian anchor texts in EXPERIENCE.md (NFR10).

| Effort | Strength | Running |
| --- | --- | --- |
| Easy | "I could have done 4 or more reps more" | "I could talk in full sentences" |
| Ok | "I had 2–3 reps left" | "I could talk in short sentences" |
| Hard | "I had 0–1 reps left, or my technique broke down" | "I could only say single words" |

### Progression table (R6, R7, R8, R12)

What a logged result means for the next session of the same exercise or run type. Each row is an automated test case (NFR6). The running column applies to the easy short run and the long run; the fast short run always keeps its distance.

| Logged result | Strength (per exercise) | Running (per run type) | Counts towards R12 |
| --- | --- | --- | --- |
| Completed, "easy" or "ok" | Increase by R6 | Increase within R7 limits | No, resets the count |
| Completed, "hard" | Keep | Keep | Yes |
| Partly completed | Not completed exercises keep; completed exercises follow the session effort | Keep | Yes, for the parts not completed |
| Not completed | Keep | Keep | Yes |
| A set logged with 0 reps | The exercise is not completed: keep | – | Yes, for that exercise |
| Not logged | No change | No change | Skipped |
| Session reduced by R8 | Keep | Keep | Skipped |
| Finished automatically at midnight, no effort (FR7) | Completed exercises keep; not completed exercises keep | Keep | Only for the parts not completed |
| Second "hard" or not completed in a row | −10 % (R12) | −10 % (R12) | Count resets |

## Appendix B – Test profiles

| Profile | Goal and experience | Sessions and equipment | Expected weekly plan |
| --- | --- | --- | --- |
| A | Strength · beginner at the gym · full body | 2 sessions per week · gym | 2 full-body sessions: Tue, Thu |
| B | Strength · experienced at the gym · full body | 5 sessions per week · gym | 5 sessions: Mon lower, Tue upper, Thu push, Fri pull, Sat legs; Wed and Sun rest; app explains why |
| C | Running · beginner · goal 10 km · can run 3 km | 3 sessions per week | 3 runs: Mon easy short, Wed fast short, Sat long |
| D | Running · experienced · goal half marathon · can run 15 km | 4 sessions per week | 4 runs: Mon easy short, Wed fast short, Fri easy short, Sun long |

The days follow the day patterns in R9.

## Appendix C – Coach scenarios

| Profile | User message | Expected plan change |
| --- | --- | --- |
| D | "I'm away Thursday to Sunday" | No sessions Thu–Sun; at most one session moved earlier |
| D | "I only have time for two sessions this week" | 2 sessions; long run kept as key session |
| D | "I'm completely out of energy today" | Coach proposes reducing today's session by R8 (25 % shorter); applied after approval |
| B | "The gym is closed, I need to do a home workout without any equipment" | Strength exercises swapped to bodyweight exercises; session count unchanged |
| B | "My knee hurts" | Fixed reply from R11, then the coach asks whether the user wants to swap the affected exercise for another one. No change unless the user approves the proposal |
| B | "I have chest pain" | No automatic plan change; fixed reply from R11 |

## Change log

| Date | Version | Change |
| --- | --- | --- |
| 2026-10-11 | 0.1 | First draft from product brief and teacher feedback |
| 2026-10-31 | 0.2 | Training rules updated from research: R1, R4, R6, R7, R8, R10 and R11 changed, Basis column added, FR13, Stories 3.3, 4.4 and 4.5 and Appendix C updated, health data assumption and open questions added |
| 2026-10-31 | 0.3 | Open questions answered: stack Next.js, model Claude; R7 uses the user's own longest run; R8 set to 25 % less distance or one set fewer, not carried forward; R11, FR13, Story 4.4 and Appendix C changed to a fixed reply for medical conditions |
| 2026-10-31 | 0.4 | Fixed goals and onboarding flow defined (FR2); test profiles A–D replaced (two strength, two running); Appendix C scenarios assigned to profiles; open questions on fixed goals and running closed |
| 2026-10-31 | 0.5 | Perceived effort defined: R6 clarified (session effort applies to all exercises, "easy" = "ok"), R7 uses effort and progresses easy runs and the long run separately, new R12 step back after two "hard" or not-completed results in a row; effort scale with anchors and progression table added to Appendix A; FR4, FR7, FR10, FR14, the log screen and Stories 2.2, 3.1 and 3.3 updated |
| 2026-11-08 | 0.6 | Appendix C: home workout without equipment now swaps to bodyweight exercises; "knee hurts" gives the fixed reply plus a question about swapping the exercise (FR13, Story 4.4) |
| 2026-11-09 | 0.7 | Gaps before implementation closed: starting load from the first logged session and 0.5 kg rounding (R6), bodyweight exercises add one rep; energy removed from the session log and given only in the chat (FR7, FR9, R8); combined templates removed from R4 and three run types added (easy long, easy short, fast short with fixed distance equal to the first week's easy short run and an explanation on the log screen, R3, R4, R7, R12, Appendix B); Monday–Sunday plan week and replanning after profile change (FR3, FR4); full body clarified (FR2); new FR16 delete account, NFR9 robustness and NFR10 Norwegian UI; seed users for profiles A–D (Story 1.4) and new Story 1.5; section 7 Deviations from the brief; change log order fixed |
| 2026-11-09 | 1.0 | Version 1.0: baseline for UX, architecture, and epics and stories. Later changes go through `bmad-correct-course` and are recorded here |
| 2026-11-16 | 1.1 | Changes from the UX work, through `bmad-correct-course` ([sprint change proposal](sprint-change-proposal-2026-11-16.md)): five-step onboarding without available days and with two equipment options (FR2, R1, R5, new fixed day patterns in R9, Appendix B); 8-week strength program (new R13) and running goal (new R14) with Story 2.4; week counter, new-week banner, previous and recommended load and pace (FR4, FR5); set-by-set logging with status derived from sets and a set counted from 1 rep (FR7, R6, progression table); time-limited session added to R8; proposal card shows only changed lines and FR15 rewritten so the week plan has no change markers (FR11, FR15); new FR17 finished session with confetti as should-have, Story 3.4; theme choice and Story 1.6 (FR3); demo button and badge (NFR1); WCAG 2.2 AA, reduced motion and 200 % text (NFR8); Norwegian effort names and tone (NFR10); new NFR11 restore active session; §6 explains why feedback is not gamification and moves streaks and personal records to stage 2; §7 new deviation for available days; §8 new questions answered; database changed from SQLite to PostgreSQL after the architecture choice (NFR5, §4) |
| 2026-11-18 | 1.2 | Found while writing epics and stories: a started session that is not finished is finished automatically at midnight (Europe/Oslo) at the end of the day it was started, without effort or note, and locked (FR7); new row in the progression table: such a session gives no increase, and only its not-completed parts count towards R12 |
| 2026-11-22 | 1.3 | New FR18 forgotten password and Story 1.7, after comparing with the lecturer's reference stories for login («Reset a forgotten password by email»). The lecturer's other login stories (roles, invitations, admin area, institutions, audit log) do not fit an app with one user type and open registration and were left out. UI table and E1 updated; email provider in architecture AD-19 |
| 2026-11-22 | 1.5 | Forgotten password (FR18, Story 1.7) moved to version 2: reset links by email to any user need a verified sender domain, which the team does not buy for v1. FR18 is kept for v2 and marked as moved; §5, §6 and the capability table updated. Decided by Knut, approved by the group in the pull request |
