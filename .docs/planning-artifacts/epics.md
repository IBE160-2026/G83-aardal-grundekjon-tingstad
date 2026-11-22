---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - .docs/planning-artifacts/prd-flex-pt.md (v1.1; v1.2 adds the midnight rule found in this work)
  - .docs/planning-artifacts/architecture/architecture-G83-aardal-grundekjon-tingstad-2026-11-16/ARCHITECTURE-SPINE.md (final, AD-1–AD-18; AD-19 added 2026-11-22 with Story 1.7)
  - .docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/DESIGN.md (final, 2026-11-11)
  - .docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/EXPERIENCE.md (final, 2026-11-11)
  - .docs/sensorveiledning-sporbarhet.md (table A, used as an acceptance-criteria checklist only)
---

# Flex PT - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Flex PT, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

Training rules R1–R14, the effort scale, the progression table, test profiles A–D and coach scenarios are defined in PRD Appendix A–C and are referenced here by ID, not copied.

## Requirements Inventory

### Functional Requirements

FR1: A user can register with email and password, log in, and log out from the Profile screen.
FR2: Onboarding has five steps, one question per screen: (1) focus, running or strength; (2) focus-specific questions – running: goal (first 5 km, 10 km or half marathon) and longest run so far (R7); strength: main focus (upper, lower or full body) and gym experience (beginner or experienced); (3) sessions per week, 2–5; (4) strength only: "Where do you train?" – gym or home (bodyweight); (5) the plan is generated. No available days are asked (R9 fixed day patterns), and no weights (starting load from first logged session, R6). Full body = both upper and lower body trained during the week.
FR3: The user can edit the profile later, set a new running goal, and choose light, dark or system theme. A changed profile produces a new plan version after the user confirms; it replans the rest of the current week from today and keeps logged sessions.
FR4: The system generates a weekly plan (Monday–Sunday) from the profile with the rule-based plan engine (R1–R14). Next week's plan is generated on the first app open in the new week, based on logs so far, and a new-week banner shows until the first session of the week is logged. The week plan always shows the current week; earlier sessions are in History. Strength program lasts 8 weeks (R13); running program lasts until the goal is reached (R14).
FR5: The plan shows each session with day, type and content (exercises with sets, reps and load, or run type and distance), and a counter "X av Y økter". Today's strength session lists all exercises and the user chooses the order. A previously logged exercise shows previous and recommended load (R6); otherwise sets and reps only. Each run shows the pace (min:sec per km) from the previous run of the same run type; nothing the first time.
FR6: Exercises are selected from the exercise library and filtered by where the user trains (R5).
FR7: Strength: sets logged one at a time with load and reps (− / + or typed); a set can be removed or logged with 0 reps; the app moves to the next exercise when all sets are logged. Running: distance (km) and time (min:sec). Both: after "Fullfør økt" the user picks effort once (Lett/Passe/Tung with anchor texts) and an optional note; the session is then locked. Status is derived from sets (all → completed, some → partly, none → not completed); a set counts when logged with ≥ 1 rep. No energy field.
FR8: The user can view their training history.
FR9: The user can send free-text messages to the coach about changes in availability, energy, time or equipment. Low energy or a time limit told to the coach is the only way these enter the app (R8).
FR10: The coach returns a structured change proposal, validated against R1–R14 before the user sees it.
FR11: A valid proposal is shown on a proposal card listing only changed lines as before → after. Approval creates a new plan version; rejection leaves the plan unchanged.
FR12: A proposal that breaks a rule is discarded, the plan is unchanged, and the coach explains why.
FR13: On any medical condition (symptoms, pain or injury) the coach gives the fixed R11 reply, no diagnosis or advice. For pain in a specific exercise or body part, the coach also asks whether to swap the exercise; a swap is a normal proposal the user approves or rejects.
FR14: Next week's plan adjusts load based on logged sessions and perceived effort (R6, R7, R12).
FR15: Plan changes are shown as before → after on the proposal card before approval (FR11). The week plan does not mark changed sessions.
FR16: The user can delete their account. After confirmation, profile, plans, logs and messages are deleted permanently.
FR17: After a finished session the app shows a summary, a motivational message compared with the previous session of the same type (plain encouragement the first time), a quote from a fixed list, a celebration when a running goal is reached (R14), and the next planned session with its day. Confetti is should-have and never shown with reduced motion.
FR18: A user who has forgotten their password can ask for a reset link by email from the login screen. Same reply whether or not the address has an account; the link works once and for one hour and sets a new password with the registration rules; requests limited per email and per IP; demo users cannot reset.

### NonFunctional Requirements

NFR1: Demo mode without an API key, with seeded test users and recorded coach responses; "Prøv demo" button on the login screen and a "Demo" badge while in demo mode.
NFR2: A user can never read or change another user's data (profile, plan, logs, messages).
NFR3: Passwords are hashed. Secrets only in `.env` (git-ignored); `.env.example` is committed.
NFR4: Only training-relevant fields are sent to the language model, never name or email.
NFR5: The app runs locally by following the README with documented prerequisites; one command starts the app and its PostgreSQL database in Docker.
NFR6: Plan engine and validation are covered by automated tests, with test profiles A–D as fixtures.
NFR7: If the language model fails or times out, the user sees a clear message and the plan is unchanged.
NFR8: WCAG 2.2 AA in light and dark theme: labelled fields, keyboard navigation, readable contrast, mobile-width layout, respects reduce-motion, text size up to 200 % without broken layout.
NFR9: All input validated on the server; repeated actions (double-click Approve, logging the same session twice) have no extra effect; a proposal based on an older plan version is rejected with a clear message.
NFR10: UI and coach in Norwegian bokmål, including effort names and anchor texts; one encouraging, supportive tone; the fixed medical reply stays neutral. Code and planning documents may be in English.
NFR11: An active session is restored after the phone is locked or the app is left: same session, exercise and set.

### Additional Requirements

From the architecture spine (AD-1–AD-19). **No starter template is named**; Epic 1 Story 1 sets up the Next.js 16.4 + TypeScript project to the Structural Seed folder layout.

- **Project skeleton (AD-1, Structural Seed):** one Next.js app; folders `src/app`, `src/features/{account,onboarding,plan,logging,coach,profile}` (each with `api.ts` as only public surface), `src/shared/{engine,db,auth,coach-provider,ui,lib}`, `src/seed`, `data/{exercises,coach-demo}`, `tests/{engine,coach,integration,e2e}`. ESLint import rule enforces slice boundaries and the allowed edges in the dependency diagram. Route files contain no business logic.
- **Stack versions (Stack table):** Node 24, TypeScript 7.0, Next.js 16.4, React 19.3, PostgreSQL 18, postgres.js 4.1, Drizzle ORM ~0.45 / drizzle-kit 0.31, Better Auth 1.7, `@anthropic-ai/sdk` 1.9, Zod 4.6, Tailwind 4.3, Vitest 5.1, Playwright 1.65, ESLint 10.15, Prettier 3.10.
- **Pure plan engine (AD-2):** generation, progression, step back, session status, running-goal check, new-program generation, plan-change validation and before → after diff live only in `src/shared/engine`, take all inputs (including today's date, exercise library, logs) as plain data and never touch clock/DB/network. Computed values are stored on the plan, never recomputed elsewhere.
- **Entity ownership (AD-3):** account owns Better Auth tables and coach usage counter; profile owns profile; plan owns program, plan week, plan version, version session, session slot, day exclusion; logging owns session log, set log, run log; coach owns coach message and change proposal. Only the owner writes.
- **Server-side writes (AD-4):** writes only via Server Actions/Route Handlers in the owning slice or its `api.ts`; Zod validation on every write; user id only from `shared/auth`; every user-owned query filters on user id. Page rendering never writes, except `plan.api.getCurrentWeek` → idempotent `ensureCurrentWeek`.
- **Database (AD-5):** PostgreSQL everywhere via postgres.js; schema once in `src/shared/db/schema` with Drizzle (including Better Auth tables); every change is a committed `drizzle-kit` migration. Production: Supabase transaction pooler with prepared statements off; migrations on a separate direct URL.
- **Auth (AD-6):** Better Auth with Drizzle adapter and `nextCookies()` last; `shared/auth` helper returns user id or rejects. "Prøv demo" signs in a seeded demo user through Better Auth (no bypass).
- **Plan versioning (AD-7):** one current program per user (unique partial index); plan week = (program, `week_start`) unique, with immutable versions and a current-version pointer. `ensureCurrentWeek(userId, today)` is the only week creator, idempotent, only the week containing today, never back-fills. Proposals record their base version; approval rejected as `stale` if not current. Profile changes call `plan.api.replanFromToday`: focus change or new running goal → new program; other changes → new version from today. Week-9 answer and "running goal reached" stored on the program.
- **Session identity (AD-8):** session slot id stable across versions; version session row holds per-version content; logs reference slots. Logged or past slots never change. One session log per slot and one set log per (session log, exercise, set number), unique keys; repeats return the existing row. Session log `in_progress` → `finished`; finished logs reject changes. Each set saved when logged.
- **Coach provider (AD-9):** one interface, Live and Demo. Demo users always Demo; others by `COACH_MODE`. Live uses `@anthropic-ai/sdk`, model id from config (default `claude-haiku-5-5`), JSON-schema structured output derived from engine types, checks `stop_reason`, validates with Zod. Refusal/timeout/invalid/API error → clear message, plan unchanged. Daily per-user message limit for non-demo users (default 20, Europe/Oslo day) with a fixed over-limit reply and no API call. Demo provider: keyword rules + recorded responses in `data/coach-demo/`, one file per non-medical Appendix C scenario plus C9 (time-limited session); recordings hold intents, never ids; unmatched → fixed "demo" reply.
- **Typed plan changes (AD-10):** closed set: exclude days, move session, drop session, reduce session (R8, reason energy/time), swap exercise, swap to bodyweight. Model never supplies numbers or ids; engine resolves, validates R1–R14, returns new version + before → after lines. Rule break → discard with code-generated explanation. Proposal status: `pending`, `approved`, `rejected`, `stale`, `discarded`. Approve is one transaction calling `plan.api.applyChanges`; re-approving returns the existing result.
- **Medical classifier (AD-11):** `classifyMedical` runs before any provider: Norwegian word lists for acute symptoms and for pain/injury (returning body part if recognised). Any match → fixed R11 constant, message not sent. Only for pain/injury with a body part present in the current week → fixed yes/no swap offer; "yes" → swap-exercise proposal through the engine. Model result with `medicalCondition: true` → dropped, R11 reply shown.
- **Data minimisation (AD-12):** Live provider receives only the current message, current plan version and training profile fields; never name, email, notes or chat history. Message contents never written to application logs.
- **Time (AD-13):** one helper in `shared/lib` for Europe/Oslo date, `week_start` (Monday) and program week number. Dates stored as `YYYY-MM-DD`, moments as UTC. A program started mid-week gets only the remaining R9 days that week.
- **Theme (AD-14):** theme choice in a cookie read on the server, sets `data-theme` on `<html>` (none for system); Tailwind `dark` variant on that attribute with system media-query fallback. Not stored in the DB.
- **Design tokens (AD-15):** DESIGN.md colours (light/dark), typography and shapes defined once as Tailwind theme tokens; components use only tokens; shared components in `shared/ui`.
- **Demo seeding (AD-16):** `src/seed` builds demo users A–D through slices' `api.ts` with relative dates and generated ids. "Prøv demo" lets the visitor pick a profile and creates a fresh demo user per visit; demo users older than 24 h are deleted when the next is created. Demo users can't change email/password, always use Demo provider, always show the badge. Same code creates e2e fixtures.
- **Environments (AD-17):** config only from env vars; `.env.example` lists all. Local/examiner: `docker compose up` with Next.js standalone image, `postgres:18` with volume and healthcheck, one-off migrate service before app start, `COACH_MODE=demo` default. Dev: `npm run dev` + compose PostgreSQL + `npm run db:migrate`. Published: Vercel from `main` only, Supabase PostgreSQL, `COACH_MODE=live` with daily limit; previews not connected to a DB.
- **Testing (AD-18):** Vitest `tests/engine` (profiles A–D vs Appendix B, one test per progression-table row, each plan-change type); `tests/coach` (`classifyMedical` incl. two medical Appendix C scenarios; non-medical scenarios against Demo provider); `tests/integration` against a test DB (transactions, idempotency, account-deletion cascade); Playwright `tests/e2e` main flows in demo mode.
- **Mail and password reset (AD-19):** Better Auth's reset flow (`sendResetPassword`, one-hour single-use token, `revokeSessionsOnPasswordReset`). `shared/mail` has one `sendMail` interface chosen by `MAIL_MODE`: `console` (default locally and for the examiner, link in the server log), `live` (Resend, `RESEND_API_KEY`, `MAIL_FROM`), `memory` (outbox for tests). Same reply whether or not the address exists; no mail for unknown or demo addresses. Better Auth rate limiter with database storage; reset request at most 3 per email and 5 per IP per hour, 429 above.
- **Conventions:** code, identifiers and commits in English, UI text in bokmål; kebab-case files, PascalCase components/types, snake_case tables/columns; UUIDs for app tables; km with one decimal, durations in whole seconds, loads in kg rounded to 0.5 (`null` = bodyweight); server actions return `{ ok: true, data }` / `{ ok: false, code, message }` with Norwegian message, no stack traces to the browser; Next.js 16 request APIs awaited; account deletion via FK cascade with a test that nothing remains; ESLint + Prettier pass before every PR.
- **Deferred items assigned to stories:** exercise library file format → Story 2.1; medical word list and body-part map → Story 4.4.

### UX Design Requirements

From DESIGN.md (visual) and EXPERIENCE.md (behaviour). Where EXPERIENCE.md lists open questions that PRD v1.1 or the architecture later settled (0 reps, new program, running goal reached, theme storage), the PRD/architecture answer applies.

**Foundation and tokens**

UX-DR1: Implement the colour tokens from DESIGN.md as semantic Tailwind roles with light and dark values (background, surface, text, text-muted, primary, on-primary, accent, success, warning, error, border). Components reference roles only, never hex. `border` is decorative only; every interactive element's outline uses `text-muted` or `primary`.
UX-DR2: Implement typography tokens (display, title, body, label, meta, value-input, button) in `rem` on the system font stack, weights 400–600, minimum 0.9375 rem, no uppercase or italics as style.
UX-DR3: Implement spacing (4–32 px scale, margin-screen 20 px, gap-card 14 px, tap-min 44 px, tap-stepper 56 px, tap-button 68 px) and radius tokens (sm 12, md 24, lg 28, xl 34, full). Single column, max content width 480 px centred, works down to 320 px without horizontal scroll.
UX-DR4: Flat elevation: no shadows on cards/bubbles; visible focus ring 3 px `primary` with 2 px offset on every focusable element; popup scrim = background at 60 %.
UX-DR5: App shell with `lang="nb"`, bottom tab bar (Uke = calendar, Coach = chat bubble, Historikk = clock with arrow, Profil = person; 24 px line icons) with `aria-current` on the active tab and a 3 px top stroke; tab bar hidden during active session logging; content bottom padding so tab bar and primary button never cover the last element, also at 200 % text.

**Shared components (`shared/ui`)**

UX-DR6: Buttons: `button-primary` (max one per screen, full width, 68 px; disabled state announced as "utilgjengelig"), `button-secondary`, `button-text` (≥ 44 px), `button-destructive` (outlined red, never filled, always behind a confirmation dialog).
UX-DR7: `input-field` with always-visible label above; error state = 2 px `error` border + icon + message under the field, linked to the field for screen readers.
UX-DR8: Stepper (`stepper-button` −, `stepper-button-plus` +, `stepper-value`): direct typing, steps of 0.5 kg / 1 rep / 0.1 km / 5 s, hold-to-repeat, prefilled with recommended load when it exists, negative values rejected with a plain-text error, − value + stays on one line at 200 % text (value field shrinks first, buttons keep 56 px), screen-reader labels such as «Øk vekt med 0,5 kilo» and value read with unit.
UX-DR9: `progress-bar`: horizontal, rounded, with text value always shown («2 av 4 økter», «Steg 2 av 4»), no animation with reduced motion.
UX-DR10: `choice-card` / `choice-card-selected` and `number-chip` / `number-chip-selected`: selected state = filled primary with ✓ (never colour alone).
UX-DR11: `effort-card` / `effort-card-selected` (Lett, Passe, Tung with anchor text; same selected style reused for the theme picker) and `note-field` («Noe du vil huske?», marked optional).
UX-DR12: `status-tag`, `banner` (accent border, no close), `hint-card` (close ✕ ≥ 44 px, dismissal remembered), `program-card`, `loading-state` (static indicator with reduced motion), `demo-badge` («Demo» pill in the header while a demo user is signed in).
UX-DR13: Modal pattern for `popup-done` and confirmation dialogs: traps focus, moves focus to the first element on open and back on close, never closes by itself, has role and name.

**Screens and behaviour**

UX-DR14: Login screen with «Logg inn», «Registrer ny bruker» and «Prøv demo» (demo profile choice per AD-16); registration errors (invalid email, short password) in plain text under the field. «Glemt passord?» `button-text` leads to Glemt passord and Nytt passord with the texts and states in EXPERIENCE.md (Voice and Tone, State Patterns, Flow 7).
UX-DR15: Onboarding: one question per screen, progress bar «Steg N av M» (M = 4 running, 5 strength), back button that keeps previous answers, tap-to-select-and-advance, `loading-state` «Lager planen din …» then straight to Uke (no summary screen).
UX-DR16: Uke (home): progress counter, today's session highlighted as `day-row-today` (opens the session), `day-row` per day with status (✓ Fullført, «Hviledag» muted), `pace-line` «Sist: m:ss min/km» on runs (hidden first time), «Neste økt: [dag], [økt]» when no session today, welcome `hint-card` first time, new-week `banner` until first logged session, `program-card` replacing the banner in week 9 (strength). No week browsing, no change markers.
UX-DR17: Øktoversikt: all exercises as `exercise-row` with status (○ Ikke startet, ◐ N av M sett, ✓ Ferdig), free order, «Fullfør økt» with no extra confirmation when sets are missing.
UX-DR18: Øvelseslogg (`exercise-card`): name, «Sett N av M», «Forrige: X kg · Anbefalt: Y kg» (accent, only when logged before), steppers, «Logg sett», «Sett N logget. Neste!», list of logged sets (tap to edit, ✕ to remove, only while active), one-time hint first time an exercise is logged, auto-advance to next exercise or back to overview, save error «Kunne ikke lagre settet. Prøv igjen.» keeping the values.
UX-DR19: Løpelogg: one screen with Distanse (km) and Tid (min:sek) steppers, «Fullfør økt» as primary; for the fast short run show «Sist løp du denne på m:ss per km. Klarer du å slå det i dag?» and the note that it should feel hard and the distance is fixed; save error «Kunne ikke lagre økta. Prøv igjen.».
UX-DR20: Fullfør økt: «Hvor anstrengende var økta?», three effort cards with strength or running anchors by session type, required; optional note; «Fullfør» locks the session.
UX-DR21: `popup-done`: «Bra jobba, [navn]!», summary line(s) (exercises · sets · status, or distance · time · pace), motivational message in an accent-bordered field, quote from a fixed list of 20–30 Norwegian lines, running-goal celebration «Du klarte X km!» with pointer to Profil, next session with day, «Ferdig» → Uke. The popup is complete and fully usable without confetti (see UX-DR29).
UX-DR22: Coach chat: free-text input only (no quick replies), user bubbles right in primary, coach bubbles left (max 85 % width), calm thinking indicator in a coach bubble and send disabled until the reply arrives, input text kept when switching tabs, new replies announced to screen readers.
UX-DR23: `proposal-card`: title «Forslag: endringer», only changed lines «X → Y», «Avvis» + «Godkjenn» (disabled once pressed); approved → `proposal-card-approved` «Godkjent ✓» (announced) with «Se dagens økt»; rejected → muted line «Avvist. Planen er uendret.»; stale → clear message.
UX-DR24: Coach special bubbles: `chat-bubble-pain` (muted, no accent, no exclamation marks) with the fixed R11 text and, when applicable, «Vil du bytte øvelse?» with «Nei» / «Ja, bytt»; `chat-bubble-error` «Noe gikk galt. Planen er uendret.» with «Prøv igjen» (resends last message once); rule break as a normal coach bubble «Det får jeg dessverre ikke til å passe. [grunn]. …».
UX-DR25: Historikk: logged sessions newest first; empty state «Ingen økter ennå. …» with «Gå til Uke»; skeleton loading without motion; Øktdetalj showing logged sets/run values and effort (read-only).
UX-DR26: Profil: «Rediger profil» (with confirmation «Planen for resten av uka lages på nytt. Loggede økter beholdes.»), set new running goal, «Utseende» Lys / Mørk / Følg system switching immediately, «Logg ut», «Slett konto» → dialog «Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid.» with «Avbryt» / «Slett».
UX-DR27: Microcopy follows Voice and Tone: du-form, encouraging tone, muted neutral tone for pain, medical and technical errors; the R11 text verbatim; effort names and Norwegian anchor texts exactly as in EXPERIENCE.md.
UX-DR28: Accessibility floor across screens: keyboard-operable everything with focus order = reading order, colour never the only signal, all actions tap-only (no swipe) except optional hold-to-repeat, no time limits, primary action and field stay visible when the keyboard is open.

**Should-have**

UX-DR29 (should-have, FR17 / DESIGN.md B4): Small confetti celebration as a purely decorative layer behind the `popup-done` content when a session is finished. Never rendered when `prefers-reduced-motion` is set (a calm static marker is shown instead), never the only way the result is communicated, never delays or blocks the popup content or the «Ferdig» button, and hidden from screen readers. Built only if time allows; dropping it changes nothing else.

### FR Coverage Map

FR1: Epic 1 - Register, log in, log out from Profil
FR2: Epic 2 - Five-step onboarding that ends in a generated plan
FR3: Epic 1 (theme) and Epic 2 (edit profile, new running goal, replan from today)
FR4: Epic 2 - Weekly plan Monday–Sunday, generated once per week, banner, 8-week program (R13)
FR5: Epic 2 (day, type, content, counter, free order) and Epic 3 (previous/recommended load, pace)
FR6: Epic 2 - Exercise library filtered by where the user trains (R5)
FR7: Epic 3 - Set-by-set strength logging, run logging, effort and note, derived status, lock
FR8: Epic 3 - History and session detail
FR9: Epic 4 - Free-text coach chat
FR10: Epic 4 - Structured proposal validated against R1–R14
FR11: Epic 4 - Proposal card; approve creates a version, reject changes nothing
FR12: Epic 4 - Rule break discarded with explanation
FR13: Epic 4 - Fixed medical reply and swap offer
FR14: Epic 3 - Progression R6, R7, R12
FR15: Epic 4 - Before → after on the proposal card only
FR16: Epic 1 - Delete account with cascade
FR17: Epic 3 - Finished-session popup (confetti as a separate should-have story, UX-DR29)
FR18: Epic 1 - Forgotten password by email (Story 1.7)

NFR1: Epic 1 (demo login, badge), grown in Epics 2–4 (plan, logs, recorded coach answers)
NFR2, NFR3, NFR5: Epic 1
NFR4, NFR7: Epic 4
NFR6: Epic 2 (engine, profiles A–D), Epic 3 (progression table), Epic 4 (scenarios)
NFR8, NFR10: Epic 1 foundation, applied in every screen story
NFR9: Epics 2–4 (one week per Monday, one log per slot, double approve, stale proposals)
NFR11: Epic 3

## Epic List

### Epic 1: Sign in, try the demo and own your account
A visitor can register, log in and out, reset a forgotten password, try the demo with one click, pick light or dark theme, and delete their account. The app runs locally with one command and has its design tokens and app shell in place.
**FRs covered:** FR1, FR3 (theme), FR16, FR18 · **NFRs:** NFR1 (demo login, badge), NFR2, NFR3, NFR5, NFR8, NFR10

### Epic 2: Get a personal weekly plan
After onboarding the user gets a rule-based weekly plan that is shown clearly, follows the 8-week program, and is replanned when the profile changes.
**FRs covered:** FR2, FR3 (profile, running goal), FR4, FR5 (plan content, counter), FR6 · **NFRs:** NFR6, NFR9

### Epic 3: Log sessions and see progress
The user logs strength and running sessions, finishes them with effort, gets feedback, sees history, and next week builds on the logs.
**FRs covered:** FR5 (previous/recommended load, pace), FR7, FR8, FR14, FR17 · **NFRs:** NFR6, NFR9, NFR11

### Epic 4: Adapt the week with the coach
The user tells the coach about changes in the week and gets validated proposals to approve or reject; pain and illness get the fixed safe reply.
**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR15 · **NFRs:** NFR4, NFR7, NFR9

Dependencies: Epic 1 → 2 → 3 → 4, and each epic works without the next. Deviation from PRD §5: onboarding and profile editing moved from E1 to E2, and FR5's load and pace display moved to E3, to avoid forward dependencies; demo seeding grows per epic. Story numbers the architecture refers to (1.4, 2.1, 4.4, 4.5) are kept.

## Epic 1: Sign in, try the demo and own your account

A visitor can register, log in and out, try the demo with one click, pick light or dark theme, and delete their account. The app runs locally with one command, and the design tokens and app shell are in place for every later screen.

### Story 1.1: Runnable project skeleton

As a team member,
I want a runnable project skeleton with the agreed stack, folders, tooling and design tokens,
So that every later story builds on the same base and the examiner can start the app with one command.

**Acceptance Criteria:**

**Given** a clean clone on a machine with Docker and Node 24
**When** I run `docker compose up`
**Then** a `postgres:18` container starts with a volume and a healthcheck, a one-off migrate service runs the `drizzle-kit` migrations, and only then the Next.js 16.4 app starts on `http://localhost:3000`
**And** the start page renders in bokmål with `<html lang="nb">` (AD-17, NFR5, NFR10)

**Given** the repository
**When** I look at its structure
**Then** it follows the Structural Seed: `src/app`, `src/features/{account,onboarding,plan,logging,coach,profile}/api.ts`, `src/shared/{engine,db,auth,coach-provider,ui,lib}`, `src/seed`, `data/`, `tests/{engine,coach,integration,e2e}` (AD-1)
**And** an ESLint import rule fails when a slice imports another slice's internals or a slice outside the allowed edges, shown by a lint test or fixture

**Given** the scripts in `package.json`
**When** I run `npm run lint`, `npm run format:check`, `npm test`, `npm run test:e2e` and `npm run db:migrate`
**Then** each runs and passes: Vitest runs at least the date-helper tests below, and Playwright runs one smoke test that loads the start page

**Given** the date helper in `src/shared/lib` (AD-13)
**When** it is given a UTC moment
**Then** it returns the Europe/Oslo calendar date, the Monday `week_start` and the program week number, with Vitest cases for a Sunday-to-Monday boundary, a DST change and a program started mid-week

**Given** DESIGN.md
**When** the Tailwind theme is configured
**Then** the colour roles (light and dark), typography, spacing and radius tokens are defined once (UX-DR1–UX-DR3, AD-15), and dark values apply under `data-theme="dark"`, or under the system dark preference when no attribute is set
**And** the global focus ring is 3 px `primary` with 2 px offset and there are no shadows on cards (UX-DR4)

**Given** the repository root
**When** I inspect configuration files
**Then** `.env.example` lists every variable (database URLs, Better Auth secret and URL, `COACH_MODE`, `ANTHROPIC_API_KEY`, coach model id and daily limit) with no real values, `.env` is git-ignored, and `.gitignore` covers `node_modules`, `.next` and other build output (NFR3)
**And** `src/shared/lib` has the server-action result type `{ ok: true, data } | { ok: false, code, message }`

**Given** the README
**When** a new reader opens it
**Then** it states what the app is, prerequisites with versions, the start command, the test commands, and where the planning documents are

### Story 1.2: Register, log in and log out

As a new user,
I want to create an account, log in and log out,
So that my training data is saved and only I can see it.

**Acceptance Criteria:**

**Given** I am logged out
**When** I open the app
**Then** I see the login screen with «Logg inn» and «Registrer ny bruker», with labelled `input-field`s for email and password and one `button-primary` (UX-DR6, UX-DR7, UX-DR14)

**Given** the registration form
**When** I submit a valid email and a password of at least 8 characters
**Then** an account is created through Better Auth with a hashed password, I am logged in, and I land on the Uke tab (FR1, NFR3, AD-6)
**And** pressing the submit button twice creates only one account (NFR9)

**Given** the registration form
**When** I submit an invalid email, a short password or an email already in use
**Then** a plain-text bokmål message appears under the relevant field with an error icon, linked to the field for screen readers, and nothing is created
**And** the same validation runs on the server with Zod, so a request that bypasses the form is rejected (AD-4)

**Given** the login form
**When** I enter a wrong email or password
**Then** I see one general message that does not reveal which of the two was wrong

**Given** I am logged out
**When** I open any app route other than login or registration, or call any server action
**Then** I am redirected to login, or the action returns `{ ok: false }`, because `shared/auth` gives no user id (NFR2)
**And** an integration test covers a server action called without a session

**Given** I am logged in
**When** the app shell renders
**Then** a bottom `tab-bar` shows Uke, Coach, Historikk and Profil with icons and text, the active tab has `aria-current` and the 3 px marker, and Uke, Coach and Historikk show a short placeholder text until later epics fill them (UX-DR5)

**Given** I am on Profil
**When** I press «Logg ut»
**Then** my session ends and I land on the login screen, and the browser's back button does not show my data

**Given** the full flow
**When** it is done with keyboard only and with text at 200 %
**Then** every field and button is reachable in reading order with a visible focus ring, and nothing is cut off or scrolls sideways at 320 px width (NFR8, UX-DR28)
**And** a Playwright test covers register → log out → log in

### Story 1.3: Choose light, dark or system theme

As a user,
I want to choose light, dark or system theme,
So that the app is comfortable to use in a bright gym and in the evening.

**Acceptance Criteria:**

**Given** I am on Profil
**When** I look at «Utseende»
**Then** I see Lys, Mørk and Følg system as a single-choice group with the selected style from `effort-card-selected` (filled primary with ✓), operable with keyboard and announced as a radio group (UX-DR11, UX-DR26)

**Given** I choose Mørk or Lys
**When** the choice is saved
**Then** the theme changes immediately, the choice is stored in a cookie, and the server sets `data-theme` on `<html>` so a reload shows no flash of the other theme (AD-14)
**And** the choice is not stored in the database and remains after logging out and in on the same device

**Given** I choose Følg system
**When** my operating system switches between light and dark
**Then** the app follows it, with no `data-theme` attribute set

**Given** both themes
**When** an automated accessibility check (axe in Playwright) runs on the login screen and Profil in light and in dark
**Then** it reports no contrast or label violations (NFR8)

**Given** the phone is set to reduce motion
**When** the theme changes
**Then** no transition animation is shown

### Story 1.4: Try the demo

As an examiner or curious visitor,
I want to try the app with one click and no API key,
So that I can test every flow without creating an account or holding the team's keys.

**Acceptance Criteria:**

**Given** the login screen
**When** I press «Prøv demo»
**Then** I can pick one of profiles A–D, each with a one-line description in bokmål (UX-DR14)

**Given** I pick a profile
**When** the demo starts
**Then** `src/seed` creates a fresh demo user for that profile by calling the slices' `api.ts` functions, with generated ids and dates relative to today, and signs me in through Better Auth with no authentication bypass (AD-6, AD-16)
**And** the profile is stored in the `profile` table owned by `features/profile`, created here through `profile.api`, with the values from Appendix B

**Given** two visitors press «Prøv demo»
**When** both demo users exist
**Then** they never see each other's data
**And** demo users older than 24 hours are deleted, with all their rows, when the next demo user is created, shown by an integration test with an injected clock

**Given** a demo user is signed in
**When** any screen renders
**Then** the `demo-badge` «Demo» shows in the header, and it never shows for a normal user (NFR1, UX-DR12)
**And** the user is marked as demo, and any request to change a demo user's email or password is rejected on the server

**Given** `.env` has no `ANTHROPIC_API_KEY` and `COACH_MODE=demo`
**When** I run the app with `docker compose up`
**Then** «Prøv demo» works fully (NFR1)

**Given** the seed code
**When** the end-to-end tests run
**Then** they create their fixtures through the same seed functions
**And** Epics 2–4 extend the seed with plans, logs and coach scenarios, so this story only promises a demo user with a profile

### Story 1.5: Delete my account

As a user,
I want to delete my account and everything in it,
So that my health-related data is not kept when I stop using the app.

**Acceptance Criteria:**

**Given** I am on Profil
**When** I press «Slett konto» (`button-destructive`)
**Then** a confirmation dialog opens with «Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid.» and the buttons «Avbryt» and «Slett» (UX-DR6, UX-DR26)
**And** the dialog traps focus, moves focus to its first element, and returns focus to «Slett konto» when closed (UX-DR13)

**Given** the dialog is open
**When** I press «Avbryt» or Escape
**Then** nothing is deleted

**Given** the dialog is open
**When** I press «Slett»
**Then** my user and every row I own are deleted through foreign keys with `ON DELETE CASCADE`, my session ends, I land on the login screen, and I can no longer log in (FR16)
**And** pressing «Slett» twice gives one deletion and no error page (NFR9)

**Given** the server action for deletion
**When** it runs
**Then** it takes the user id only from `shared/auth`, so a user can never delete another user (NFR2)

**Given** an integration test against a test database
**When** a user with rows in every user-owned table that exists so far is deleted
**Then** no row for that user remains in any of them
**And** every later story that adds a user-owned table extends this test (Consistency Conventions: Deletion)

### Story 1.6: Publish the app

As the team,
I want the app published from `main` early,
So that the deployment works long before the deadline and can be shown at any time.

**Acceptance Criteria:**

**Given** the Vercel project
**When** a commit lands on `main`
**Then** the app is deployed from `main` only, and preview deployments have no database connection (AD-17)

**Given** the Supabase PostgreSQL project
**When** the app connects in production
**Then** it uses the transaction pooler with prepared statements turned off, and migrations run against the separate direct URL with a documented command (AD-5)

**Given** the secrets for production
**When** I look at the repository and its history
**Then** no secret is present; all of them live only in the Vercel and Supabase settings (NFR3)

**Given** the published URL
**When** I register, log out, log in and use «Prøv demo»
**Then** each works as it does locally

**Given** the README
**When** a reader looks for the published app
**Then** it gives the URL and notes that a free Supabase project pauses after a week without use and must be resumed before a demonstration

### Story 1.7: Reset a forgotten password by email

As a user who has forgotten my password,
I want to get a link by email where I choose a new password,
So that I can get back to my plan and logs without a new account.

**Acceptance Criteria:**

**Given** I am on the login screen
**When** I press «Glemt passord?» (`button-text` under «Logg inn»)
**Then** «Glemt passord» opens with the ingress, a labelled email `input-field`, the `button-primary` «Send lenke» and the link «Til innlogging» (UX-DR6, UX-DR7, UX-DR14)

**Given** the Glemt passord form
**When** I submit an address that is a valid email
**Then** the form is replaced by «Hvis adressen har en konto, har vi sendt en lenke. Lenken virker i én time.» with «Til innlogging» under it, whether or not the address has an account (FR18)
**And** a mail with the reset link is sent only when the address belongs to a non-demo account, through Better Auth's `sendResetPassword` and `shared/mail` (AD-6, AD-19)
**And** an invalid email gives a plain-text message under the field, and the same check runs on the server with Zod (AD-4)

**Given** `MAIL_MODE=console`, the default locally and for the examiner
**When** a reset link is requested for an existing account
**Then** no mail is sent and the link is written to the server log, so the flow works with no keys (NFR1, NFR5)
**And** with `MAIL_MODE=live` the mail is sent through Resend with `RESEND_API_KEY` and `MAIL_FROM`, and the mail contains only the subject, the text from EXPERIENCE.md and the link

**Given** the reset request
**When** the same email address asks more than 3 times, or the same IP address more than 5 times, within an hour
**Then** the endpoint answers 429 and the form shows «For mange forespørsler. Prøv igjen om en time.» under the field, which keeps its value
**And** the limits are stored in the database so they hold across serverless instances (AD-19)

**Given** a valid reset link
**When** I open it
**Then** «Velg nytt passord» opens with a labelled «Nytt passord» field and the `button-primary` «Lagre passord»

**Given** the Nytt passord form
**When** I save a password of at least 8 characters
**Then** the password is changed and hashed, the link can no longer be used, every session of my account ends, and I land on the login screen with «Passordet er endret. Logg inn med det nye passordet.» (NFR3)
**And** I can log in with the new password and not with the old one
**And** pressing «Lagre passord» twice changes the password once and shows no error page (NFR9)
**And** a short password gives the same message as registration, and nothing is changed

**Given** a reset link that is older than one hour or already used
**When** I open it or submit the form
**Then** I see «Lenken er utløpt eller allerede brukt.» with the link «Be om en ny lenke», and the password is unchanged

**Given** a demo user's address
**When** a reset is requested for it
**Then** the same neutral reply is shown and no mail or link is created (AD-16)

**Given** `.env.example` and the README
**When** a reader looks for the mail settings
**Then** `.env.example` lists `MAIL_MODE`, `RESEND_API_KEY` and `MAIL_FROM` with no real values, and the README explains that the app runs without a mail key and where the reset link appears locally (NFR3, NFR5)

**Given** the full flow
**When** it is done with keyboard only and with text at 200 %
**Then** every field, button and link is reachable in reading order with a visible focus ring, and nothing is cut off or scrolls sideways at 320 px width (NFR8, UX-DR28)

**Given** the tests
**When** they run with `MAIL_MODE=memory`
**Then** an integration test covers the neutral reply for an unknown address, no mail for a demo user, the 429 limit, and an expired and a used token
**And** a Playwright test covers Glemt passord → link from the memory outbox → new password → log in with the new password

## Epic 2: Get a personal weekly plan

After onboarding the user gets a rule-based weekly plan that is shown clearly, follows the 8-week program, and is replanned when the profile changes. Everything a plan contains is computed by the pure plan engine (AD-2).

### Story 2.1: Exercise library

As the team,
we want a curated, reviewed exercise library,
So that plans only use real exercises that fit where the user trains.

**Acceptance Criteria:**

**Given** the Free Exercise DB (public domain)
**When** the selection script in the repo is run
**Then** it writes a subset of 30–50 exercises to `data/exercises/` in a format chosen and documented in this story (closes the architecture's deferred item), and the result is committed and reviewed in the pull request (FR6)

**Given** each exercise in the library
**When** it is validated by a Zod schema in a Vitest test
**Then** it has a stable id, a Norwegian display name (NFR10), its English source name, muscle groups, one movement pattern from PRD Appendix A, Session slots (squat, hinge, single-leg, calf, horizontal push, vertical push, horizontal pull, vertical pull, biceps, triceps, core), a marking for gym, home (bodyweight) or both (R5), and a bodyweight flag (load `null`)

**Given** the R4 templates and the two places to train
**When** a Vitest test checks coverage
**Then** for gym and for home every movement pattern used in the Session slots table has at least two exercises (one plus an alternative), so that R13 new programs and exercise swaps (Epic 4) have something to choose from
**And** a pattern with no home exercise (for example vertical pull without equipment) is listed in the test as a known gap that uses the fallback in Appendix A, and every other gap fails the test

**Given** the library
**When** a teammate reviews it
**Then** it contains no exercise that needs equipment the marking does not allow, and the README or a note in `data/exercises/` names the source and its licence

### Story 2.2: Plan engine generates the first week

As a user,
I want a weekly plan built from my profile by fixed rules,
So that I can trust that the plan is realistic and safe.

**Acceptance Criteria:**

**Given** the engine in `src/shared/engine`
**When** it is called
**Then** it takes the profile, the exercise library, the program start and today's date as plain data and returns the week's sessions, with no database, clock, network or framework access (AD-2)

**Given** test profiles A–E (Appendix B; E is for engine tests only)
**When** the engine generates their first full week
**Then** each plan has the sessions, types, days and first-week volume given in Appendix B and the R9 day patterns, verified by one Vitest test per profile (NFR6)

**Given** a strength profile
**When** the plan is generated
**Then** the R4 template for the session count is used, each major muscle group is trained at least twice a week (R1), the main focus gets extra volume, and only exercises allowed by where the user trains are used (R5)
**And** sets, reps and exercises per session follow PRD Appendix A, Starting volume, as named constants in the engine, including one extra set for exercises in the main focus
**And** exercises are chosen slot by slot from the Session slots table, with the same exercises for sessions of the same template in a week, and the home fallback when a pattern has no exercise, tested in Vitest
**And** no load is set before the exercise has been logged (R6)

**Given** a running profile
**When** the plan is generated
**Then** the R4 run types are used, the long run is on the last training day, no planned run is more than 10 % above the user's longest run (R7), and the fast short run's fixed distance is set once to the easy short run's distance in this first week and stored on the program
**And** the first week's distances follow PRD Appendix A, Starting volume: long run = longest run capped at the goal distance, easy short run = 50 % of it (at least 2 km, never longer than the long run), all rounded down to 0.5 km

**Given** any generated plan
**When** the engine's validator checks it
**Then** it passes R1–R5 and R9: at least one rest day, never more than 3 training days in a row, no two hard sessions for the same body part or two hard runs on consecutive days (a fast short run becomes an easy short run if needed, R3)
**And** a Vitest test runs the validator on every combination of focus, goal or main focus, experience, sessions per week and place to train, and finds no rule break

**Given** a program that starts mid-week
**When** the first week is generated
**Then** it contains only the R9 days from the start date onward (AD-13), tested in Vitest

### Story 2.3: See this week's plan

As a user,
I want to see this week's plan on the Uke tab,
So that I always know what to do today and next.

**Acceptance Criteria:**

**Given** the plan slice
**When** this story is done
**Then** the tables for program, plan week, plan version, session slot and version session exist as Drizzle migrations with the unique keys from AD-7 and AD-8 (one current program per user, one plan week per program and `week_start`), each with `ON DELETE CASCADE` from the user, and the deletion test from Story 1.5 covers them

**Given** a user with a profile and no plan week for the current Monday
**When** the Uke tab is opened
**Then** `plan.api.getCurrentWeek` calls `ensureCurrentWeek`, which stores the engine's version 1 for the week that contains today, only that week (AD-7)
**And** two simultaneous first visits create one week, shown by an integration test (NFR9)

**Given** a stored week
**When** Uke renders
**Then** each day shows a `day-row` with day name, session name and type, today is a `day-row-today` with a `primary` border, rest days are muted with «Hviledag», and the progress bar shows «X av Y økter», where X stays 0 until Epic 3 adds logging (FR4, FR5, UX-DR9, UX-DR16)
**And** there is no week browsing and no change marker (FR15)

**Given** a rest day in the week
**When** its `day-row` renders
**Then** under «Hviledag» a short supportive line in `meta` style explains why rest matters, for example «Hvile gir musklene tid til å bli sterkere», chosen from a small fixed list in bokmål with one line for strength and one for running (Appendix B, profile B: "app explains why")

**Given** today has no session
**When** Uke renders
**Then** «Neste økt: [dag], [økt]» is shown instead

**Given** I open a session from Uke
**When** its content is shown
**Then** a strength session lists its exercises with sets and reps (and no load yet), and a run shows its run type and distance in km with one decimal (FR5)

**Given** the first time a user opens Uke
**When** the screen renders
**Then** the welcome `hint-card` is shown and can be closed with a ✕ of at least 44 px, and the closing is remembered for that user (UX-DR12)

**Given** a user without a profile
**When** Uke is opened
**Then** a short text explains that the plan is made after the questions at the start, until Story 2.4 sends such users to onboarding

**Given** the screen
**When** it loads, is used with keyboard only, at 200 % text or with reduced motion
**Then** loading shows a skeleton without movement, all rows are reachable and readable, and rows may wrap to two lines but are never cut off (NFR8, UX-DR25 loading)
**And** «Prøv demo» users from Story 1.4 now get their current week the same way, and a Playwright test opens Uke as demo profile A and C

### Story 2.4: Onboarding

As a new user,
I want to answer a few short questions,
So that I get a plan that fits my goal right away.

**Acceptance Criteria:**

**Given** I have just registered, or I am logged in without a profile
**When** I open the app
**Then** I am sent to onboarding step 1

**Given** onboarding
**When** I go through it
**Then** I see one question per screen: (1) Styrke or Løping as `choice-card`s; (2) for running: goal (første 5 km, 10 km, halvmaraton) and longest run so far, for strength: main focus (overkropp, underkropp, hele kroppen) and experience (nybegynner, erfaren); (3) sessions per week 2–5 as `number-chip`s; (4) only for strength: «Hvor trener du?» with «På treningssenter» or «Hjemme» (FR2, UX-DR10, UX-DR15)
**And** the progress bar shows «Steg N av M», with M = 4 for running and 5 for strength

**Given** any step
**When** I press the back button
**Then** I return to the previous step with my answer kept

**Given** the answers
**When** they are submitted
**Then** the server validates them with Zod against the defined options only, the longest run is between 1 and 50 km (PRD Appendix A, Starting volume) with a plain-text error under the field if not, and a request with a missing or unknown value is rejected (NFR9, AD-4)

**Given** valid answers
**When** I finish the last step
**Then** `onboarding` creates the profile through `profile.api` and the program and first week through `plan.api`, shows «Lager planen din …» as a `loading-state` (static with reduced motion), and takes me straight to Uke with the plan and welcome hint
**And** pressing the final button twice creates one profile and one program (NFR9)

**Given** I log out and in again
**When** I open the app
**Then** my profile is unchanged and I go straight to Uke

**Given** the flow
**When** it is done by keyboard only and at 200 % text
**Then** every choice is reachable, selected cards show ✓ and not only colour, and a Playwright test covers onboarding for one strength and one running profile

### Story 2.5: A new week starts

As a user,
I want next week's plan to be ready the first time I open the app in the new week,
So that I never have to plan the week myself.

**Acceptance Criteria:**

**Given** the current week is over
**When** I open the app for the first time on or after the next Monday (Europe/Oslo)
**Then** `ensureCurrentWeek` creates the plan week for the week that contains today, using the engine with the previous week's plan as input, and never fills in skipped weeks (FR4, AD-7)
**And** an integration test with an injected date covers a normal Monday, a first visit on a Thursday, and a gap of three weeks

**Given** a new week has been created
**When** Uke renders
**Then** the `banner` «Ny uke, dette blir bra! Si ifra til coachen dersom dagene ikke passer eller du vil gjøre andre justeringer.» shows at the top, above the counter, has no close button, and is announced with a role and name (UX-DR12, UX-DR16)
**And** the banner stays until the first session of the week is logged, which Epic 3 makes possible; until then it shows the whole week

**Given** the engine
**When** it builds the next week
**Then** it is a pure function of the previous week, the profile, the library and the logs passed in (none until Epic 3), so Story 3.3 can add progression without changing the week-creation code

### Story 2.6: Edit my profile and running goal

As a user,
I want to change my answers later,
So that my plan follows me when my week or goal changes.

**Acceptance Criteria:**

**Given** I am on Profil
**When** I open «Rediger profil»
**Then** I can change the onboarding answers (focus, goal or main focus, experience, sessions per week, where I train, longest run) with the same controls and validation as onboarding, and a running user can set a new running goal (FR3, UX-DR26)

**Given** I change something
**When** I press save
**Then** a confirmation dialog shows the engine's before → after lines and «Planen for resten av uka lages på nytt. Loggede økter beholdes.», with «Avbryt» and a confirm button (AD-7, UX-DR13)
**And** «Avbryt» changes nothing

**Given** I confirm a change that keeps the program
**When** it is saved
**Then** `profile` saves the profile and calls `plan.api.replanFromToday`, which creates a new version of the current week from today; slots in the past or already logged are never changed (AD-7, AD-8)

**Given** I confirm a change of focus or a new running goal
**When** it is saved
**Then** a new program becomes current with a new plan week for the current Monday and the week count starts again from 1 (R13)

**Given** the action
**When** it is sent twice or with invalid values
**Then** only one new version or program is created, and invalid values are rejected on the server with a plain-text message (NFR9)
**And** Vitest tests in the engine cover replanning from a weekday and keeping past slots, and an integration test covers the new-program path

### Story 2.7: The 8-week strength program

As a strength user,
I want to be asked about a new program after 8 weeks,
So that my training stays varied and keeps progressing.

**Acceptance Criteria:**

**Given** a strength program
**When** I open the app for the first time in week 9 (AD-13 week number)
**Then** Uke shows the `program-card` «8 uker unnagjort! Vil du ha et nytt program?» with «Ja, nytt program» (primary) and «Fortsett med dette» (secondary), in place of the new-week banner, with no close button (R13, UX-DR12, UX-DR16)

**Given** the program card
**When** I choose «Ja, nytt program»
**Then** the engine creates a new program with the same focus and sessions per week, new exercises where the library has alternatives (R5), and logged loads carried over; it becomes current, the week count starts at 1, and the answer `new` is stored on the old program (AD-7)

**Given** the program card
**When** I choose «Fortsett med dette», or don't answer
**Then** the current program continues unchanged, `continue` is stored when chosen, and the card disappears once a choice is made

**Given** a running program
**When** any number of weeks have passed
**Then** no program card is shown (R14: no time limit)

**Given** the engine
**When** Vitest tests run
**Then** they cover the week-9 trigger, new exercises chosen where alternatives exist and kept where none exist, and loads carried over from log data passed in as plain data
**And** choosing twice creates only one new program (NFR9)

## Epic 3: Log sessions and see progress

The user logs strength and running sessions, finishes them with effort, gets feedback, sees history, and next week builds on the logs.

### Story 3.1: Log a strength session

As a strength user,
I want to log each set as I do it, in the order I choose,
So that the plan knows what I actually lifted.

**Acceptance Criteria:**

**Given** the logging slice
**When** this story is done
**Then** the tables session log (status `in_progress` or `finished`, effort, note) and set log exist as Drizzle migrations, with one session log per slot and one set log per (session log, exercise, set number) as unique keys, logs referencing the slot and never a version, cascade from the user, and the Story 1.5 deletion test extended (AD-3, AD-8)

**Given** today's strength session on Uke
**When** I open it
**Then** Øktoversikt lists all its exercises as `exercise-row`s with status «○ Ikke startet», «◐ N av M sett» or «✓ Ferdig» as icon and text, I can open them in any order, and the tab bar is hidden (FR5, UX-DR5, UX-DR17)

**Given** an exercise
**When** I open it
**Then** the `exercise-card` shows its Norwegian name, «Sett N av M», steppers for load (0,5 kg steps) and reps (1 step) that can also be typed in, «Logg sett», and the list of logged sets (FR7, UX-DR8, UX-DR18)
**And** the first time an exercise is logged a one-time hint says «Velg en vekt du kan løfte kontrollert. Neste gang foreslår vi en vekt til deg.»

**Given** I press «Logg sett»
**When** the set is saved on the server
**Then** the session log becomes `in_progress`, «Sett N logget. Neste!» is announced, and the same request sent twice stores one set (NFR9)
**And** a bodyweight exercise logs reps only

**Given** a negative or non-numeric value
**When** I try to log it
**Then** a plain-text error such as «Reps kan ikke være negativt.» shows under the field, linked to it, and the server rejects it too (AD-4)
**And** 0 reps is allowed for a set that was not done

**Given** a logged set during an active session
**When** I tap it or its ✕
**Then** I can change or remove it

**Given** all sets of an exercise are logged
**When** the last one is saved
**Then** the app moves to the next exercise that is not done, or back to Øktoversikt if none are left

**Given** saving a set fails
**When** the server or network returns an error
**Then** «Kunne ikke lagre settet. Prøv igjen.» is shown and the values stay in the steppers

**Given** an active session
**When** I lock the phone or leave the app and come back
**Then** the same session, exercise and next set open again from the database; unsaved stepper values are not restored (NFR11)
**And** an integration test reloads an in-progress session

**Given** the screens
**When** used by keyboard and at 200 % text
**Then** − value + stay on one line with 56 px buttons, the buttons are labelled such as «Øk vekt med 0,5 kilo», and a Playwright test logs a full strength session as demo profile A (NFR8, UX-DR8)

### Story 3.2: Log a run

As a runner,
I want to log the distance and time of my run,
So that the plan knows how far and how fast I ran.

**Acceptance Criteria:**

**Given** the logging slice
**When** this story is done
**Then** a run log table (distance in km with one decimal, duration in whole seconds) linked to the session log exists as a migration with cascade, and the deletion test is extended

**Given** today's run on Uke
**When** I open it
**Then** Løpelogg shows one screen with steppers for «Distanse (km)» (0,1 km steps) and «Tid (min:sek)» (5 s steps) that can also be typed in, with «Fullfør økt» as the only primary button and the tab bar hidden (FR7, UX-DR19)

**Given** the run is a fast short run
**When** Løpelogg opens
**Then** it also explains that the run should feel hard and that the distance is fixed (R7)

**Given** invalid values (zero or negative distance, time not in min:sek, unreasonably high values)
**When** I try to finish
**Then** a plain-text error shows under the field, and the server rejects them too (NFR9)

**Given** saving fails
**When** the server or network returns an error
**Then** «Kunne ikke lagre økta. Prøv igjen.» is shown and the values stay

**Given** I leave the app before finishing
**When** I come back
**Then** the same run opens; values not yet saved are not restored (NFR11)

### Story 3.3: Finish a session

As a user,
I want to say how hard the session felt when I finish it,
So that next week's plan matches how I'm doing.

**Acceptance Criteria:**

**Given** Øktoversikt or Løpelogg
**When** I press «Fullfør økt»
**Then** the screen «Hvor anstrengende var økta?» shows three `effort-card`s, Lett, Passe and Tung, each with the strength or running anchor text from EXPERIENCE.md, and the optional `note-field` «Noe du vil huske?» (FR7, UX-DR11, UX-DR20, UX-DR27, NFR10)
**And** «Fullfør» is disabled until one effort is chosen, and is announced as unavailable

**Given** not all sets are logged
**When** I press «Fullfør økt»
**Then** no extra confirmation is asked

**Given** I choose an effort and press «Fullfør»
**When** the server saves it
**Then** the session log becomes `finished` with effort and note, and its status is derived in the engine: all sets completed → completed, some → partly completed, none → not completed, where a set counts with at least 1 rep (FR7, AD-2)
**And** after this the server rejects any change to the session or its sets, and the screens show it as locked (AD-8)
**And** pressing «Fullfør» twice finishes it once (NFR9)

**Given** a session with logged sets or a saved run that I never finish
**When** midnight (Europe/Oslo) passes after the day the first set or run value was logged
**Then** the session counts as finished without effort or note: its status is derived from the logged sets as usual, it is locked, the server rejects changes to it, and it shows as finished on Uke, in the counter and in History
**And** this is a read-time rule computed by the engine from the logged day and today's date, so no background job is needed and nothing is written when a page renders (AD-2, AD-4)
**And** no finished-session popup is shown for an auto-finished session
**And** Vitest tests cover a session at 23:59 and at 00:00 the next day, and an integration test shows that a change to an auto-finished session is rejected

**Given** a finished session
**When** I return to Uke
**Then** its `day-row` shows ✓ «Fullført», the counter «X av Y økter» counts finished sessions, and the new-week banner is gone for the rest of the week (FR4, FR5)

**Given** a finished run
**When** `logging` calls `plan.api.recordFinishedSession`
**Then** the engine's check sets "running goal reached" on the program at the first completed run of at least the goal distance (R14, AD-7)

**Given** the engine
**When** Vitest tests run
**Then** they cover status for all sets, some sets, no sets, and a set with 0 reps, and the running-goal check at, below and above the goal distance

### Story 3.4: Next week builds on my logs

As a user,
I want next week's plan to adjust to what I logged,
So that I keep progressing without getting overloaded.

**Acceptance Criteria:**

**Given** the engine's next-week function from Story 2.5
**When** it receives the logs
**Then** it applies R6 for strength, R7 for running and R12 step back, and stores the resulting loads and distances on the new week; nothing outside the engine recomputes them (FR14, AD-2)

**Given** the progression table in PRD Appendix A
**When** Vitest runs `tests/engine`
**Then** there is one test per row, for strength and for running: completed easy or ok, completed hard, partly completed, not completed, a set with 0 reps, not logged, reduced by R8, and a second hard or not completed in a row (NFR6, AD-18)

**Given** strength progression
**When** tests run
**Then** they also cover: the first logged load becomes the starting load, increases of up to 10 % rounded to 0,5 kg, one more rep when rounding gives no increase, bodyweight exercises adding one rep up to 20 reps per set and keeping 20 after that, and Lett and Passe treated the same (R6)

**Given** running progression
**When** tests run
**Then** they also cover: easy short runs and the long run progressing separately, the fast short run keeping its fixed distance and not counting for R12, weekly distance up at most 10 %, no run more than 10 % above the longest run in the last 30 days, and the self-reported longest run used when there is no recent run (R7)

**Given** R12
**When** tests run
**Then** two hard or not-completed results in a row on the same exercise or run type give −10 % rounded to the nearest step, R8-reduced and unlogged sessions are skipped without breaking the run, and the count starts again after a step back

**Given** an auto-finished session without effort (Story 3.3)
**When** the next week is built
**Then** completed exercises and runs keep their load or distance and do not count towards R12, and parts that were not completed count as not completed, with one Vitest test for this case (progression table row "Finished automatically at midnight", PRD v1.2)

**Given** a user with logs
**When** the next week is created on the first visit
**Then** an integration test shows that the stored week has the progressed values

### Story 3.5: See previous and recommended load, and pace

As a user,
I want to see what I did last time and what to aim for now,
So that I know what weight to pick and what pace to beat.

**Acceptance Criteria:**

**Given** an exercise I have logged before
**When** its `exercise-card` opens
**Then** it shows «Forrige: X kg · Anbefalt: Y kg», with the recommended load in `accent`, where «Forrige» is my last logged load and «Anbefalt» is the load stored on the plan for this session (FR5, R6, UX-DR18)
**And** the load stepper is prefilled with the recommended load, or with the previous load when the plan has none yet

**Given** an exercise I have not logged before
**When** its card opens
**Then** no «Forrige/Anbefalt» line is shown, only sets and reps

**Given** a run on Uke whose run type I have logged before
**When** the week renders
**Then** its `day-row` shows the `pace-line` «Sist: m:ss min/km» from the previous run of the same type; nothing is shown the first time (FR5, UX-DR16)

**Given** today's run is a fast short run with a previous pace
**When** I open it
**Then** the message «Sist løp du denne på m:ss per km. Klarer du å slå det i dag?» is shown (UX-DR19)

**Given** pace formatting
**When** Vitest tests run
**Then** time / distance is formatted as m:ss per km with correct rounding

**Given** «Prøv demo»
**When** a demo user for profiles A–D is created
**Then** the seed also logs a previous week through the logging and plan `api.ts`, so the demo shows previous and recommended loads, pace and a filled counter (AD-16)

### Story 3.6: The finished-session popup

As a user,
I want a short summary and some encouragement when I finish,
So that I feel the progress and want to come back.

**Acceptance Criteria:**

**Given** I have finished a session
**When** the popup opens
**Then** `popup-done` shows «Bra jobba, [navn]!» (or without a name if none is known), a summary line (exercises · sets · status, or distance · time · pace), the motivational message, a quote, and «Neste økt: [dag], [økt]», with «Ferdig» taking me to Uke (FR17, UX-DR21)

**Given** a previous session of the same type
**When** the motivational message is chosen
**Then** it compares with it, such as «Du løftet 2,5 kg mer i knebøy enn sist. Sterk økt!» or a longer distance than last time; the first time it is plain encouragement such as «Bra jobba! Du er i gang.»
**And** the choice of message is a pure function with Vitest tests for heavier, longer, equal and first time

**Given** the quote
**When** the popup opens
**Then** one quote is taken at random from a fixed list of 20–30 short bokmål lines in the code, with no language-model call

**Given** a run that reached the running goal (Story 3.3)
**When** the popup opens
**Then** it also shows «Du klarte X km! Vil du sette et nytt mål? Du finner det under Profil.», once per goal (R14)

**Given** the popup
**When** it opens and closes
**Then** it is a modal with role and name that traps focus and never closes by itself, and every part of the result is given as text (UX-DR13, NFR8)

### Story 3.7: Training history

As a user,
I want to see the sessions I have done,
So that I can follow my progress.

**Acceptance Criteria:**

**Given** finished sessions
**When** I open the Historikk tab
**Then** they are listed newest first with date, session name, status and effort (FR8, UX-DR25)
**And** only my own sessions are ever listed (NFR2)

**Given** a session in the list
**When** I open it
**Then** Øktdetalj shows its logged sets or distance, time and pace, effort and note, read-only

**Given** no finished sessions
**When** Historikk opens
**Then** «Ingen økter ennå. Når du har logget din første økt, dukker den opp her.» and a «Gå til Uke» button are shown

**Given** the list is loading
**When** reduced motion is on
**Then** the skeleton has no movement

**Given** a Playwright test
**When** a demo user opens Historikk
**Then** the seeded previous week is listed and a session detail opens

### Story 3.8: Confetti when a session is finished (should-have)

As a user,
I want a small celebration when I finish a session,
So that finishing feels good.

**Acceptance Criteria:**

**Given** the popup from Story 3.6 opens
**When** reduced motion is off
**Then** a small confetti layer plays behind the popup content (UX-DR29)
**And** it never delays or blocks the content or «Ferdig», and is hidden from screen readers

**Given** reduced motion is on
**When** the popup opens
**Then** no confetti is rendered, and a calm static marker is shown instead

**Given** the team runs out of time
**When** this story is dropped
**Then** nothing else changes, because Story 3.6 is complete without it

## Epic 4: Adapt the week with the coach

The user tells the coach about changes in the week and gets validated proposals to approve or reject; pain and illness get the fixed safe reply. The code decides, the language model proposes, the user approves.

### Story 4.1: Talk to the coach

As a user,
I want to tell the coach about my week in my own words,
So that I don't have to replan the week myself.

**Acceptance Criteria:**

**Given** the coach slice
**When** this story is done
**Then** a coach message table exists as a migration with cascade from the user, the Story 1.5 deletion test is extended, and the coach usage counter is owned by `account` (AD-3)

**Given** the Coach tab
**When** I write a message and send it
**Then** my message shows as a right-aligned `chat-bubble-user`, a calm thinking indicator shows in a coach bubble, sending is disabled until the reply arrives, and the reply shows as a left-aligned `chat-bubble-coach` that is announced to screen readers (FR9, UX-DR22)
**And** text in the input is kept when I switch tabs, and there are no quick-reply buttons

**Given** `shared/coach-provider`
**When** a message is handled
**Then** one interface has a Live and a Demo provider; demo users always get Demo, other users get the provider set by `COACH_MODE` (AD-9)
**And** the Live provider uses `@anthropic-ai/sdk` with the model id from configuration, checks `stop_reason` before reading content, and validates the result with Zod

**Given** the Live provider
**When** it builds its request
**Then** it sends only the current message, the current plan version and the training profile fields (focus, goal, sessions per week, equipment, experience), never name, email, notes or chat history, and message contents are never written to application logs (NFR4, AD-12)
**And** a Vitest test asserts the exact fields of the request payload

**Given** the model refuses, times out, returns invalid content or the API fails
**When** the reply is handled
**Then** a `chat-bubble-error` shows «Noe gikk galt. Planen er uendret.» with «Prøv igjen», which resends the last message once even if pressed several times, and the plan is unchanged (NFR7, NFR9, UX-DR24)
**And** Vitest tests cover each failure type with a mocked SDK

**Given** a non-demo user who has sent the daily limit of messages (default 20 per Europe/Oslo day)
**When** they send another
**Then** a fixed message explains the limit and no API call is made (AD-9)

**Given** the Demo provider in this story
**When** a message matches no recorded scenario
**Then** the fixed «demo» reply explains that the coach answers with recorded replies in demo mode; recordings with plan changes come in Stories 4.2 and 4.5

### Story 4.2: The coach proposes a valid change

As a user,
I want the coach to turn my message into a concrete change that follows the rules,
So that I can trust what it suggests.

**Acceptance Criteria:**

**Given** the engine
**When** this story is done
**Then** it defines the closed set of plan changes: exclude days, move a session, drop a session, reduce a session (R8, reason energy or time), swap an exercise, and swap to bodyweight, and a function that applies a list of them to the current version and returns the new version and the before → after lines, or a rule break (AD-10)
**And** the model never supplies numbers or ids; the engine resolves exercises, days, loads, sets and distances

**Given** each plan-change type
**When** Vitest runs `tests/engine`
**Then** there are tests for the valid case and for at least one rule break, including: R8 gives one set fewer per exercise for strength and 25 % shorter distance for running, only for that session or the next one if none today; excluded days follow R2, R3 and R9; moved sessions follow R10 with the long run as key session; logged or past slots are never changed (AD-8); swap to bodyweight keeps the session count (NFR6)

**Given** the Live provider
**When** it asks for a proposal
**Then** it uses a JSON schema derived from the engine's plan-change types, and the result is validated with Zod before the engine sees it (FR10, AD-9)

**Given** a proposal that passes R1–R14
**When** it is stored
**Then** a change proposal row is saved with status `pending`, the coach text, the list of changes and the base version, in a migration with cascade, together with the day exclusion table owned by `plan` (AD-3) used by the exclude-days change, and the deletion test is extended for both
**And** the chat shows a `proposal-card` «Forslag: endringer» with only the changed lines, each as «X → Y» in text (FR11, FR15, UX-DR23); approving and rejecting arrive in Story 4.3

**Given** a proposal that breaks a rule
**When** the engine rejects it
**Then** it is stored as `discarded`, no card is shown, and a normal coach bubble gives the explanation from code: «Det får jeg dessverre ikke til å passe. [grunn]. Vil du prøve noe annet? Planen din er som den var.» (FR12, UX-DR24)

**Given** the Demo provider
**When** a message matches the time-limited session scenario (C9, «Må bli ferdig på 40 min i dag»)
**Then** it returns the recorded intent from `data/coach-demo/`, never slot or exercise ids, and the engine applies it to the demo user's current week

### Story 4.3: Approve or reject a proposal

As a user,
I want to decide on every change before it happens,
So that nothing in my plan changes without me seeing it.

**Acceptance Criteria:**

**Given** a pending proposal card
**When** I press «Godkjenn»
**Then** in one database transaction the coach's approve action calls `plan.api.applyChanges`, which checks the base version and creates the next version of the current week, and the proposal becomes `approved` (FR11, AD-7, AD-10)
**And** the card becomes `proposal-card-approved` with «Godkjent ✓» announced, the changed lines kept, and «Se dagens økt» as the only primary button

**Given** a pending proposal card
**When** I press «Avvis»
**Then** the proposal becomes `rejected`, the plan is unchanged, and the card becomes the muted line «Avvist. Planen er uendret.»

**Given** «Godkjenn» or «Avvis» is pressed
**When** it is pressed again, double-clicked or sent twice
**Then** the buttons are disabled at once, and approving an already approved proposal returns the existing result without a new version (NFR9)
**And** an integration test sends two approvals at the same time and finds one new version

**Given** the plan has changed since the proposal was made
**When** I press «Godkjenn»
**Then** the proposal becomes `stale`, the plan is unchanged, and the card says clearly that the plan has changed and asks me to send the message again (NFR9)

**Given** an approved change
**When** I press «Se dagens økt» or open Uke
**Then** the plan shows the new version with no change marker (FR15)

**Given** a Playwright test as demo profile B
**When** a proposal is approved
**Then** the change appears in the week plan

### Story 4.4: Pain and injury get a safe reply

As a user,
I want a safe, neutral answer if I mention pain or symptoms,
So that the app never gives medical advice or changes my plan behind my back.

**Acceptance Criteria:**

**Given** `classifyMedical` in the coach slice
**When** this story is done
**Then** it is a deterministic match against two Norwegian word lists, acute symptoms (for example brystsmerter, besvimelse, tung pust, lammelse) and pain or injury, the second returning any body part it recognises from a body-part map; both lists are written and reviewed in this story's pull request (AD-11, closes the architecture's deferred item)

**Given** any chat message
**When** it is sent
**Then** `classifyMedical` runs before any provider; on a match the fixed R11 reply «Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging.» is shown in a `chat-bubble-pain` (muted, no accent, no exclamation marks), the message is not sent to any provider, and the plan is unchanged (FR13, R11, NFR4, UX-DR24, UX-DR27)

**Given** pain or injury with a recognised body part that has exercises in the current week, and no acute symptom
**When** the fixed reply is shown
**Then** «Vil du bytte øvelse?» follows in the same muted style with «Nei» and «Ja, bytt»
**And** «Ja, bytt» creates a swap-exercise proposal through the engine that I approve or reject as usual (Story 4.3); «Nei» changes nothing

**Given** an acute symptom, or pain without a recognised body part
**When** the message is handled
**Then** only the fixed reply is shown, with no swap question

**Given** the Live provider returns `medicalCondition: true`
**When** the result is handled
**Then** the whole result is dropped and the fixed R11 reply is shown

**Given** `tests/coach`
**When** Vitest runs
**Then** it covers «Det gjør vondt i kneet» (swap offered), «Jeg har brystsmerter» (no swap), «Jeg har vondt i ryggen» without a matching exercise (no swap), and messages with no medical words (not caught)

### Story 4.5: Coach scenarios work in demo mode

As the team and the examiner,
we want every coach scenario to work with recorded replies,
So that coach behaviour can be checked without an API key.

**Acceptance Criteria:**

**Given** `data/coach-demo/`
**When** this story is done
**Then** it holds one recording per Appendix C scenario that reaches a provider (D: away Thursday to Sunday; D: only two sessions this week; D: out of energy today; B: gym closed, home workout) plus C9, each with keyword rules and plan changes as intents (AD-9)

**Given** `tests/coach`
**When** Vitest runs each scenario against the Demo provider and the engine
**Then** the result matches the expected plan change in Appendix C: no sessions Thursday–Sunday with at most one moved earlier; two sessions with the long run kept; today's session 25 % shorter after approval; strength exercises swapped to bodyweight with the session count unchanged (NFR6, AD-18)
**And** the two medical scenarios are covered by Story 4.4's tests

**Given** «Prøv demo» as profile B or D
**When** I type the scenario messages
**Then** each works in the app, and a Playwright test runs at least one of them end to end

**Given** a team member with an API key and `COACH_MODE=live`
**When** the same scenarios are run against the live model
**Then** the results are documented in `.docs/implementation-artifacts/` with date and model id, including any scenario where the live model differs from the recording
