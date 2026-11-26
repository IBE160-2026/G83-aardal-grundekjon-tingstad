---
title: 'Story 1.6: Publish the app'
type: 'feature'
created: '2026-11-26'
status: 'done'
baseline_commit: 'eddd111fc545f4e36bd048b292d5113a0ce21498'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app only runs locally. Nothing documents or prepares a published version, so the deployment could first fail near the deadline. Better Auth's base URL on Vercel is unverified (deferred from 1.2).

**Approach:** Prepare the repo for Vercel (from `main`) and Supabase (transaction pooler plus direct URL for migrations): resolve the Better Auth base URL on Vercel, document the production environment, the migration command and a step-by-step checklist the team follows in the Vercel and Supabase dashboards. The team creates the projects and sets the variables; after that the published URL is verified and written into the README.

## Boundaries & Constraints

**Always:** No secret in the repo or its history; production values live only in Vercel and Supabase. Config only from env vars (AD-17). Production `DATABASE_URL` is the Supabase pooler (port 6543, prepared statements off, already handled in `getDb`); migrations use `DATABASE_DIRECT_URL`. Preview deployments get no `DATABASE_URL` (variables scoped to Production only). `COACH_MODE=demo` in Vercel for now. README stays in Norwegian; code and commits in English.

**Never:** No login/registration rate limit and no demo-user cap (human decision 2026-11-26): the tradeoff stays documented in README, the criterion-3 row of `.docs/sensorveiledning-sporbarhet.md` and `deferred-work.md`. No new schema or migration. No automatic migration on deploy. The agent does not create Vercel or Supabase projects.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Explicit URL | `BETTER_AUTH_URL` set | used as `baseURL` | N/A |
| Vercel production | `BETTER_AUTH_URL` empty, `VERCEL_PROJECT_PRODUCTION_URL=app.vercel.app` | `https://app.vercel.app` | N/A |
| Local | neither set | `undefined` (Better Auth infers it) | N/A |
| Empty string | `BETTER_AUTH_URL=""` | treated as not set | N/A |

## Decisions

- **Rate limit and demo cap (2026-11-26, human):** not built in 1.6; documented as a known risk.
- **Setup (2026-11-26, human):** the team creates the Vercel and Supabase projects; the agent writes the checklist.
- **Coach in production (2026-11-26, human):** `COACH_MODE=demo` until Epic 4.

</frozen-after-approval>

## Code Map

- `src/shared/auth/server.ts` L40 -- `baseURL: process.env.BETTER_AUTH_URL` passed unchecked; replace with an exported pure `resolveBaseUrl(env)`
- `src/shared/db/client.ts` -- pooler port 6543 turns prepared statements off; do not change
- `drizzle.config.ts` L11 -- migrations use `DATABASE_DIRECT_URL`, fall back to `DATABASE_URL`; do not change
- `tests/integration/auth-config.test.ts` -- existing config test; add the `resolveBaseUrl` cases (no DB needed)
- `.env.example` -- add production notes (`sslmode=require`, which variables are Production-only)
- `README.md` -- new «Publisert app» section; key facts in «API-nøkler» stay
- `.docs/sensorveiledning-sporbarhet.md` L35 -- criterion 5 row says «Publisert miljø (Story 1.6) gjenstår»; criterion 3 security row mentions the deferred limit
- `.docs/implementation-artifacts/deferred-work.md` -- BETTER_AUTH_URL entry is resolved by this story; the other two stay deferred with the reason
- `.docs/implementation-artifacts/sprint-status.yaml` L44 -- `1-6-publish-the-app` backlog → in-progress → review

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/auth/server.ts` -- add `resolveBaseUrl` (explicit URL, else `https://${VERCEL_PROJECT_PRODUCTION_URL}`, else undefined) and use it -- settles the unverified base URL
- [x] `tests/integration/auth-config.test.ts` -- cover the four matrix rows -- meaningful logic needs a test
- [x] `.env.example` -- production notes without real values -- NFR3
- [x] `README.md` -- «Publisert app»: URL (placeholder until verified), Supabase pause note, environment table, `DATABASE_DIRECT_URL=... npm run db:migrate`, Vercel and Supabase checklist, known limits (no attempt limit) -- AC 2, 3, 5
- [x] `.docs/sensorveiledning-sporbarhet.md`, `deferred-work.md`, `sprint-status.yaml` -- update status and the resolved entry -- CLAUDE.md
- [ ] Team (manual): create Supabase project, Vercel project from `main`, set variables, run the migration, then give the URL -- cannot be done by the agent

**Acceptance Criteria:**
- Given the repo and its history, when searched for keys, passwords and connection strings, then none is real (`git grep` and `git log -p` find only placeholders)
- Given a commit on `main`, when Vercel builds, then the app deploys from `main`; a branch preview has no `DATABASE_URL`
- Given the published URL, when I register, log out, log in and press «Prøv demo», then each works as locally
- Given the README, when a reader looks for the app, then it gives the URL and the Supabase pause note

## Implementation Notes

## Spec Change Log

## Review Triage Log

Gjennomgang gjort av hovedagenten selv (diffen er liten; ingen underagenter ble startet uten ønske fra brukeren).

| Funn | Verdikt | Bevis | Rute |
| ---- | ------- | ----- | ---- |
| `VERCEL_PROJECT_PRODUCTION_URL` brukes også i forhåndsvisninger | low | Verdien er alltid produksjonsvertens navn; forhåndsvisninger har uansett ingen database, så innlogging der er ikke et mål | rejected |
| Direkte Supabase-URL kan være bare IPv6 | medium | Migreringskommandoen i README kunne feile fra IPv4-nett | patch: tips om session pooler lagt i README |
| `?sslmode=require` støttes av postgres.js | false | postgres.js leser `sslmode` fra URL-en | rejected |
| Hemmelighetssjekk treffer lokale `flexpt:flexpt`-URL-er i CI og Playwright | false | Dummyverdier for lokal Postgres, ikke hemmeligheter | rejected |
| Publisert URL er ikke verifisert | medium | AC 3 og 4 krever ekte URL; kan ikke gjøres av agenten | defer: manuell oppgave for teamet, ført i deferred-work.md |

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm run format:check && npm test` -- expected: all pass
- `git grep -nE "postgres(ql)?://[^ ]*:[^ ]*@" -- . ":!.env.example" ":!tests" ":!README.md"` -- expected: no match

**Manual checks (if no CLI):**
- On the published URL: register, log out, log in, «Prøv demo» (profile A), delete the test account
- Vercel → a preview deployment has no `DATABASE_URL`; Supabase → tables exist after the migration
