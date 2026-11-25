# Story 1.1: prosjektskjelett

## 2026-11-25 kl. 21:19 — Knut Aardal

### Oppgave
Bygge Story 1.1 (kjørbart prosjektskjelett) med `bmad-build`, slik at alle senere stories og sensor kan starte appen med én kommando (`docker compose up`).

### Plan
- `bmad-help` viste at planleggingen var ferdig og at Story 1.1 var neste påkrevde steg.
- `bmad-build`: Epic 1-kontekst kompilert av subagent ([epic-1-context.md](../../.docs/implementation-artifacts/epic-1-context.md)), spec skrevet og godkjent ([spec-1-1-runnable-project-skeleton.md](../../.docs/implementation-artifacts/spec-1-1-runnable-project-skeleton.md)), implementering av subagent, tre uavhengige reviewere (Blind Hunter, Edge Case Hunter, Verification Gap), rettinger og full verifisering.
- Branch `feat/story-1.1-prosjektskjelett`.

### Resultat
- Next.js 16.4 + React 19.3 + TypeScript 6.0.3 med låste versjoner, mappestrukturen fra Structural Seed, ESLint-regel for snitt og ren `engine`/`lib`, Prettier, Vitest, Playwright, Drizzle med første (tomme) migrering, Tailwind-tokens fra DESIGN.md (lys/mørk via `data-theme` med systemfallback), datohjelper for Europe/Oslo, `ActionResult`-type, Docker Compose (`postgres:18` → `migrate` → `app`), `.env.example`, README på norsk og oppdatert sporbarhetstabell.
- Verifisert av meg: `lint`, `typecheck`, `format:check`, 72 Vitest-tester og 5 Playwright-tester grønne; `docker compose up --build` ga healthy db, migrate exit 0 og app på :3000; Playwright også grønn mot Docker-appen (`E2E_BASE_URL`); `npm run db:migrate` OK; ingen byggfiler eller `.env` utracket.
- Commits: `5bb44d6`, `d8f454c`, `c1c72e2`, `4362cbb`, `5822dec`, `443ed5b`, `c429c8a`, `f2401d3`, `de5c342`. Sprint-status: `1-1-runnable-project-skeleton: review`, `epic-1: in-progress`. Branchen er pushet, og [PR #27](https://github.com/IBE160-2026/G83-aardal-grundekjon-tingstad/pull/27) er opprettet.

#### KI-forslag vi avviste, rettet eller presiserte
- **Arkitekturens TypeScript 7.0 ble rettet til 6.0.** Under undersøkelsen viste `npm view` at `typescript-eslint` 8.74 (brukt av `eslint-config-next`) bare støtter TS < 6.1. Knut valgte 6.0.3; spinen er oppdatert med dato og begrunnelse.
- **Code review av KI-koden (20 funn):** 6 rettet (purity-regelen slapp gjennom `fs`/`http` og `Date.now()`, for svak lint-test av snitt-kantene, Docker-stien var aldri testet, låste porter 5432/3000, manglende `typecheck`, sporbarhet ikke oppdatert). 3 funn avvist som feil etter at jeg sjekket dem (bl.a. at `@/`-alias skulle omgå snitt-regelen — testkjøring viste at den slår til). 10 små funn avvist med begrunnelse, 1 utsatt (CI). Full tabell i specens «Review Triage Log».

### Åpne punkter
- Gruppa går gjennom og fletter [PR #27](https://github.com/IBE160-2026/G83-aardal-grundekjon-tingstad/pull/27).
- CI-workflow (GitHub Actions) for lint, typecheck, tester og e2e på hver PR — utsatt, se `deferred-work.md`.
- Story 1.2: gjør `BETTER_AUTH_SECRET` påkrevd, og herd `getDb()` (gjenbruk ved dev-reload, `server-only`) når den tas i bruk.
- README mangler skjermbilde (kriterium 6).
- Story 2.1 står fortsatt `in-progress` i `sprint-status.yaml` selv om PR #23 er flettet.
- `eslint-config-next` gir peer-advarsler med ESLint 10 (fungerer, men støy ved `npm ci`).
