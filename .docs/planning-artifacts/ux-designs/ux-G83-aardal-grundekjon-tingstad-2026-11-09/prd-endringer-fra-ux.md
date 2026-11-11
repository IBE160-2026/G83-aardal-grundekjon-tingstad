# Endringer som må inn i PRD-en (fra UX-arbeidet)

**Kilde:** UX-økt 2026-11-09 (Emilie og Claude), logget i `.memlog.md`. **PRD det gjelder:** `prd-flex-pt.md` v1.0. **Foreslått ny versjon:** v1.1.

Hver rad sier hva som skal inn, hvor i PRD-en det hører hjemme, og hva som er åpent. Punktene er forslag fra UX-arbeidet. Teamet avgjør formuleringen i PRD-en.

## A. Nye krav fra teamet

| # | Endring | Hvor i PRD | Åpent |
|---|---|---|---|
| A1 | **Styrkeprogram på 8 uker.** Hvert styrkeprogram lages for 8 uker. Etter de 8 ukene spør appen om brukeren vil ha et nytt program. | Ny regel (R-nummer settes i PRD), FR4/FR14, ny story i E2/E3 | Hva skjer med øvelser og laster i nytt program? Hva skjer hvis brukeren svarer nei? Hva gjør appen i uke 9 mens brukeren ikke har svart? Hvordan påvirker FR3 (profilendring) uke-telleren? |
| A2 | **Løping beholder programmet til distansemålet er nådd.** Ingen tidsgrense. | Ny regel, FR4/FR14, R7 | Hva betyr «nådd»: én logget løpetur på minst målavstanden? Hva skjer når målet er nådd (nytt mål, ny onboarding-del)? |
| A3 | **Lys og mørk modus med bryter i Profil** (lys / mørk / følg system). | FR3 (profil) eller ny FR, NFR8 | Lagres valget på enheten eller kontoen? Kontrast må holde i begge moduser (NFR8). |

## B. Presisering av gamification (PRD §6 og brief utelukker «gamification»)

Teamet vurderer motiverende meldinger som feedback, ikke gamification. Foreslått grense:

| # | Endring | Status |
|---|---|---|
| B1 | **Uketeller** «X av Y økter» øverst på ukeplanen (FR4/FR5). | V1 |
| B2 | **Motiverende melding etter fullført økt** som sammenligner med forrige økt (tyngre vekt eller lengre distanse enn sist). Vises etter at anstrengelse er registrert. | V1 |
| B3 | **Motivasjonssitat** etter registrert økt. | V1 |
| B4 | **Konfetti eller annen liten feiring** som pop-up ved fullført økt. | V1 hvis billig å lage, ellers V2 |
| B5 | **Ukes-streak** (minst én registrert økt hver uke). | V2 |
| B6 | **Personlig rekord** (tyngste vekt per øvelse) som sporing og feiring. | V2 |

Skriv i §6 hvorfor B1–B4 ikke regnes som gamification, og at B5–B6 er stage 2.

## C. Presiseringer av eksisterende krav

| # | Endring | Gjelder |
|---|---|---|
| C1 | Dagens økt viser **alle øvelsene**. Brukeren velger selv rekkefølgen. Øvelsen åpnes fra oversikten. | FR5 |
| C2 | Ved en øvelse som er logget før vises **forrige vekt og anbefalt vekt** (R6). Første gang en øvelse logges vises bare sett og reps. | FR5, R6 |
| C3 | Sett logges **ett om gangen** med vekt og reps. Vekt og reps er tekstfelt med − og + for justering. Appen går automatisk videre til neste øvelse når alle sett er logget. Brukeren kan fjerne sett eller registrere 0 reps. | FR7, Story 3.1 |
| C4 | **Anstrengelse** (easy/ok/hard) registreres én gang per økt, etter «Fullfør økt» og før den motiverende meldingen. | FR7 |
| C5 | **Økt-status** utledes av loggede sett (alle = fullført, noen = delvis, ingen = ikke fullført). Brukeren velger den ikke selv. | FR7 |
| C6 | **Aktiv økt gjenopprettes** når brukeren låser telefonen eller går ut av appen og åpner den igjen (samme økt, øvelse og sett). | Ny NFR |
| C7 | Etter fullført økt vises **oppsummering av økten** og **neste økt med planlagt dag**. | FR5/FR8 |
| C8 | **Ankertekstene** for anstrengelse (App. A) er engelske i PRD, men UI skal være norsk. Oversett dem. | NFR10, App. A |
| C9 | **Tidsbegrenset økt:** brukeren melder til coachen at økten må være ferdig på f.eks. 40 minutter, og coachen foreslår ett sett færre per øvelse (bare den økten, med før/etter og godkjenning). R8 dekker i dag bare lav energi. | FR9, R8 (utvid eller ny regel) |
| C10 | **Tone:** coachen og mikroteksten bruker én heiende, støttende og motiverende tone. Det faste medisinske svaret (FR13) endres ikke og skal være nøkternt. | Briefens «one consistent tone», FR13 |

## D. Åpne spørsmål til teamet

1. Hvordan telles 0 reps i status og i R6-progresjonen? Teller et sett med 0 reps som ikke gjennomført?
2. Hva er et «nytt program» i praksis etter 8 uker, og kan brukeren endre fokus eller antall dager da?
3. Hva skjer når et løpemål er nådd?

## D2. Endringer lagt til under Finalize (2026-11-11)

| # | Endring | Gjelder |
|---|---|---|
| F1 | **Onboarding i fem steg, uten «tilgjengelige dager»:** fokus, fokusspesifikke spørsmål, antall økter i uka (2–5), «Hvor trener du?» (På treningssenter / Hjemme, bare for styrke), plan genereres. Planmotoren velger dagene selv. | FR2, R1, R9, Appendix B (A og C bruker dager i fixtures) |
| F2 | **Ny-uke-banner** øverst på ukeplanen fra første åpning i ny uke til første registrerte økt. Justering av dager og fravær skjer via coachen (FR9–FR12). Ingen blaing mellom uker i V1. | FR4, FR5, FR9 |
| F3 | **Logg ut** i Profil. | FR1, FR3 |
| F4 | **Demomodus:** knappen «Prøv demo» på innloggingen og et «Demo»-merke i toppen. | NFR1 |
| F5 | **Tilgjengelighet:** WCAG 2.2 AA som mål, støtte for redusert bevegelse og tekststørrelse opp til 200 %. | NFR8 |
| F6 | **Forslagskort** viser bare endrede linjer, med før→etter per linje. | FR11 |
| F7 | **Løpelogging:** to felt, distanse (km) og tid (min:sek), begge med −/+ og skrivefelt. Anstrengelse én gang etter «Fullfør økt», som for styrke. | FR7 |
| F8 | **Pace på ukeplanen (løping):** hver løpeøkt viser pace (min:sek per km) fra forrige gang samme økttype. Rask kort løpetur viser en ekstra motiverende melding med forrige pace og oppfordring til å slå den (R7). Første gang vises ingenting. | FR5, R7 |
| F9 | **Ingen endringsmarkering på ukeplanen.** Endringen vises på forslagskortet (før→etter) når brukeren godkjenner. Presiser eller svekk FR15 («gjeldende plan viser hva som er endret siden forrige versjon»). | FR15 |
| F10 | **Notat** er et valgfritt tekstfelt på «Fullfør økt»-skjermen (styrke og løping). | FR7 |

## E. Når PRD-en er oppdatert

- Legg til linje i endringsloggen (v1.1) med begrunnelse.
- Oppdater `.docs/sensorveiledning-sporbarhet.md` (kriterium 1: dokumenter oppdateres).
- Før dette i sesjonsloggen som endring som kom fra UX, med årsak.
