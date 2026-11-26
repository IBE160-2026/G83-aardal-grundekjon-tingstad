# Epic 2 Context: Get a personal weekly plan

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

After onboarding the user gets a rule-based weekly plan that is shown clearly on the Uke tab, follows the 8-week strength program, and is replanned when the profile changes. Everything a plan contains is computed by one pure, deterministic plan engine, so the rules live in one place and can be tested exhaustively.

## Stories

- Story 2.1: Exercise library (done)
- Story 2.2: Plan engine generates the first week
- Story 2.3: See this week's plan
- Story 2.4: Onboarding
- Story 2.5: A new week starts
- Story 2.6: Edit my profile and running goal
- Story 2.7: The 8-week strength program

## Requirements & Constraints

- The plan follows fixed rules R1–R5 and R9: session count chosen by the user (2–5), each major muscle group at least twice a week for strength, at least one rest day, never more than three training days in a row, no two hard sessions for the same body part and no two hard runs on consecutive days (a fast short run becomes an easy short run if needed), exercises only from the library and matching where the user trains.
- Strength and running are never combined. Strength templates by session count: 2 and 3 full body, 4 upper/lower ×2, 5 upper/lower plus push/pull/legs. Running uses long, easy short and fast short runs, the long run on the last training day.
- Day patterns are fixed by session count: 2 → Tue, Thu · 3 → Mon, Wed, Sat · 4 → Mon, Wed, Fri, Sun · 5 → Mon, Tue, Thu, Fri, Sat.
- First-week volume are named constants with a test each: strength sets, reps and exercises per session by experience (main focus gets one extra set; no load is set before the user logs it), running distances from the longest run capped at the goal distance, rounded down to 0.5 km.
- Test profiles A–D (Appendix B) plus E (engine tests only: home, main focus upper) give the expected weeks; one Vitest test per profile.
- UI text in bokmål, WCAG 2.2 AA, double submits create one of each thing.

## Technical Decisions

- **Engine** in `src/shared/engine`: pure function of plain data (profile, exercise library, program start, today's date). No database, clock, network or framework (enforced by ESLint). `lib/dates.ts` supplies Oslo dates, Monday `week_start` and program week.
- **Plan slice** (`features/plan`) owns program, plan week, plan version, session and session slot tables. A plan version covers one week, is immutable and is created once per change; one current program per user and one plan week per program and `week_start`; every table cascades from the user and extends the deletion test.
- `plan.api.ensureCurrentWeek` stores the engine's version for the week that contains today and nothing else; skipped weeks are never filled in.
- A program started mid-week gets a first week with only the R9 days from the start date onward.
- Sessions keep a stable identity across versions so logs never point at a removed session.

## UX & Interaction Patterns

- Uke shows a `day-row` per day, today with a primary border, rest days muted with «Hviledag» and a short supportive line, a progress bar «X av Y økter», and «Neste økt» when today is free. No week browsing.
- Onboarding: one question per screen with choice cards and number chips, back keeps answers, progress «Steg N av M».

## Cross-Story Dependencies

- 2.2 builds on the library and Zod schema from 2.1 and on the profile shape from Story 1.4; 2.3 stores and shows what the engine returns, 2.4 and 2.6 call it through `plan.api`, 2.5 needs the engine to take the previous week as input, 2.7 adds program weeks.
- Epic 3 progression and Epic 4 coach proposals call the same engine, so its functions stay pure and take logs as arguments.
