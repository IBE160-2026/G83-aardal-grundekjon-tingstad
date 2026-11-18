---
title: 'Endringsforslag: UX-endringer inn i PRD v1.1'
date: 2026-11-16
author: Caroline Grundekjøn (med Claude, bmad-correct-course)
status: godkjent 2026-11-16 av Caroline Grundekjøn
scope: moderat
---

# Endringsforslag: UX-endringer inn i PRD v1.1

## 1. Hva som utløste endringen

UX-arbeidet (`ux-designs/ux-G83-aardal-grundekjon-tingstad-2026-11-09/`, final 11.11) ga nye krav og presiseringer som ikke står i PRD v1.0. Emilie samlet dem i `prd-endringer-fra-ux.md` (A1–A3, B1–B6, C1–C10, D1–D3, F1–F10). PRD v1.0 sier at senere endringer skal gå gjennom `bmad-correct-course`. Arkitekturen bygger på PRD-en, så den må oppdateres først.

**Type:** nye krav fra teamet og presisering av eksisterende krav. Ingen kode finnes ennå.

## 2. Beslutninger tatt i denne økten (2026-11-16)

| # | Spørsmål | Beslutning |
|---|---|---|
| D1 | Når er et sett gjennomført? | Når det er logget med minst 1 repetisjon. 0 repetisjoner = ikke gjennomført. |
| D2 | Hva er et nytt styrkeprogram etter 8 uker? | Samme fokus og antall økter, nye øvelser der biblioteket har alternativer, vektene fortsetter fra loggen. «Fortsett med dette» eller ikke svar = dagens program fortsetter. |
| D3 | Når er et løpemål nådd? | Første fullførte løpetur på minst måldistansen. |
| F1 | Hvilke dager brukes uten «tilgjengelige dager» i onboarding? | Faste dagsmønstre: 2 = tir, tor · 3 = man, ons, lør · 4 = man, ons, fre, søn · 5 = man, tir, tor, fre, lør. Brukeren endrer dager og fravær via coachen. |
| F1 | Hvor mange utstyrsvalg? | To: «På treningssenter» og «Hjemme» (kroppsvekt). Bare for styrke. |
| F9 | Endringsmarkering | Bare på forslagskortet (før → etter). Ukeplanen merkes ikke. FR15 skrives om. |
| B4 | Konfetti | Med i v1 som bør-krav. Ingen konfetti ved redusert bevegelse. |

**Merk om D1:** Med denne regelen regnes en øvelse som gjennomført når alle planlagte sett har minst 1 repetisjon. R6 kan da øke vekten selv om brukeren klarte færre repetisjoner enn planlagt. Teamet valgte dette bevisst.

## 3. Konsekvenser

| Område | Konsekvens |
|---|---|
| Epics | Ingen ny epic. E1, E2 og E3 får endrede akseptansekriterier og tre nye stories (1.6 tema, 2.4 nytt program og løpemål, 3.4 ferdig-økt). |
| PRD | FR1–FR5, FR7, FR9, FR11, FR15, NFR1, NFR8, NFR10, ny FR17 og NFR11, §3, §6, §7, §8, R1, R4, R5, R6, R7, R8, R9, nye R13 og R14, Appendix B og endringslogg. |
| UX | Ingen endring. PRD-en følger UX-dokumentene. |
| Arkitektur | Ikke laget ennå. Bygges på v1.1. Lagring av tema (enhet eller konto) avgjøres der. |
| Tester | Progresjonstabellen får rader for 0 repetisjoner, dagsmønstre og løpemål (NFR6). |

## 4. Anbefalt vei

**Direkte justering** av PRD-en. Ingen kode skal rulles tilbake, og MVP-målet står. Omfanget øker litt (8-ukersprogram, løpemål, ferdig-økt, tema, konfetti som bør-krav). Innsats: middels. Risiko: lav, siden alt er planlegging.

## 5. Endringer i PRD-en

| Del | Endring | Kilde |
|---|---|---|
| Status | v1.1, bygger også på UX-dokumentene | E |
| FR1 | Logg ut fra Profil | F3 |
| FR2 | Onboarding i fem steg: fokus, fokusspørsmål, antall økter (2–5), «Hvor trener du?» (bare styrke), plan genereres. Ingen tilgjengelige dager. | F1 |
| FR3 | Profil har også lys/mørk/system og nytt løpemål | A3, D3 |
| FR4 | 8-ukers styrkeprogram (R13), løping til målet er nådd (R14), ny-uke-banner, ingen blaing mellom uker | A1, A2, F2 |
| FR5 | Alle øvelser vises og brukeren velger rekkefølge, forrige og anbefalt vekt, uketeller, pace for løping | C1, C2, B1, F8 |
| FR7 | Sett logges ett om gangen, status utledes av settene, anstrengelse etter «Fullfør økt», løpelogging med distanse og tid, notat på fullfør-skjermen | C3–C5, F7, F10, D1 |
| FR9 | Brukeren kan også be om kortere økt på grunn av tid | C9 |
| FR11 | Forslagskortet viser bare endrede linjer | F6 |
| FR15 | Skrevet om: endringer vises før → etter på forslagskortet, ukeplanen merkes ikke | F9 |
| FR17 (ny) | Ferdig-økt: oppsummering, motiverende melding, sitat, feiring ved løpemål, konfetti (bør), neste økt | B2–B4, C7 |
| NFR1 | «Prøv demo» på innlogging og «Demo»-merke | F4 |
| NFR8 | WCAG 2.2 AA, redusert bevegelse, tekst opptil 200 % | F5 |
| NFR10 | Norske navn og ankertekster for anstrengelse, én heiende tone (det medisinske svaret uendret) | C8, C10 |
| NFR11 (ny) | Aktiv økt gjenopprettes etter låst skjerm eller lukket app | C6 |
| §3 | Skjermtabellen oppdatert | UX |
| §5 | Stories 1.3, 1.4, 2.2, 2.3, 3.1, 3.3, 4.2 endret; nye 1.6, 2.4, 3.4 | – |
| §6 | B1–B4 er tilbakemelding, ikke gamification; B5–B6 til trinn 2 | B |
| §7 | Nytt avvik: tilgjengelige dager oppgis via coachen, ikke i onboarding | F1 |
| §8 | Nye spørsmål besvart (D1–D3, dager, utstyr) | D |
| R1, R9 | Antall økter = valgt antall (2–5); faste dagsmønstre; utilgjengelige dager meldes til coachen | F1 |
| R4 | Langturen på siste dag i mønsteret | F1 |
| R5 | Utstyr: treningssenter eller hjemme (kroppsvekt) | F1 |
| R6 | Sett gjennomført = minst 1 repetisjon | D1 |
| R8 | Utvidet til tidsbegrenset økt | C9 |
| R13 (ny) | 8-ukers styrkeprogram | A1, D2 |
| R14 (ny) | Løpemål nådd | A2, D3 |
| App. B | Dagene følger R9; kolonnen heter «Sessions and equipment» | F1 |
| Endringslogg | v1.1 | E |

## Tillegg (2026-11-16): database

Under arkitekturarbeidet valgte Caroline PostgreSQL i stedet for SQLite (samme database lokalt, hos sensor og i publisert versjon). NFR5 og §4 i PRD v1.1 er rettet tilsvarende og lagt til i samme pull request (#12), etter Carolines valg.

## 6. Overlevering

- **Omfang:** moderat. PM-oppgave (PRD) nå, deretter arkitekt.
- **Etter godkjenning:** Claude oppdaterer `prd-flex-pt.md` til v1.1, `sensorveiledning-sporbarhet.md` og sesjonsloggen på grenen `docs/prd-v1.1`. Gruppen gjennomgår endringen i en pull request.
- **Neste:** `bmad-architecture` bygges på v1.1.
- **Ferdig når:** alle punkter i `prd-endringer-fra-ux.md` står i PRD v1.1 eller er avvist med begrunnelse, og endringsloggen viser v1.1.
