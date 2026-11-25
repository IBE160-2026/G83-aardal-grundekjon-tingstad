# G83 — Blind sensur

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Om appen

**Flex PT** er en mobil-først treningsapp med en KI-coach. Appen lager en ukeplan for styrke eller løping ut fra målet ditt, lar deg logge øktene sett for sett, og justerer planen sammen med deg når uka endrer seg. Den er laget for travle folk som vil ha fremgang og struktur uten et stivt program.

Status: prosjektskjelettet er på plass (Story 1.1). Innlogging, demo og selve treningsflytene kommer i de neste storyene (se [epics.md](.docs/planning-artifacts/epics.md)).

## Medlemmer

- Knut Aardal
- Caroline Boman Grundekjøn
- Emilie Tingstad

## Forutsetninger

| Verktøy                                | Versjon              | Trengs til                  |
| -------------------------------------- | -------------------- | --------------------------- |
| Docker Desktop (med Docker Compose v2) | 4.x eller nyere      | Kjøre appen med én kommando |
| Node.js                                | 24 (LTS) eller nyere | Utvikling og tester         |
| npm                                    | 11 (følger med Node) | Utvikling og tester         |

## Kjør appen

```bash
docker compose up --build
```

Compose starter `postgres:18` (med volum og healthcheck), kjører databasemigreringene i en egen tjeneste som avslutter, og starter deretter appen på <http://localhost:3000>. Coachen går i demo-modus, så ingen API-nøkkel trengs. Stopp med `Ctrl+C`, eller `docker compose down` (legg til `-v` for å slette databasen).

Er port 5432 eller 3000 opptatt (for eksempel av en lokal PostgreSQL), velg andre porter i `.env`, for eksempel `DB_PORT=5433` og `APP_PORT=3001`. Bruker du en annen `DB_PORT`, må porten i `DATABASE_URL` endres tilsvarende.

## Utvikling

```bash
npm ci
cp .env.example .env           # verdiene passer til Postgres i Compose
                               # fyll inn BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d db        # bare databasen
npm run db:migrate             # kjør migreringene
npm run dev                    # appen på http://localhost:3000
```

| Kommando                                  | Hva den gjør                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `npm run typecheck`                       | Typesjekk med TypeScript (`tsc --noEmit`)                                  |
| `npm run lint`                            | ESLint, inkludert regelen for grenser mellom snitt (se arkitekturen, AD-1) |
| `npm run format` / `npm run format:check` | Formaterer med Prettier / sjekker formatering                              |
| `npm run db:generate`                     | Lager en ny migrering fra skjemaet i `src/shared/db/schema`                |
| `npm run db:migrate`                      | Kjører migreringene mot `DATABASE_DIRECT_URL` eller `DATABASE_URL`         |

## Tester

Integrasjonstestene og Playwright trenger databasen fra Compose (fra Story 1.2, innlogging):

```bash
docker compose up -d db        # bare databasen
npm run db:migrate             # kjør migreringene
npm test                       # Vitest: datohjelperen, grenseregelen og integrasjonstester mot Postgres
npx playwright install chromium  # første gang
npm run test:e2e               # Playwright: bygger appen og tester innlogging, app-skallet og temaet
```

Integrasjonstestene i `tests/integration` hoppes over når `DATABASE_URL` mangler (verken i miljøet eller i `.env`). I CI er den alltid satt, så der kjører de alltid. Playwright bruker en egen testverdi for `BETTER_AUTH_SECRET` når den ikke er satt.

Samme tester kan kjøres mot Docker-imaget (standalone-serveren), som er det sensor starter:

```bash
docker compose up -d --build
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
docker compose down
```

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) kjører alle sjekkene over på hver pull request og på `main`: lint, typesjekk, formatering, Vitest (med en Postgres-tjeneste), Playwright mot produksjonsbygget og Playwright mot `docker compose up`.

## Mappestruktur

```text
src/app/              ruter og layout, ingen forretningslogikk
src/features/<snitt>/ account, onboarding, plan, logging, coach, profile; bare api.ts er offentlig
src/shared/           engine (ren planmotor), db (Drizzle), auth, coach-provider, ui, lib (datoer, resultattype)
src/seed/             demobrukere bygget gjennom snittenes api.ts
data/                 øvelsesbibliotek og innspilte coach-svar
tests/                engine, coach, integration, e2e og lint (bevis for grenseregelen)
scripts/              engangsskript (utvalg av øvelser)
```

## Planleggingsdokumenter

Alt planleggingsarbeid ligger i [`.docs/`](.docs/):

- [Produktbrief](.docs/planning-artifacts/briefs/) og [PRD](.docs/planning-artifacts/prd-flex-pt.md)
- [UX: DESIGN.md og EXPERIENCE.md](.docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/)
- [Arkitektur](.docs/planning-artifacts/architecture/architecture-G83-aardal-grundekjon-tingstad-2026-11-16/ARCHITECTURE-SPINE.md)
- [Epics og stories](.docs/planning-artifacts/epics.md) og [sprintstatus](.docs/implementation-artifacts/sprint-status.yaml)
- [Sporbarhet mot sensorveiledningen](.docs/sensorveiledning-sporbarhet.md)
- Sesjonslogger fra arbeidet med KI ligger i [`.logs/`](.logs/)

### BMAD-oppsett

Vi bygger med BMAD-skills. Mappa `_bmad/` er ignorert av git, så hvert medlem har sin egen installasjon. Legg disse tre linjene (under `[modules.bmm]`) i `_bmad/custom/config.user.toml`, slik at skillene finner dokumentene i `.docs/`:

```toml
[modules.bmm]
planning_artifacts = "{project-root}/.docs/planning-artifacts"
implementation_artifacts = "{project-root}/.docs/implementation-artifacts"
project_knowledge = "{project-root}/.docs"
```

## API-nøkler

Appen kan kjøres lokalt uten API-nøkler. Bare én ekstern tjeneste kan kreve nøkkel: språkmodellen bak coachen (Claude fra Anthropic). Den er av som standard.

### Coachen

Coachen har to moduser, styrt av miljøvariabelen `COACH_MODE`:

| Modus             | Hva coachen gjør                                  | Nøkkel              |
| ----------------- | ------------------------------------------------- | ------------------- |
| `demo` (standard) | Svarer med innspilte svar på eksempelmeldingene   | Ingen               |
| `live`            | Kaller Claude via det offisielle Anthropic SDK-et | `ANTHROPIC_API_KEY` |

Demobrukere («Prøv demo») bruker alltid demo-modus, uansett `COACH_MODE`.

Verken brukere eller sensor logger inn hos Anthropic. Det er serveren som kaller Claude med nøkkelen; brukeren logger bare inn i appen.

#### Slik tester du den ekte coachen lokalt

1. Lag en konto på [Claude Console](https://platform.claude.com) og kjøp kreditt. Et claude.ai-abonnement (Pro/Max) dekker ikke API-bruk.
2. Lag en API-nøkkel under **API Keys**. Sett gjerne et utgiftstak for kontoen.
3. Kopier `.env.example` til `.env` og fyll inn:

   ```
   COACH_MODE=live
   ANTHROPIC_API_KEY=<din nøkkel>
   ```

4. Start appen på nytt.

Modell-id-en er en konfigurasjonsverdi (standard `claude-haiku-5-5`). Hver bruker kan sende inntil 20 coachmeldinger per døgn (norsk tid), slik at forbruket holdes nede.

### E-post

Versjon 1 sender ingen e-post. «Glemt passord» er flyttet til versjon 2, fordi det krever et verifisert avsenderdomene for e-post (se PRD-en, kapittel 6).

`.env` er ignorert av git. Nøkler skal aldri committes.
