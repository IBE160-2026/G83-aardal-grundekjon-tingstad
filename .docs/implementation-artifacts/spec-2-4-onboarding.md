---
title: 'Story 2.4: Onboarding'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
baseline_commit: 'ebec67272b68e41eb60cff0a14230591ebd35fd9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A user who registers has no profile and no plan: Uke is empty and only demo users get a week. The profile can be stored (Story 1.4) and the plan made (Stories 2.2–2.3), but nothing asks the questions (FR2).

**Approach:** An `onboarding` slice with one question per screen: focus, then the focus-specific answers, sessions per week, and (strength only) where to train. A signed-in user without a profile is sent to `/onboarding` from the app shell. The final press saves the profile through `profile.api` and creates the program and first week through `plan.api`, shows «Lager planen din …» and lands on Uke.

## Boundaries & Constraints

**Always:** Steps and fields: (1) Styrke or Løping as `choice-card`s; (2) strength: Hovedfokus (overkropp, underkropp, hele kroppen) and Erfaring (nybegynner, erfaren); running: Mål (første 5 km, 10 km, halvmaraton) and Lengste løpetur; (3) økter per uke 2–5 as `number-chip`s; (4) strength only: «På treningssenter» or «Hjemme». Progress «Steg N av M» with M = 5 for strength and 4 for running (the last step is the plan being made). Back keeps every answer. The server validates with the profile's Zod schema (`profile.api`), only the defined options, the longest run 1–50 km with a plain-text error under the field (a decimal comma is accepted), and a missing or unknown value is rejected. The slice takes the user id only from the session. Saving is idempotent: an existing profile is never overwritten (Story 2.6 edits it), and a second press creates one profile and one program. App routes send a signed-in user without a profile to `/onboarding`; `/onboarding` sends one with a profile to Uke; the page has no tab bar. A button advances; a choice only selects. The question screen has a progress bar, a heading that takes focus on each step, `role="alert"` for errors, a selected card shows ✓ and not only colour, 44 px targets, bokmål du-form, tokens only, WCAG 2.2 AA in both themes, 320 px and 200 % text, no motion with reduced motion.

**Never:** No «Tilgjengelige dager» question, no edit of an existing profile, no coach, no e-mail. No change to the engine or the plan tables. No question that is not in the list.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| New user, strength | registered, no profile | steps 1–4, then Uke with plan and welcome hint | N/A |
| New user, running | choose Løping | steps 1–3 only, «Steg N av 4», then Uke | N/A |
| Back | any step | previous step, answers kept | N/A |
| Final press twice | same answers | one profile, one program, one week | second call returns to Uke |
| Logs out and in | profile exists | straight to Uke, profile unchanged | N/A |
| User with profile opens `/onboarding` | demo user or finished | redirect to Uke | N/A |
| Longest run | «7,5», «0,5», «51», «abc», empty | 7.5 accepted; others rejected with the text under the field | `invalid_input`, nothing stored |
| Unknown or missing value | forged request | rejected | `invalid_input`, nothing stored |
| No session | action called signed out | nothing stored | `unauthorized` |
| Re-post with a profile | profile exists | nothing overwritten, goes to Uke | N/A |

## Decisions

- **Running users and experience (my choice):** the profile needs an experience value but running onboarding does not ask for one, so it is stored as `beginner`; the engine ignores it for running.
- **Step 1 has no back button:** there is nothing before it, and the login screen would send a signed-in user straight back.
- **Questions on one screen:** strength step 2 (Hovedfokus and Erfaring) and running step 2 (Mål and Lengste løpetur) are one screen each, so strength has 4 question screens and running 3.

</frozen-after-approval>

## Code Map

- `src/features/onboarding/api.ts` -- empty surface; export `OnboardingFlow`, `completeOnboardingAction`
- `src/features/profile/api.ts`, `schemas.ts` -- `getProfile`, `saveProfile`, `profileInputSchema`, option constants, longest-run limits
- `src/features/plan/api.ts` -- `ensureCurrentWeek(userId, now)` creates the program and first week (idempotent, Story 2.3)
- `src/app/(app)/layout.tsx` -- add the redirect to `/onboarding` when there is no profile; `src/app/(app)/uke/page.tsx` -- drop the unreachable no-profile text
- `src/app/(onboarding)/onboarding/` -- new route group with its own layout (session required, no tab bar) and page
- `src/proxy.ts` -- add `/onboarding` to the matcher
- `src/shared/ui/{choice-card,button,progress-bar,input-field}.tsx` -- reuse; add `number-chip.tsx`
- `src/features/profile/components/theme-picker.tsx` -- radio-group pattern with `ChoiceCard`
- `src/features/account/actions.ts` L20 -- login and register go to `/uke`; unchanged, the shell redirects
- `tests/e2e/{auth,theme,account-deletion}.spec.ts` -- register and then expect Uke; each needs the onboarding step added (a shared helper)
- `tests/integration/demo.test.ts` -- cookie-jar harness to copy; `tests/e2e/uke.spec.ts` -- axe and 320 px patterns
- UX: `EXPERIENCE.md` L231-L243, L132-L160; `DESIGN.md` number-chip, choice-card; `mockups/key-onboarding.html`

## Tasks & Acceptance

**Execution:**
- [x] `src/features/onboarding/` -- schema and mapping to a profile, `completeOnboardingAction`, `OnboardingFlow` client component with steps, back, progress, loading state -- AC 1–6
- [x] `src/shared/ui/number-chip.tsx` -- round radio chip with ✓ when selected -- AC 2
- [x] `src/app/(onboarding)/...`, `(app)/layout.tsx`, `uke/page.tsx`, `proxy.ts` -- routes and redirects -- AC 1, 7
- [x] `tests/integration/onboarding.test.ts` -- strength and running, double press, validation matrix, unauthorized, existing profile kept, forged values -- AC 3–5
- [x] `tests/e2e/onboarding.spec.ts` -- strength and running flows, back, errors, logout and login, keyboard only, ✓, axe in both themes, 320 px and 200 % -- AC 2, 6, 8
- [x] `tests/e2e/{auth,theme,account-deletion}.spec.ts` -- complete onboarding after registering (shared helper) -- keeps the existing tests green
- [x] README, `sensorveiledning-sporbarhet.md`, `sprint-status.yaml` -- status -- CLAUDE.md

**Acceptance Criteria:**
- Given a registered user without a profile, when the app is opened, then they are sent to onboarding step 1
- Given the flow, then it shows one question per screen with «Steg N av M» (5 strength, 4 running) and back keeps the answers
- Given answers, when submitted, then the server rejects missing or unknown values and a longest run outside 1–50 km with a plain-text error under the field
- Given valid answers, when the last step is finished, then the profile, the program and the first week exist once and Uke opens with the plan and the welcome hint, also when the button is pressed twice
- Given a user with a profile, when they log out and in, then they go straight to Uke with the profile unchanged
- Given keyboard only and 200 % text, then every choice is reachable and selected cards show ✓

## Implementation Notes

- Implementert direkte (ingen underagent). Skjema og mapping i `schemas.ts`, logikk i `complete.ts` (testbar uten Next), action i `actions.ts`, flyten i `onboarding-flow.tsx`.
- `profile.api` eksporterer nå også alternativene og grensene (`EQUIPMENT`, `EXPERIENCES`, `MAIN_FOCUSES`, `RUNNING_GOALS`, `MIN_LONGEST_RUN_KM`, `MAX_LONGEST_RUN_KM`) til serverkoden i onboarding. Klientkomponenten har egne konstanter, siden `profile/api` drar inn server-only.
- Uke-siden mistet teksten for bruker uten profil (utilgjengelig nå, siden skallet sender til onboarding).
- Eksisterende Playwright-tester som registrerer en bruker fullfører onboarding med hjelperen `tests/e2e/onboarding-helper.ts`. Testen av faner i `auth.spec.ts` sjekker ikke plassholdertekst for Uke lenger.
- `expect`-tidsavbruddet i `playwright.config.ts` er hevet fra 5 til 15 s: å lage planen og redirecte tok i noen kjøringer med flere arbeidere mot en kald server over 5 s.

## Spec Change Log

## Review Triage Log

Gjennomgang gjort av hovedagenten selv (ingen underagenter startet uten ønske fra brukeren).

| Funn | Verdikt | Bevis | Rute |
| ---- | ------- | ----- | ---- |
| Knappen på steg 1 het «Lag planen» før fokus var valgt, fordi steglisten da har ett steg | medium | Playwright fant ingen «Neste»-knapp; `isLastQuestion` er nå aldri sann på steget «focus» | patch |
| Klienten viste «Vi fikk ikke laget planen» når action kastet `NEXT_REDIRECT` (suksess) | high | Feilsøkingstekst i en midlertidig bygging viste `Error: NEXT_REDIRECT` i feilmeldingen; fikset med `unstable_rethrow` | patch |
| Siden ble stående på «Lager planen din …» i over 5 s under belastning, og testene feilet | medium | Siden viste lastetilstand da testen ga opp; ikke en funksjonsfeil. Alle 63 Playwright-tester grønne tre ganger etter at `expect`-grensen ble hevet til 15 s | patch (config); oppfølging: finn ut hvorfor første plan tar flere sekunder |
| Fire eksisterende e2e-spesifikasjoner forventet Uke rett etter registrering | high | Feilet først; nå fullfører de onboarding via en felles hjelper | patch |
| Dobbelttrykk kan lage to programmer | false | Integrasjonstest med tre samtidige kall gir én profil, ett program og én uke | rejected |
| En bruker som registrerer seg kan ikke gå tilbake fra steg 1 | low | Spec-ens valg (ingenting før steg 1, innloggingssiden sender tilbake) | rejected |

## Verification

**Commands:**
- `docker compose up -d db && npm run db:migrate` -- expected: migrations apply
- `npm run lint && npm run typecheck && npm run format:check && npm test` -- expected: all pass
- `npm run test:e2e` -- expected: all pass, including the updated auth, theme and deletion tests
