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
| 2 | Kjerneflytene fra brief/proposal fungerer fra start til slutt | PRD: kjerneflyter som FR; stories med AC | ⬜ |
| 2 | Omfang med reell kompleksitet (datalagring, ikke-trivielle regler, integrasjoner) | PRD: scope; arkitektur: datamodell | ⬜ |
| 2 | Stabil ved feil input og gjentatte handlinger | PRD: NFR robusthet; AC i stories | ⬜ |
| 2 | Avvik fra brief/proposal er beskrevet og begrunnet | PRD-seksjon «Avvik fra brief»; `bmad-correct-course` ved endringer | ⬜ |
| 3 | Automatiserte tester av meningsfull logikk, kjørbare via README | Arkitektur: testrammeverk; stories: testkrav i AC | ⬜ |
| 3 | Manuelle testplaner der automatikk ikke passer | `.docs/implementation-artifacts/` testplan | ⬜ |
| 3 | Feilhåndtering, inputvalidering, sikkerhetsbevissthet | PRD: NFR sikkerhet; arkitektur | ⬜ |
| 4 | Konsistent visuelt uttrykk (farger, typografi, komponenter) | `bmad-ux` → DESIGN.md | ⬜ |
| 4 | Tydelig navigasjon, tilbakemeldinger, feilmeldinger, tomtilstander | `bmad-ux` → EXPERIENCE.md; AC i stories | ⬜ |
| 4 | Tilgjengelighet: kontrast, tastatur, alt-tekst, skjemaetiketter | PRD: NFR universell utforming; AC i stories | ⬜ |
| 4 | Tilpasning til skjermstørrelser (mobil/desktop) | PRD: NFR responsivitet; UX | ⬜ |
| 4 | Spor av designarbeid (skisser, wireframes, UX-beskrivelser) | `bmad-ux`-dokumentene | ⬜ |
| 5 | Mappestruktur som samsvarer med beskrevet arkitektur | `bmad-architecture`; README-oversikt | ⬜ |
| 5 | Lesbar kode, lite duplisering, ingen død kode/KI-rester | `bmad-code-review` per story | ⬜ |
| 5 | Linter/formatter for konsekvent stil | Arkitektur: verktøyvalg; prosjektoppsett | ⬜ |
| 5 | Fornuftig håndtering av konfigurasjon og avhengigheter | Arkitektur; `.env.example` | ⬜ |

## B. Prosesskrav (kriterium 1, 6, 7 og deler av 3, 45 %+)

Dette er krav til hvordan dere jobber, og de bygges ikke inn i appen. De ivaretas gjennom arbeidsregler (`CLAUDE.md`), git-arbeidsflyt og sesjonsloggen.

| Krit. | Krav fra sensorveiledningen | Hvordan det ivaretas | Status/bevis |
|---|---|---|---|
| 1 | BMAD-dokumenter brukes og **oppdateres**, ikke bare genereres én gang | Oppdater PRD/arkitektur ved endringer (`bmad-correct-course`); endringslogg i dokumentene | 🟨 brief + lærertilbakemelding |
| 1 | Kode kan spores til krav og stories | Story-ID i branch-navn, commit-meldinger og PR-titler | ⬜ |
| 1 | Jevn commit-historikk, små commits med beskrivende meldinger | Commit per avgrenset endring, gjennom hele perioden | 🟨 |
| 1 | Branches, pull requests, issues | Én branch + PR per story; GitHub Issues for åpne punkter | 🟨 PR #2 |
| 1 | Lagrede prompts og KI-økter | `.logs/<bruker>/` via `sesjonslogg` | 🟨 påbegynt |
| 1 | Eksempler på at KI-forslag er presisert, avvist eller rettet | Egen seksjon i sesjonsloggen: «KI-forslag vi avviste/rettet» | ⬜ |
| 1 | Dokumenterte beslutninger med begrunnelse | Arkitekturdokumentet (beslutninger + begrunnelse) | ⬜ |
| 1 | Samarbeid over tid | Alle medlemmer committer/PR-er; co-author ved parprogrammering | 🟨 |
| 3 | Spor av kodegjennomgang og retting av KI-kode | PR-kommentarer; `bmad-code-review`-funn lagret | ⬜ |
| 6 | README: hva appen er, for hvem, skjermbilde | README.md | ⬜ |
| 6 | Forutsetninger med versjoner, eksakte installasjons-/startkommandoer | README.md; test på ren maskin før innlevering | ⬜ |
| 6 | Miljøvariabler med `.env.example` | `.env.example` i rot | ⬜ |
| 6 | Testdata/testbrukere og hvordan testene kjøres | README.md | ⬜ |
| 6 | Mappeoversikt og lenker til planleggings-/prosessdokumenter | README.md | ⬜ |
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
