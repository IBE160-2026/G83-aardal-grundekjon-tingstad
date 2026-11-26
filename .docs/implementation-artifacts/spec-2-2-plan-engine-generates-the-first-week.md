---
title: 'Story 2.2: Plan engine generates the first week'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
baseline_commit: '10a49fc76d8bba15d0dbe42e9ae149b8ac5f13c5'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app has a profile and an exercise library but nothing that turns them into a plan. Without one pure, tested engine the rules R1–R5, R7 and R9 would be implemented in several places and drift apart (AD-2).

**Approach:** Add `generateFirstWeek` and `validateWeek` to `src/shared/engine`: plain data in (profile, library, program start, today), the week's sessions out, with the starting volume from PRD Appendix A as named constants. A validator proves R1–R5, R7 and R9 on every combination of profile options, and one Vitest test per profile A–E proves the expected week.

## Boundaries & Constraints

**Always:** The engine and `shared/lib` stay pure: no DB, clock, network, framework or Node built-ins (ESLint enforces it). Day patterns (R9), templates (R4), slot tables and starting volume are named constants, each with a test. Strength: no load is set (`load: null`). Gym users prefer exercises marked `gym`, then `both`; home users get only `both`. Exercise choice is the first match in library order, the same exercises for sessions of the same template in a week, except that biceps and triceps alternate between upper sessions. Body parts for R3 are legs (squat, hinge, single-leg, calf), push and pull; `upper` trains push and pull, `lower` trains legs. Running: long run = longest run capped at the goal (5, 10, 21.1 km), rounded down to 0.5 km; easy short = min(long, max(2, floor(50 % of long))); fast short = easy short, returned as `fastShortRunKm` for the program. Run types by day: 2 → easy, long · 3 → easy, fast, long · 4 → easy, fast, easy, long · 5 → easy, fast, fast, easy, long. Week = Mon–Sun in Europe/Oslo; days before `max(programStart, today)` are dropped.

**Never:** No database tables, migrations, API, UI or Zod profile schema (Stories 2.3–2.4). No progression, logs, programme weeks or R8/R10–R14 (later stories). No read of the clock. No exercise outside the library.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Profile A | strength, beginner, full, 2, gym | Tue, Thu full body, 4 exercises, 3×10, no load | N/A |
| Profile B | strength, experienced, full, 5, gym | Mon lower (5), Tue upper (5), Thu push (4), Fri pull (4), Sat legs (4), 4×8 | N/A |
| Profile C | running, beginner, 10k, 3 km, 3 | Mon easy 2, Wed fast 2, Sat long 3 | N/A |
| Profile D | running, experienced, half, 15 km, 4 | Mon 7.5, Wed fast 7.5, Fri 7.5, Sun long 15 | N/A |
| Profile E | strength, beginner, upper, 3, home | Mon, Wed, Sat full body, bodyweight; push and pull 4×10, squat and hinge 3×10 | N/A |
| Mid-week start | program starts Wednesday, 3 sessions | only Wed and Sat | N/A |
| Missing pattern at home | library without a calf exercise | fallback pattern, else slot left out | N/A |
| Wrong week | `today` outside the week of `programStart` | none | throws `RangeError` |

</frozen-after-approval>

## Code Map

- `src/shared/engine/exercise.ts` -- library schema, `MOVEMENT_PATTERNS`, `patternGaps`; reuse the types
- `src/shared/lib/dates.ts` -- `weekStart`, `toOsloDate`; add `addDays` and `isoWeekday` (1 = Monday)
- `src/features/profile/schemas.ts` L6-L15 -- allowed profile values (`upper_body`, `home`, `half_marathon`, …); the engine defines its own plain types with the same values (engine must not import slices)
- `data/exercises/exercises.json` -- the library the tests use
- `eslint.config.mjs` L104-L129 -- purity rules for `engine` and `lib`
- `tests/engine/exercises.test.ts`, `tests/engine/dates.test.ts` -- test style to follow
- `.docs/planning-artifacts/prd-flex-pt.md` L228-L344 -- R1–R9, Starting volume, Appendix B and E

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/lib/dates.ts` + `tests/engine/dates.test.ts` -- `addDays`, `isoWeekday` -- week arithmetic without the clock
- [x] `src/shared/engine/plan-constants.ts` -- day patterns, templates, slot tables, starting volume, run types, goal km -- named constants (AC 3)
- [x] `src/shared/engine/plan.ts` -- types and `generateFirstWeek` (strength and running) -- AC 1, 3, 4, 7
- [x] `src/shared/engine/validate.ts` -- `validateWeek` returning rule violations (R1–R5, R7, R9) -- AC 5
- [x] `tests/engine/plan.test.ts` -- one test per profile A–E, constants, mid-week, fallback, `RangeError` -- NFR6
- [x] `tests/engine/plan-validate.test.ts` -- validator on every strength and running combination with the real library; the validator rejects hand-made broken weeks -- AC 5
- [x] `.docs/sensorveiledning-sporbarhet.md`, `sprint-status.yaml` -- update status -- CLAUDE.md

**Acceptance Criteria:**
- Given the engine files, when ESLint runs, then no purity rule fails
- Given profiles A–E, when the first week is generated, then it matches Appendix B and E
- Given every combination of focus, goal or main focus, experience, sessions and place, when generated and validated, then `validateWeek` reports nothing

## Implementation Notes

## Spec Change Log

## Review Triage Log

Gjennomgang gjort av hovedagenten selv (ingen underagenter startet uten ønske fra brukeren).

| Funn | Verdikt | Bevis | Rute |
| ---- | ------- | ----- | ---- |
| R3 sier «samme kroppsdel», som kan leses som bare overkropp og underkropp | low | Motoren regner per muskelgruppe (bein, push, pull); push og pull på påfølgende dager er tillatt, og profil B passerer | tolkning (i spec: Always); PRD bør presiseres |
| 5 løpeøkter i rekkefølgen lett, rask, lett, rask, lang gir rask fredag og lang lørdag, to harde løp på rad etter R3-ordlyden | low | Motoren bruker lett, rask, rask, lett, lang; gyldig også hvis rask ikke regnes som hard | tolkning (i spec: Always) |
| Validatoren kan passere uten å teste noe | false | Mutasjon: endret R9-mønsteret for 5 økter, og tre tester feilet; konstanten er gjenopprettet | rejected |
| Utvidet kontroll av R1 gjelder bare full uke | low | Delvise uker (programstart midt i uka) kan ikke trene hver muskelgruppe to ganger; følger AD-13 | rejected |
| Ingen test mot R2 i genererte uker med full uke på 5 økter | false | `plan-validate.test.ts` kjører alle 192 kombinasjoner, også fra hver ukedag | rejected |

## Design Notes

Upper and lower in the 4-session template alternate Mon upper, Wed lower, Fri upper, Sun lower (R4). Main-focus extra set: one more set for exercises in the chosen body part (upper: push, pull, biceps, triceps; lower: legs), none for full body or core. Experienced users get the extra slot from the slot table (full body: vertical pull, single-leg or core by main focus).

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm run format:check` -- expected: no errors
- `npx vitest run tests/engine tests/lint` -- expected: all pass
