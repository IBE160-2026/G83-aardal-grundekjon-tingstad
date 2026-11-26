# G83 — Blind sensur

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Om appen

**Flex PT** er en mobil-først treningsapp med en KI-coach. Appen lager en ukeplan for styrke eller løping ut fra målet ditt, lar deg logge øktene sett for sett, og justerer planen sammen med deg når uka endrer seg. Den er laget for travle folk som vil ha fremgang og struktur uten et stivt program.

Status: prosjektskjelettet, innlogging, tema, demo og sletting av konto er på plass (Story 1.1–1.5). Selve treningsflytene kommer i de neste storyene (se [epics.md](.docs/planning-artifacts/epics.md)).

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

### Testbrukere: «Prøv demo»

Du trenger ingen konto for å prøve appen. Trykk **Prøv demo** under innloggingen og velg en av de fire testprofilene fra PRD-ens vedlegg B:

| Profil | Hvem                                                               |
| ------ | ------------------------------------------------------------------ |
| A      | Styrke, nybegynner, helkropp, 2 økter i uka på treningssenter      |
| B      | Styrke, erfaren, helkropp, 5 økter i uka på treningssenter         |
| C      | Løping, nybegynner, mål 10 km, lengste tur 3 km, 3 økter i uka     |
| D      | Løping, erfaren, mål halvmaraton, lengste tur 15 km, 4 økter i uka |

Hvert valg lager en ny demobruker bare for deg (logget inn gjennom Better Auth, med tilfeldig passord som aldri vises), så besøkende deler aldri data. Merket «Demo» vises øverst så lenge du er logget inn som demobruker, og demobrukere kan ikke endre e-post eller passord. Demobrukere eldre enn 24 timer slettes når neste demobruker lages. Ingen demobrukere lages ved oppstart. Planer, logger og coach-scenarier for demoprofilene kommer med Epic 2–4.

### Slette kontoen

Under **Profil** sletter **Slett konto** kontoen for godt etter en bekreftelse («Avbryt» / «Slett»). Brukeren og alt brukeren eier (økter, profil og senere planer, logger og meldinger) slettes i databasen med `ON DELETE CASCADE`, og etterpå kan du ikke logge inn med den gamle e-posten og passordet. Valget av tema ligger i en informasjonskapsel på enheten og blir værende.

## Publisert app

**URL:** <https://flexpt.vercel.app/>

Appen publiseres fra `main` på Vercel, med PostgreSQL på Supabase. Merk at et gratis Supabase-prosjekt **pauses etter en uke uten bruk** og må gjenopptas (Resume project i Supabase-dashbordet) før en demonstrasjon.

### Miljøvariabler i produksjon

Verdiene settes bare i Vercel (Settings → Environment Variables) og Supabase, aldri i repoet. Sett dem kun for miljøet **Production**, slik at forhåndsvisninger av andre grener ikke får tilgang til databasen.

| Variabel              | Verdi i produksjon                                                              |
| --------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Supabase _transaction pooler_ (port 6543), med `?sslmode=require` på slutten    |
| `DATABASE_DIRECT_URL` | Supabases direkte tilkobling (port 5432); brukes bare til migreringer           |
| `BETTER_AUTH_SECRET`  | Egen tilfeldig verdi: `openssl rand -base64 32`                                 |
| `BETTER_AUTH_URL`     | Den publiserte URL-en. Tom på Vercel: `VERCEL_PROJECT_PRODUCTION_URL` brukes da |
| `COACH_MODE`          | `demo` (settes til `live` først når coachen kommer i Epic 4)                    |

Koden slår av prepared statements når `DATABASE_URL` bruker port 6543 (poolen støtter dem ikke).

### Kjør migreringene mot Supabase

Migreringene kjøres for hånd fra din maskin, mot den direkte URL-en, før en deploy som trenger dem:

```bash
DATABASE_DIRECT_URL="<direkte tilkobling fra Supabase>" npm run db:migrate
```

Supabases direkte tilkobling kan være bare IPv6 på gratisplanen. Når den ikke kan nås fra nettverket ditt, bruk _session pooler_-URL-en (port 5432) i stedet; den fungerer for migreringer.

### Sjekkliste for første publisering

1. Opprett et Supabase-prosjekt. Kopier _transaction pooler_-URL-en og den direkte URL-en (Project Settings → Database).
2. Kjør migreringene med kommandoen over.
3. Importer GitHub-repoet i Vercel. Sett _Production Branch_ til `main`.
4. Legg inn variablene fra tabellen over, kun for Production.
5. Deploy. Registrer deg, logg ut, logg inn og prøv **Prøv demo** på den publiserte URL-en. Slett testkontoen etterpå.
6. Skriv URL-en øverst i dette avsnittet.

### Kjent begrensning

Innlogging, registrering og «Prøv demo» har ingen grense for antall forsøk (Better Auths grense gjelder bare dets egne HTTP-endepunkter, ikke Server Actions). Det er en bevisst avgrensning i versjon 1, og den er ført i `.docs/implementation-artifacts/deferred-work.md`. Bruk ikke passord du bruker andre steder når du tester den publiserte appen.

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
npm test                       # Vitest: datohjelperen, grenseregelen og integrasjonstester mot Postgres (innlogging, tema, demo, sletting av konto)
npx playwright install chromium  # første gang
npm run test:e2e               # Playwright: bygger appen og tester innlogging, app-skallet, temaet, demoen og sletting av konto
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
