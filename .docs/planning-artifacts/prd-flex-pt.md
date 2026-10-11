# Flex PT – Product Requirements Document

**Status:** Draft v0.1 · **Based on:** Product brief (2026-09-17) and teacher feedback (2026-10-06) · **Scope:** Version 1 (MVP, stage 1)

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

Requirements are numbered so they can be traced to stories, code and tests. The Source column refers to the five core capabilities in the product brief. Rules R1–R11 are listed in Appendix A.

### Functional requirements

| ID | Requirement | Source |
| --- | --- | --- |
| FR1 | A user can register with email and password, log in and log out. | Capability 1 |
| FR2 | During onboarding, the user sets a goal (from a fixed list), experience level, desired sessions per week, available days and equipment. | Capability 1 |
| FR3 | The user can edit the profile later. A changed profile produces a new plan version after the user confirms. | Capability 1 |
| FR4 | The system generates a weekly plan from the profile using the rule-based plan engine (R1–R11). | Capability 2 |
| FR5 | The plan shows each session with day, type and content: exercises with sets, reps and load, or run duration and distance. | Capability 2 |
| FR6 | Exercises are selected from the exercise library and filtered by the user's equipment. | Capability 2 |
| FR7 | The user can log a session as completed, partly completed or not completed, with perceived effort (easy, ok, hard), energy level and an optional note. | Capability 3 |
| FR8 | The user can view their training history. | Capability 3 |
| FR9 | The user can send free-text messages to the coach about changes in availability, energy or equipment. | Capability 4 |
| FR10 | The coach returns a structured change proposal, which is validated against R1–R11 before the user sees it. | Capability 4 |
| FR11 | A valid proposal is shown as before and after. Approval creates a new plan version; rejection leaves the plan unchanged. | Capability 4 |
| FR12 | If a proposal breaks a rule, it is discarded, the plan is unchanged, and the coach explains why. | Capability 4 |
| FR13 | If the user mentions pain or injury, the coach does not change the plan and advises contacting a professional (R11). | Capability 4 |
| FR14 | Next week's plan adjusts load based on logged sessions (R6, R7). | Capability 5 |
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
| Onboarding | Short step-by-step form for goal, experience, sessions, days and equipment | FR2 |
| Week plan (home) | This week's sessions per day, next session highlighted, changes since last version marked | FR4, FR5, FR15 |
| Session detail and log | Exercises for the session, where the user can write down their weight and number of reps per set or their run statistics. | FR5, FR7 |
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
- **Stack:** to be decided in the architecture document (candidates: Next.js with TypeScript, or FastAPI with React).

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
   - A test user with profile C, a plan and some logs is created at start-up.

### E2 Plan engine and weekly plan

1. **Story 2.1 – Exercise library (FR6).** As the team, we want a curated exercise library so that plans use real, reviewed exercises.
   - A script selects the subset from Free Exercise DB; the result is committed and reviewed.
   - Each exercise has equipment and muscle groups.
2. **Story 2.2 – Plan engine (FR4, NFR6).** As a user, I want a plan that fits my week so that I can follow it.
   - Profiles A–D produce the expected plans in Appendix B.
   - No generated plan breaks R1–R11 (tested).
3. **Story 2.3 – Week plan view (FR5, FR15).** As a user, I want to see my week so that I know what to do next.
   - Next session is highlighted.
   - Changes since the previous version are marked.

### E3 Logging and progression

1. **Story 3.1 – Log a session (FR7).** As a user, I want to log how a session went so that the plan builds on what I did.
   - Status, effort and energy are required; note is optional.
2. **Story 3.2 – History (FR8).** As a user, I want to see what I have done so that I can follow my progress.
   - Logged sessions shown newest first; empty state explains what to do.
3. **Story 3.3 – Progression (FR14).** As a user, I want next week to reflect my logs so that I keep progressing.
   - Completed and "ok" strength sessions increase load by R6; hard or incomplete keep load.
   - Weekly running volume increases at most 10 % (R7).

### E4 Coach dialogue

1. **Story 4.1 – Coach chat and provider (FR9, NFR4, NFR7).** As a user, I want to tell the coach about my week so that I don't have to replan myself.
   - Live and Demo providers share one interface.
   - Only training-relevant fields are sent; errors give a clear message.
2. **Story 4.2 – Structured proposal and validation (FR10, FR12).** As a user, I want only safe changes suggested so that I can trust the coach.
   - Proposals follow the JSON schema; invalid JSON or rule breaks are discarded with an explanation.
3. **Story 4.3 – Approve or reject (FR11, FR15).** As a user, I want to decide on each change so that I stay in control.
   - Before and after shown; approval creates a new plan version; rejection changes nothing.
4. **Story 4.4 – Pain and injury (FR13).** As a user, I want safe advice if I mention pain so that I don't make an injury worse.
   - No plan change; advice to contact a professional.
5. **Story 4.5 – Coach scenario tests.** As the team, we want fixed scenarios so that coach behaviour can be checked.
   - The five scenarios in Appendix C pass with recorded responses; results against the live model are documented.

## 6. Out of scope for v1

- **Stage 2:** selectable coaching style, visible plan history, more change types (equipment, new goal).
- **Stage 3:** coach memory across conversations, more training types and goals.
- **Later versions:** Strava, Apple Health and Garmin import; calendar integration; nutrition; cycle and pregnancy programs; gamification; subscriptions.

## 7. Open questions

- [ ] Which stack: Next.js with TypeScript, or FastAPI with React?
- [ ] Which language model provider, and who holds the key?
- [ ] Which source do we cite for the values in R1–R11?
- [ ] Which fixed goals are offered in v1?
- [ ] Is running in v1, or strength only?

## Appendix A – Training rules

| Rule | Description |
| --- | --- |
| R1 | Sessions per week = the lower of desired sessions and available days, max 5. |
| R2 | At least one rest day per week; never more than 3 training days in a row. |
| R3 | No two heavy strength sessions for the same body part, or two hard runs, on consecutive days. |
| R4 | Template by session count: 2 → 2 full body · 3 → 3 full body, or 2 strength + 1 run · 4 → upper/lower ×2, or 2 strength + 2 runs.  5 → upper/lower and push/pull/legs or upper/lower ×2 + 1 run. 6 → push/pull/legs x2 or  upper/lower ×2 and 2 runs. |
| R5 | Exercises only from the library, matching the user's equipment. |
| R6 | Strength progression: all sets completed and effort "ok" → increase load (e.g. 2.5 kg) or one rep; hard or incomplete → keep. |
| R7 | Running progression: weekly distance or time increases at most 10 % from the last completed week. |
| R8 | Low energy → next session has reduced volume (e.g. one set fewer), decided by the code. |
| R9 | No sessions on days marked unavailable. |
| R10 | A missed session is moved only if R2 and R3 still hold; key sessions (e.g. long run) take priority. |
| R11 | Pain or injury mentioned → no plan change; advise contacting a professional. |

## Appendix B – Test profiles

| Profile | Goal and experience | Days and equipment | Expected weekly plan |
| --- | --- | --- | --- |
| A | Get stronger · beginner | Tue, Thu · bodyweight | 2 full-body sessions: Tue, Thu |
| B | First pull-up · beginner | Mon, Wed, Fri · dumbbells, doorway bar | 3 full-body sessions with pulling focus: Mon, Wed, Fri |
| C | Half marathon · intermediate | Mon, Wed, Fri, Sun · gym | 2 strength (Mon, Fri) + 2 runs (Wed easy, Sun long) |
| D | Build muscle · experienced · wants to work out every day | Mon, Tue, Wed, Thu, Fri, Sat, Sun | 5 sessions: Mon lower, Tue upper, Thu push; Fri pull; Sat legs; Wed and sun rest; app explains why |

## Appendix C – Coach scenarios (profile C)

| User message | Expected plan change |
| --- | --- |
| "I'm away Thursday to Sunday" | No sessions Thu–Sun; at most one session moved earlier |
| "I only have time for two sessions this week" | 2 sessions; long run kept as key session |
| "I'm completely out of energy today" | Today's session reduced by R8 |
| "The gym is closed, I need to do a home workout without any equipment" | Strength exercises swapped to dumbbell versions; session count unchanged |
| "My knee hurts" | No plan change; advice to contact a professional (R11) |

## Change log

| Date | Version | Change |
| --- | --- | --- |
| 2026-10-11 | 0.1 | First draft from product brief and teacher feedback |
