---
title: "Sporbarhet mot sensorveiledningen (del 1)"
kilde: sensorveiledning-del1.md
opprettet: 2026-10-31
oppdateres: ved slutten av hver BMAD-fase og hvert epic
---

# Sporbarhet mot sensorveiledningen – del 1

Dette er et levende dokument. Det viser hvor hvert kriterium i [sensorveiledningen](sensorveiledning-del1.md) blir ivaretatt, og hvor sensor kan finne beviset. Oppdater kolonnen **Status/bevis** når noe er på plass, med lenke til fil, commit, PR eller logg.

Statusverdier: ⬜ ikke startet · 🟨 delvis · ✅ på plass

## A. Produktkrav (kriterium 2–5, 55 %)

Dette er krav til selve appen. De skal inn i PRD (FR/NFR), UX og arkitektur, og videre ned i epics og stories med akseptansekriterier.

| Krit. | Krav fra sensorveiledningen | Hvor det skal ivaretas | Status/bevis |
|---|---|---|---|
| 2 | Kjerneflytene fra brief/proposal fungerer fra start til slutt | PRD: kjerneflyter som FR; stories med AC | 🟨 PRD v1.5: FR1–FR17 i v1; [epics.md](planning-artifacts/epics.md): 4 epics, 26 stories med Given/When/Then-AC, alle FR i v1 dekket. FR18 glemt passord (tidligere Story 1.7) ble lagt til etter sammenligning med foreleserens referanse-stories, men flyttet til versjon 2 fordi gruppa ikke kjøper avsenderdomene for e-post (PRD §6). Story 1.2: registrering, innlogging og utlogging (Better Auth via Server Actions i `src/features/account`), app-skall med fire faner; testet i [tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts). Story 1.4: «Prøv demo» på innloggingen → velg profil A–D → ny demobruker med profilen fra vedlegg B, logget inn via Better Auth og sendt til Uke ([src/seed](../src/seed)); testet i [tests/e2e/demo.spec.ts](../tests/e2e/demo.spec.ts), også uten JavaScript og mot `docker compose up` |
| 2 | Omfang med reell kompleksitet (datalagring, ikke-trivielle regler, integrasjoner) | PRD: scope; arkitektur: datamodell | 🟨 PRD v1.1: regler R1–R14, planversjoner, 8-ukersprogram, språkmodell; datamodell og miljøer i arkitekturen (AD-7, AD-8, AD-17, ER-diagram) |
| 2 | Stabil ved feil input og gjentatte handlinger | PRD: NFR robusthet; AC i stories | 🟨 PRD NFR9; AC for dobbeltklikk, serverside Zod-validering og foreldede forslag i epics.md (bl.a. Story 1.2, 2.3, 3.1, 3.3, 4.3). Story 1.2: Zod på serveren for registrering og innlogging, dobbel registrering gir én konto, feil innlogging gir én felles melding; bevist i [tests/integration/auth.test.ts](../tests/integration/auth.test.ts) |
| 2 | Avvik fra brief/proposal er beskrevet og begrunnet | PRD-seksjon «Avvik fra brief»; `bmad-correct-course` ved endringer | 🟨 PRD seksjon 7 (to avvik i v1.1); endringer fra UX gikk gjennom `bmad-correct-course` ([endringsforslag](planning-artifacts/sprint-change-proposal-2026-11-16.md)) |
| 3 | Automatiserte tester av meningsfull logikk, kjørbare via README | Arkitektur: testrammeverk; stories: testkrav i AC | 🟨 PRD NFR6, profiler A–D, progresjonstabell; arkitektur AD-18: Vitest (motor, coach, integrasjon) og Playwright; testkrav i AC i epics.md (én test per profil A–D, per rad i progresjonstabellen, per planendringstype og per coach-scenario). Story 1.1: Vitest og Playwright satt opp; tester for datohjelperen (søndag→mandag, sommertid, programstart midt i uka) i [tests/engine/dates.test.ts](../tests/engine/dates.test.ts), grenseregelen og en røyktest; kommandoene står i README. Story 1.2: integrasjonstester mot Postgres (CI kjører med Postgres-tjeneste) og Playwright for innloggingsflyten. Story 1.4: integrasjonstester for demoen (egen bruker og profil per besøk, sletting av demobrukere eldre enn 24 t med injisert klokke, ukjent profil avvist, e-post og passord kan ikke endres) i [tests/integration/demo.test.ts](../tests/integration/demo.test.ts) |
| 3 | Manuelle testplaner der automatikk ikke passer | `.docs/implementation-artifacts/` testplan | ⬜ |
| 3 | Feilhåndtering, inputvalidering, sikkerhetsbevissthet | PRD: NFR sikkerhet; arkitektur | 🟨 PRD NFR2–NFR4, NFR7, NFR9, FR16; arkitektur AD-4 (Zod på alle skriveoperasjoner), AD-6 (Better Auth), AD-12 (dataminimering mot språkmodellen). AD-19 (glemt passord med rate limit) er utsatt til versjon 2. Story 1.2: Better Auth (hashing og økter), `BETTER_AUTH_SECRET` påkrevd (appen stopper med tydelig feil), `shared/auth` gir bruker-id eller avviser (`withUser` → `unauthorized`), proxy sender utloggede til innlogging, ingen åpne `/api/auth`-endepunkter. Bevisst avveining: innloggingen har ingen grense for antall forsøk i v1 (Better Auths begrensning gjelder bare HTTP-endepunktene); utsatt til før publisering i Story 1.6, se [deferred-work.md](implementation-artifacts/deferred-work.md). Story 1.4: demoflagget `is_demo` settes bare av `account` (Better Auth `input: false`, så en forespørsel kan ikke sette det), en `hooks.before` i Better Auth avviser endring av e-post og passord for demobrukere med `FORBIDDEN`, profilen valideres med Zod i `profile.api`, tilfeldig passord fra `crypto` som aldri vises |
| 4 | Konsistent visuelt uttrykk (farger, typografi, komponenter) | `bmad-ux` → DESIGN.md | 🟨 Story 1.1: fargeroller (lys og mørk), typografi, avstand og radius fra DESIGN.md er definert én gang som Tailwind-tokens i [src/app/globals.css](../src/app/globals.css), med felles fokusring og uten skygger; standardpaletten er fjernet. Komponentene i `src/shared/ui` gjenstår. Story 1.2: `input-field`, `button-*` og `tab-bar` i [src/shared/ui](../src/shared/ui). Story 1.3: `choice-card` (valgt = fylt primærfarge med ✓) brukt i temavalget, og lyst og mørkt tema kan velges på Profil. Story 1.4: `demo-badge` («Demo»-pille i accent) i [src/shared/ui](../src/shared/ui) og profilkort på «Prøv demo» med tokens |
| 4 | Tydelig navigasjon, tilbakemeldinger, feilmeldinger, tomtilstander | `bmad-ux` → EXPERIENCE.md; AC i stories | 🟨 EXPERIENCE.md (State Patterns, Voice and Tone); feilmeldinger, tomtilstander og tilbakemeldinger som AC i epics.md (UX-DR14–UX-DR27) |
| 4 | Tilgjengelighet: kontrast, tastatur, alt-tekst, skjemaetiketter | PRD: NFR universell utforming; AC i stories | 🟨 PRD NFR8 (WCAG 2.2 AA, redusert bevegelse, 200 % tekst); AC for tastatur, etiketter, fokus og axe-sjekk i begge tema i epics.md (UX-DR28, Story 1.2, 1.3). Story 1.2: etiketter over feltene, feilmeldinger koblet med `aria-describedby`, `role="alert"`, `aria-current` på aktiv fane, registrering kun med tastatur testet i Playwright. Story 1.3: temavalg Lys/Mørk/Følg system som radiogruppe (piltaster), tema satt på serveren uten blink, ingen overgang ved redusert bevegelse; axe (WCAG 2.2 AA) på innlogging og Profil i lyst og mørkt tema uten funn. Story 1.4: axe uten funn på «Prøv demo» og Uke med Demo-merket i lyst og mørkt tema; profilkortene er vanlige knapper (≥ 44 px) som virker med tastatur og uten JavaScript |
| 4 | Tilpasning til skjermstørrelser (mobil/desktop) | PRD: NFR responsivitet; UX | 🟨 PRD NFR8 (mobilbredde). Story 1.2: innlogging, registrering og Profil testet uten sidelengs rulling ved 320 px og 200 % tekst. Story 1.4: «Prøv demo» og Uke med Demo-merket testet uten sidelengs rulling ved 320 px og 200 % tekst |
| 4 | Spor av designarbeid (skisser, wireframes, UX-beskrivelser) | `bmad-ux`-dokumentene | ✅ `DESIGN.md`, `EXPERIENCE.md`, `mockups/` og `wireframes/` i `.docs/planning-artifacts/ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/` (status final 2026-11-11; validering utsatt) |
| 5 | Mappestruktur som samsvarer med beskrevet arkitektur | `bmad-architecture`; README-oversikt | ✅ Story 1.1: mappene fra Structural Seed finnes (`src/app`, `src/features/*/api.ts`, `src/shared/*`, `src/seed`, `data/`, `tests/`), og ESLint-regelen for snitt (`eslint.config.mjs`) er bevist med [tests/lint/boundaries.test.ts](../tests/lint/boundaries.test.ts); mappeoversikt i README |
| 5 | Lesbar kode, lite duplisering, ingen død kode/KI-rester | `bmad-code-review` per story | ⬜ |
| 5 | Linter/formatter for konsekvent stil | Arkitektur: verktøyvalg; prosjektoppsett | ✅ Story 1.1: ESLint (`eslint-config-next` + `eslint-plugin-boundaries`) og Prettier satt opp; `npm run lint` og `npm run format:check` er grønne |
| 5 | Fornuftig håndtering av konfigurasjon og avhengigheter | Arkitektur; `.env.example` | 🟨 Arkitektur AD-17 (miljøvariabler, `.env.example`, miljøtabell) og låste versjoner i Stack. Story 1.1: [.env.example](../.env.example), eksakte versjoner i [package.json](../package.json) med `package-lock.json`, og [docker-compose.yml](../docker-compose.yml) (database, migrering, app). Publisert miljø (Story 1.6) gjenstår |

## B. Prosesskrav (kriterium 1, 6, 7 og deler av 3, 45 %+)

Dette er krav til hvordan dere jobber, og de bygges ikke inn i appen. De ivaretas gjennom arbeidsregler (`CLAUDE.md`), git-arbeidsflyt og sesjonsloggen.

| Krit. | Krav fra sensorveiledningen | Hvordan det ivaretas | Status/bevis |
|---|---|---|---|
| 1 | BMAD-dokumenter brukes og **oppdateres**, ikke bare genereres én gang | Oppdater PRD/arkitektur ved endringer (`bmad-correct-course`); endringslogg i dokumentene | 🟨 brief + lærertilbakemelding; PRD v0.1–v1.1 med endringslogg; v1.1 via `bmad-correct-course` etter UX |
| 1 | Kode kan spores til krav og stories | Story-ID i branch-navn, commit-meldinger og PR-titler | 🟨 Story 2.1: branch `feat/story-2.1-ovelsesbibliotek`, commits og [PR #23](https://github.com/IBE160-2026/G83-aardal-grundekjon-tingstad/pull/23) med story-ID |
| 1 | Jevn commit-historikk, små commits med beskrivende meldinger | Commit per avgrenset endring, gjennom hele perioden | 🟨 |
| 1 | Branches, pull requests, issues | Én branch + PR per story; GitHub Issues for åpne punkter | 🟨 PR #2, [PR #23](https://github.com/IBE160-2026/G83-aardal-grundekjon-tingstad/pull/23) (Story 2.1) |
| 1 | Lagrede prompts og KI-økter | `.logs/<bruker>/` via `sesjonslogg` | 🟨 påbegynt |
| 1 | Eksempler på at KI-forslag er presisert, avvist eller rettet | Egen seksjon i sesjonsloggen: «KI-forslag vi avviste/rettet» | 🟨 `.logs/knut-aardal/` (PRD v0.7), `.logs/caroline-grundekjon/` (PRD v1.1) |
| 1 | Dokumenterte beslutninger med begrunnelse | Arkitekturdokumentet (beslutninger + begrunnelse) | 🟨 `architecture/architecture-G83-…-2026-11-16/`: 19 beslutninger i spinen (AD-1–AD-18 gjelder v1, AD-19 er utsatt til versjon 2), begrunnelser og forkastede alternativer i `.memlog.md`, kontroller i `reviews/` |
| 1 | Samarbeid over tid | Alle medlemmer committer/PR-er; co-author ved parprogrammering | 🟨 |
| 3 | Spor av kodegjennomgang og retting av KI-kode | PR-kommentarer; `bmad-code-review`-funn lagret | ⬜ |
| 6 | README: hva appen er, for hvem, skjermbilde | README.md | 🟨 Story 1.1: «Om appen» i [README](../README.md) sier hva appen er og hvem den er for; skjermbilde kommer når skjermene finnes |
| 6 | Forutsetninger med versjoner, eksakte installasjons-/startkommandoer | README.md; test på ren maskin før innlevering | 🟨 Story 1.1: forutsetninger med versjoner, `docker compose up --build` og utviklingsoppsett i [README](../README.md); test på ren maskin før innlevering gjenstår |
| 6 | Miljøvariabler med `.env.example` | `.env.example` i rot | ✅ Story 1.1: [.env.example](../.env.example) lister alle variabler uten ekte verdier |
| 6 | Testdata/testbrukere og hvordan testene kjøres | README.md | 🟨 Story 1.1: testkommandoene (Vitest, Playwright, også mot Docker-imaget) står i [README](../README.md); testbrukere kommer med demoen (Story 1.4). Story 1.4: testbrukerne er «Prøv demo» med profil A–D, beskrevet i [README](../README.md) under «Testbrukere»; status ✅ når planer og logger for profilene kommer i Epic 2–3 |
| 6 | Mappeoversikt og lenker til planleggings-/prosessdokumenter | README.md | ✅ Story 1.1: mappeoversikt og lenker til brief, PRD, UX, arkitektur, epics, sporbarhet og sesjonslogger i [README](../README.md) |
| 7 | `.gitignore` for avhengigheter, bygg og lokale filer | `.gitignore` | 🟨 finnes |
| 7 | Ingen hemmeligheter i repo **eller historikk** | `.env` i `.gitignore`; sjekk før hver PR | ⬜ |
| 7 | Ingen løse filer i rot, fornuftige navn | Gjennomgang før innlevering | ⬜ |

## C. Varseltegn vi aktivt skal unngå

- [ ] Kode lagt inn i få store commits rett før fristen
- [ ] Planleggingsdokumenter som beskriver en annen app enn den som leveres
- [ ] README som er en mal eller har kommandoer som ikke virker
- [ ] Hemmeligheter, `.env`, `node_modules`/`venv`/build-mapper i repoet
- [ ] Feilende eller trivielle tester
- [ ] Død kode eller rester fra forkastede KI-forsøk
- [ ] Generell KI-dokumentasjon som ikke kan knyttes til konkrete endringer

## D. Kontrollpunkter

| Når | Hva | Verktøy |
|---|---|---|
| Etter PRD | Dekker PRD alle produktkrav i tabell A? | `bmad-review` mot denne fila |
| Etter UX + arkitektur | Design-, tilgjengelighets-, test- og strukturkrav dekket? | `bmad-review` |
| Etter epics/stories | Har hver story AC for test, feilhåndtering og tilgjengelighet der det er relevant? | `bmad-sprint-planning` (readiness) |
| Per story | Kodegjennomgang, tester grønne, sesjonslogg skrevet | `bmad-build` → `bmad-code-review` |
| Per epic | Oppdater status i denne fila | `bmad-retrospective` |
| Før innlevering | Kjør sensors fremgangsmåte (kap. 3) selv: ren klone, følg README, kjør tester | Manuelt |
