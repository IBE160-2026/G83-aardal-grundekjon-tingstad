# Product

<!-- impeccable:product-schema 1 -->

Source of truth for requirements is the PRD (`.docs/planning-artifacts/prd-flex-pt.md`, v1.2). This file is the condensed product record design work reads; when they disagree, the PRD wins.

## Platform

web

Mobile-first web app, used one-handed on a phone (often at the gym or before a run), also usable at desktop width.

## Users

Fitness-minded people with busy, shifting weeks who want progress and structure in strength training or running without being tied to a rigid program. Comfortable with digital services, willing to log sessions and give short feedback. Needs and usage patterns matter more than age.

Reference persona (EXPERIENCE.md): Mari, 26, marketing consultant taking a course on the side; strength, 4 sessions a week; opens the app on her way to the gym, logs set by set, and tells the coach when her week changes.

Secondary audience: the course examiner, who runs the app locally in demo mode.

## Product Purpose

Flex PT is a personal trainer that adapts to everyday life. It combines a personal weekly plan, session logging and a conversational coach, so a week that does not go as planned does not mean starting over. Success: the user gets a realistic plan right after onboarding, can change it by talking to the coach and see the change in the plan, and keeps progressing from what they actually logged.

## Positioning

**The code decides, the language model proposes, the user approves.** A rule-based plan engine (rules R1–R14) generates and validates every plan. The coach (Claude) turns free text into structured change proposals, which are validated against the rules and shown as before → after for the user to approve. Unlike a general chatbot, the conversation has a visible, traceable consequence in a stored plan; unlike a logging app, the plan progresses and replans itself.

## Operating Context

- Week plan (Monday–Sunday) is the home screen; the next session is highlighted, with a counter "X av Y økter".
- Sessions are logged on the phone during training: strength set by set (load and reps with − / +), runs with distance and time; then effort Lett / Passe / Tung and an optional note.
- The coach chat is used when the week changes (travel, fewer days, low energy, no gym). Proposal cards list only changed lines.
- An active session must survive locking the phone or leaving the app.
- Demo mode ("Prøv demo") with seeded profiles A–D lets anyone try the app without keys.

## Capabilities and Constraints

- v1 focus is one of: running (goal first 5 km, 10 km or half marathon) or strength (upper, lower or full body; gym or home bodyweight). Not combined in v1.
- Five-step onboarding, one question per screen; 2–5 sessions per week on fixed day patterns.
- 8-week strength programs (R13); running programs run until the goal is reached (R14).
- Finished-session screen: summary, motivational message compared with last time, quote, next session; confetti is should-have and never with reduced motion.
- Medical mentions get a fixed, neutral reply and no advice (R11).
- Stack: Next.js, PostgreSQL, Claude as language model.
- Out of scope for v1: gamification (points, levels, streaks, personal records), integrations, nutrition, subscriptions.

## Brand Commitments

- Name: Flex PT.
- Language: Norwegian bokmål in the UI and coach, "du" form.
- Voice: cheering, supportive and motivating, short sentences, a bit playful; no pressure or guilt about missed sessions. Pain, medical and technical-error messages switch to a calm, neutral tone: no exclamation marks, no cheering, no red alarm.
- Effort names Lett, Passe, Tung with fixed anchor texts.
- Visual identity: the team keeps the existing "Pulsslag" design in `.docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/DESIGN.md` (decided 2026-11-22, after rejecting five alternative directions). Design work refines this world; it does not replace it.

## Evidence on Hand

- Real content: training rules, test profiles and coach scenarios in the PRD; screen flows, microcopy and component behaviour in EXPERIENCE.md; existing mockups in `.docs/planning-artifacts/ux-designs/…/mockups/`.
- No real users, testimonials, metrics or logos exist. Demo data (persona Mari, profiles A–D) is synthetic and must be labelled as such where it could be mistaken for real.

## Product Principles

1. Nothing in the plan changes without the user seeing it first.
2. The next session is always obvious.
3. A missed session is a reason to replan, never a reason for guilt.
4. Feedback is about the user's own training, never a game.
5. Works one-handed, mid-workout, in any light.

## Accessibility & Inclusion

WCAG 2.2 AA in both light and dark theme; labelled fields, keyboard navigation, text size up to 200 % without broken layout, respects reduce-motion. Light, dark and system theme are user choices.
