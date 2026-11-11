---
version: 0.1
name: Flex PT
status: draft
updated: 2026-11-11
sources:
  - ../../prd-flex-pt.md
  - ../../briefs/brief-flex-pt-2026-09-17/brief.md
designRef: DESIGN.md
---

# Flex PT – Experience Spine

> Utkast. PRD v1.0 er kilden for krav (FR, NFR, R-ID) og dupliseres ikke her. Der UX forutsetter noe som ikke står i PRD v1.0, er det merket **[PRD v1.1]** og samlet under «Avvik og avtaler mot PRD v1.0». Merkene `[ASSUMPTION]` og `[NOTE FOR UX]` er samlet under «Åpne punkter». Bare det memloggen har bestemt er spesifisert. Alt annet er merket, ikke designet.

## Foundation

Mobil-først web, én primær form-faktor: en telefon i stående format, brukt med én hånd og et raskt blikk før, under og etter trening (treningssenter, utendørs, hjemme). Stabil dekning og ofte wifi. Offline er ikke et krav. Ingen UI-system er valgt; komponentene er egne og beskrevet i `DESIGN.md`, som er den visuelle referansen for farger (lys og mørk), typografi, former og komponenter. Denne filen eier oppførsel, tekst og flyt og refererer til tokens som `{colors.primary}`.

Brukere i V1 er testpersoner og sensor, ikke en offentlig lansering. Briefen nevner ingen aldersgruppe; primærbrukeren er en trenings-interessert person med travel og skiftende hverdag, komfortabel med digitale tjenester.

Visuelle referanser (skisser, spines vinner ved konflikt): `.working/ia-2026-11-11.excalidraw` (informasjonsarkitektur, er ikke oppdatert med ny-uke-banneret) og `.working/flow-mari-oekt-2026-11-11.excalidraw` (Maris økt, skjermene a til g). Fargetema og retning: `.working/color-themes-1.html` (Pulsslag) og `.working/directions-1.html` (Rolig flyt).

Tilbake-pil (‹) og ikoner er ikke bestemt i detalj. Ikonsett er ikke valgt. [NOTE FOR UX]

## Information Architecture

Nedre fane-linje med fire faner: **Uke**, **Coach**, **Historikk**, **Profil**. Økt og logg åpnes fra Uke. Fane-linjen skjules under aktiv øktlogging (øktoversikt, øvelseslogg, anstrengelse, oppsummering). Ingen blaing mellom uker: Uke viser alltid inneværende uke, tidligere økter finnes i Historikk. Ingen push-varsler.

| Skjerm | Nås fra | Formål | Krav | Journey |
|---|---|---|---|---|
| Innlogging (Logg inn, Registrer ny bruker, Prøv demo) | Appstart uten innlogging, utlogging, slettet konto | Komme inn, eller starte demo med seedet testbruker | FR1, NFR1 | Flow 2, Flow 5 |
| Onboarding, ett spørsmål per skjerm (5 steg) | Etter registrering | Fortelle appen hvem du er, så planen kan lages | FR2, Story 1.3 | Flow 2 |
| Uke (hjem) | Etter onboarding, innlogging, fane | Uketeller, dagens økt, ukens plan (løpeøkter viser pace fra forrige gang), ny-uke-banner eller program-kort i uke 9 | FR4, FR5, R7 | Flow 1, Flow 4, Flow 6 |
| Øktoversikt | Uke (dagens økt), «Se dagens økt» i Coach | Alle øvelser i økta, velg rekkefølge selv, «Fullfør økt» | FR5, C1 | Flow 1 |
| Øvelseslogg | Øktoversikt | Logge ett sett om gangen (vekt og reps). Et logget sett kan trykkes og endres eller fjernes under aktiv økt | FR7 | Flow 1 |
| Løpelogg | Uke (dagens løpeøkt) | Én skjerm med Distanse (km) og Tid (min:sek), «Fullfør økt» | FR7, R7 | Flow 6 |
| Fullfør økt (anstrengelse og notat) | «Fullfør økt» i Øktoversikt eller Løpelogg | Velge Lett, Passe eller Tung én gang per økt, og valgfritt notat «Noe du vil huske?». Etter dette er økta låst | FR7 | Flow 1, Flow 6 |
| Ferdig-økt (pop-up med oppsummering) | Etter anstrengelse | Oppsummering, motiverende melding, motivasjonssitat, feiring når løpemål er nådd, neste økt og dag | FR5, FR8 **[PRD v1.1]** | Flow 1, Flow 6 |
| Coach (chat) | Fane | Fritekst til coachen, forslagskort, svar | FR9 til FR13 | Flow 1, Flow 3, Flow 4 |
| Historikk (liste) | Fane | Loggede økter, nyest først | FR8, Story 3.2 | Flow 5 |
| Øktdetalj | Historikk | Loggede sett og anstrengelse for én økt | FR8 | Flow 5 |
| Profil | Fane | Rediger profil, Lys/mørk/system, Logg ut, Slett konto | FR1, FR3, FR16 | Flow 5 |
| Bekreftelsesdialog (rediger profil, slett konto) | Profil | Bekrefte før destruktiv eller plan-endrende handling | FR3, FR16 | Flow 5 |

Hvem leder hvor: appen leder ved onboarding (ett spørsmål om gangen, tilbake-knapp) og ved ny uke (banner). Brukeren leder i økta: hun velger selv rekkefølge på øvelsene og når økta er ferdig. Coachen foreslår, brukeren godkjenner; ingenting endres i planen uten at hun har sett det (PRD §3).

Lukking: hver skjerm i tabellen har minst én journey (kolonnen over), og hvert stilt behov har en skjerm: oversikt over uka (Uke), tracke økta (Øktoversikt, Øvelseslogg), tilpasse uka (Coach), se tidligere økter (Historikk), endre profil, tema, utlogging og sletting (Profil), og demo for sensor (Innlogging).

Bevisst ikke på noen skjerm: markering av endringer siden forrige planversjon på ukeplanen (FR15). Endringen vises på forslagskortet (før → etter) når brukeren godkjenner; se «Avvik og avtaler mot PRD v1.0». Hva «nytt program» innebærer etter 8 uker er åpent i PRD (se Åpne punkter).

## Voice and Tone

Mikrotekst. Visuell merkevare ligger i `DESIGN.md`, Brand & Style. Norsk bokmål (NFR10). Du-form.

**Hovedtone:** heiende, støttende og motiverende, korte setninger, litt gøy. Brukeren skal bli glad og gira til å gi det lille ekstra, uten press eller skyld for økter som ikke ble gjort. Tonen er hentet fra «Kraftpuls», men uten kantete eller tunge ord.

**Nøktern og dempet tone** brukes for smerte og medisinsk (FR13, R11) og for tekniske feil. Ingen utropstegn, ingen heiing, ingen rød alarm.

| Situasjon | Tekst (eksempel) | Tone |
|---|---|---|
| Velkomst på Uke (første gang) | «Velkommen til Flex PT! Her ser du uka di. Trykk på dagens økt for å komme i gang.» | Heiende |
| Ny-uke-banner | «Ny uke, dette blir bra! Si ifra til coachen dersom dagene ikke passer eller du vil gjøre andre justeringer.» (ordlyd ikke endelig bestemt) | Heiende |
| Uketeller | «2 av 4 økter» | Nøytral |
| Pace på løpeøkt (ukeplan) | «Sist: 5:42 min/km» (vises ikke første gang) | Nøytral |
| Rask kort løpetur, ekstra melding | «Sist løp du denne på 5:42 per km. Klarer du å slå det i dag?» | Heiende |
| 8-ukers program (uke 9) | «8 uker unnagjort! Vil du ha et nytt program?» med «Ja, nytt program» og «Fortsett med dette» | Heiende |
| Løpemål nådd (oppsummering) | «Du klarte 10 km! Vil du sette et nytt mål? Du finner det under Profil.» | Heiende |
| Notat, felt | «Noe du vil huske?» (valgfritt) | Støttende |
| Motivasjonssitat | Tilfeldig kort setning fra fast liste, f.eks. «Én økt til er alt som skal til.» | Heiende |
| Hint ved første logg | «Velg en vekt du kan løfte kontrollert. Neste gang foreslår vi en vekt til deg.» | Støttende |
| Logg sett, knapp | «Logg sett» | Nøytral |
| Sett logget | «Sett 1 logget. Neste!» | Heiende |
| Anstrengelse, overskrift | «Hvor anstrengende var økta?» | Nøytral |
| Motiverende melding, tyngre enn sist | «Du løftet 2,5 kg mer i knebøy enn sist. Sterk økt!» | Heiende |
| Motiverende melding, uten sammenligning | «Bra jobba, Mari! Du er i gang.» | Heiende |
| Ferdig-økt, overskrift | «Bra jobba, Mari!» | Heiende |
| Coach: tidsbegrenset økt | «Greit! Her er et forslag:» | Heiende |
| Forslagskort godkjent | «Godkjent ✓» | Nøytral |
| Forslagskort avvist | «Avvist. Planen er uendret.» | Nøytral |
| Regelbrudd (FR12) | «Det får jeg dessverre ikke til å passe. [grunn]. Vil du prøve noe annet? Planen din er som den var.» | Vennlig og heiende |
| Smerte (FR13, R11, fast tekst) | «Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging.» | Nøkternt, dempet |
| Smerte i bestemt øvelse, spørsmål | «Vil du bytte øvelse?» med «Nei» og «Ja, bytt» | Nøkternt, dempet |
| Teknisk feil/timeout (NFR7) | «Noe gikk galt. Planen er uendret.» med «Prøv igjen» | Rolig |
| Feil i felt | «Reps kan ikke være negativt.» (koblet til feltet) | Klartekst, nøkternt |
| Tom Historikk | «Ingen økter ennå. Når du har logget din første økt, dukker den opp her.» med knapp «Gå til Uke» | Støttende |
| Plan genereres | «Lager planen din …» | Heiende |
| Slett konto, dialog | «Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid.» med «Avbryt» og «Slett» | Nøkternt |
| Demo | «Demo» (merke), «Prøv demo» (knapp) | Nøytral |

Merknad om samsvar med PRD: den faste teksten ved smerte er ordrett FR13/R11 og endres ikke.

### Ankertekster for anstrengelse (norsk)

Kilde: PRD Appendix A, Effort scale (engelsk). Navnene Lett, Passe og Tung og de norske ankertekstene er bekreftet av teamet (memlogg). [PRD v1.1: C8]

| Valg (PRD) | Styrke | Løping |
|---|---|---|
| Lett (easy) | «Jeg kunne gjort 4 eller flere reps til» | «Jeg kunne prate i hele setninger» |
| Passe (ok) | «Jeg hadde 2–3 reps igjen» | «Jeg kunne prate i korte setninger» |
| Tung (hard) | «Jeg hadde 0–1 reps igjen, eller teknikken røk» | «Jeg kunne bare sagt enkeltord» |

Skissen har andre undertekster («Du hadde mye igjen» osv.). Ankertekstene over følger PRD og skal vises (PRD Story 3.1), så skissens undertekster erstattes.

### Motivasjonssitat

Fast liste i appen med 20 til 30 korte, egne norske setninger i heiende og støttende tone. Ett vises tilfeldig i oppsummeringen etter økta. Ingen KI-kall, så NFR4 og NFR7 berøres ikke, og det fungerer i demomodus.

## Component Patterns

Oppførsel. Visuelle spesifikasjoner ligger i `DESIGN.md`, Components, med samme komponentnavn.

| Komponent | Bruk | Oppførselsregler |
|---|---|---|
| stepper-button, stepper-button-plus, stepper-value (stepper for vekt og reps) | Øvelseslogg | Verdien kan skrives direkte i midten. − og + endrer faste steg: vekt 0,5 kg (samsvarer med R6-avrunding), reps 1. Hold inne gir raskere endring. Forhåndsutfylt med anbefalt vekt når den finnes. Reps kan ikke bli negativt (feil i klartekst). Verdi, − og + ligger på én linje også ved 200 % tekst. Gjelder både vekt og reps. |
| exercise-card | Øvelseslogg | Viser øvelsesnavn, «Sett N av M», forrige og anbefalt vekt (bare hvis øvelsen er logget før), stepper for vekt og reps, «Logg sett», og liste over loggede sett. Sett logges ett om gangen. Under aktiv økt kan et logget sett trykkes og endres eller fjernes (✕). Å registrere 0 reps er tillatt for sett som ikke ble gjort. Når alle sett er logget går appen automatisk videre til neste øvelse (eller tilbake til øktoversikten hvis ingen er igjen; **[ASSUMPTION]** hvilken av de to). |
| stepper-button, stepper-button-plus, stepper-value (løping) | Løpelogg | To steppere på samme skjerm: Distanse (km) og Tid (min:sek), begge med − og + og skrivefelt, som styrke-stepperen (samme tapp-flater, hold-inne og 200 %-regel). Tid skrives som min:sek. Ingen «Logg sett»: «Fullfør økt» er primærhandlingen. Verdiene kan endres fritt til «Fullfør økt» er trykket. |
| effort-card, effort-card-selected | Fullfør økt | Tre valg, Lett, Passe, Tung, med ankertekst (styrke eller løping etter øktype) synlig. Ett valg, påkrevd før «Fullfør». Valgt vises også med ✓. |
| note-field | Fullfør økt | Valgfritt tekstfelt «Noe du vil huske?» under anstrengelsesvalget, for styrke og løping. Ett notat per økt, ikke per øvelse. Kan stå tomt. |
| pace-line | Uke (day-row for løpeøkt) | Viser «Sist: min:sek/km» fra forrige gang samme økttype. Pace = tid / distanse. Vises ikke første gang. |
| program-card | Uke | Vises øverst ved første åpning i uke 9 for styrke: «8 uker unnagjort! Vil du ha et nytt program?» med «Ja, nytt program» og «Fortsett med dette». Erstatter banner den uka. |
| loading-state | Etter onboarding steg 5 | «Lager planen din …» med rolig indikator, så direkte til Uke. |
| exercise-row | Øktoversikt | Hver rad åpner øvelsen. Status per øvelse: Ikke startet, «N av M sett», Ferdig. Rekkefølgen velges fritt av brukeren. Alle øvelsene i dagens økt vises (C1). |
| day-row, day-row-today | Uke | I dag er uthevet og åpner økta. Fullførte dager viser ✓. Rader for andre dager viser økt og type; løpeøkter viser pace-line. Ingen blaing til andre uker, og ingen endringsmerke (FR15, se Avvik). |
| progress-bar | Uketeller på Uke, onboarding | Horisontal. På Uke: «X av Y økter» (Y fra planen). I onboarding: «Steg N av M» (steg 4, «Hvor trener du?», hoppes over for løping, så M er 4 for løping og 5 for styrke; **[ASSUMPTION]**). Ingen animasjon ved redusert bevegelse. |
| proposal-card, proposal-card-approved | Coach | Vises bare når et forslag er gyldig. Viser bare endrede linjer, hver som før → etter («Knebøy 3 → 2 sett»), med «Avvis» og «Godkjenn». Etter «Godkjenn»: kortet blir «Godkjent ✓» og knappen «Se dagens økt» fører til økta. Brukeren blir i chatten til hun trykker. Dobbelttrykk på «Godkjenn» gir ingen ekstra effekt (NFR9). Etter «Avvis» er planen uendret. Et forslag basert på en eldre planversjon avvises med en klar melding (NFR9). Knappene deaktiveres så snart de er trykket. |
| chat-bubble-coach | Coach | Alle vanlige coach-svar og regelbrudd-forklaring (FR12): ingen forslagskort, ingen Godkjenn, planen uendret. |
| chat-bubble-user | Coach | Brukerens fritekst. Inndata er bare fritekst-felt nederst (FR9). Ingen hurtigknapper i V1. |
| chat-bubble-pain | Coach | Fast svar (FR13/R11) i rolig, dempet boble. Ved smerte i en bestemt øvelse følger «Vil du bytte øvelse?» med «Nei» og «Ja, bytt». «Ja, bytt» gir et vanlig forslagskort som må godkjennes. Ved akutte symptomer (f.eks. brystsmerte): samme faste svar uten bytte-spørsmål (R11). Planen endres aldri automatisk. |
| chat-bubble-error | Coach | Teknisk feil eller timeout (NFR7): «Noe gikk galt. Planen er uendret.» og «Prøv igjen». «Prøv igjen» sender den siste meldingen på nytt. Flere raske trykk gir én sending (NFR9). |
| tab-bar, tab-bar-item-active | Hovedapp | Fire faner. Skjules under aktiv øktlogging. Aktiv fane har `aria-current`. Å bytte fane mister ikke tekst i chatfeltet. **[ASSUMPTION]** |
| choice-card, choice-card-selected | Onboarding, steg 1, 2 og 4 | Ett valg per skjerm. Trykk velger og går videre; alle felt er påkrevd og bare definerte valg finnes (Story 1.3). Forklaring i heiende tone. Tilbake-knapp øverst. |
| number-chip, number-chip-selected | Onboarding, steg 3 (antall økter 2 til 5) | Runde tallknapper, ett valg. 2 til 5 følger R1 (minst 2, maks 5). |
| banner | Uke | Ny-uke-banner. Vises øverst fra første åpning i ny uke til første økt er registrert den uka, og forsvinner da. Kan ikke lukkes manuelt. Ingen egen coach-knapp (Coach ligger i fane-linjen). Planen er allerede laget ved første åpning (FR4). Erstattes av program-card første uke etter 8-ukers programmet. |
| hint-card | Uke (velkomst), første logg | Vises én gang og kan lukkes. Lukkingen huskes. |
| popup-done | Etter anstrengelse | Se Key Flows, Flow 1. Inneholder oppsummering, motiverende melding og neste økt med dag. Viser også motivasjonssitat (fast liste), og for løping pace-melding på rask kort løpetur og feiring når målet er nådd (se Flow 6). Lukkes med «Ferdig» og landing er Uke. Blokkerer ikke resultatet bak animasjon (se Accessibility Floor). |
| button-primary, button-secondary, button-text, button-destructive | Overalt | Maks én button-primary per skjerm. «Slett konto» og «Slett» er button-destructive og krever dialog. |
| input-field | Innlogging, Profil | Etikett alltid synlig. Feil i klartekst under feltet, koblet til feltet for skjermleser. |
| status-tag | Uke, Øktoversikt | Ikon eller tekst i tillegg til farge. |
| demo-badge | Toppen, når demobrukeren er innlogget | Viser at coach-svar er innspilte (NFR1). Ikke interaktivt. |

Økt-status (fullført, delvis, ikke fullført) velges ikke av brukeren. Den utledes av loggede sett: alle sett = fullført, noen = delvis, ingen = ikke fullført (FR7, **[PRD v1.1: C5]**). Hvordan et sett med 0 reps teller i status og i R6-progresjonen er ikke avklart. Når «Fullfør økt» er trykket er økta låst i V1: ingen redigering, heller ikke fra Historikk. Det holder R6-progresjon og historikk pålitelig.

## State Patterns

| Tilstand | Skjerm | Behandling |
|---|---|---|
| Tom: ingen økter | Historikk | Forklaring og knapp «Gå til Uke» (Story 3.2). |
| Første gang uten anbefalt vekt | Øvelseslogg | Ingen «Forrige/Anbefalt». Bare sett og reps. Hint-card om å velge en vekt du kan løfte kontrollert (R6, **[PRD v1.1: C2]**). |
| Laster: plan genereres | Etter onboarding steg 5 | Kort lastetilstand (loading-state) «Lager planen din …», så direkte til Uke. Ingen oppsummeringsskjerm. |
| Laster: coach tenker | Coach | Rolig indikator i en coach-boble. Sendefeltet kan ikke sende på nytt før svaret er kommet (NFR9). **[ASSUMPTION]** |
| Laster: andre skjermer | Uke, Historikk | Skjelett-innhold uten bevegelse ved redusert bevegelse. **[ASSUMPTION]** |
| Validering | Felt | Feilmelding i klartekst under feltet, koblet til feltet, `error`-farge pluss ikon (farge aldri eneste signal). Verdier valideres også på serveren (NFR9). |
| Regelbrudd | Coach | Vanlig coach-boble med forklaring, ingen forslagskort, planen uendret (FR12). |
| Teknisk feil/timeout | Coach | Feilboble med «Prøv igjen» og beskjed om at planen er uendret (NFR7). |
| Teknisk feil ved lagring av sett | Øvelseslogg | Melding «Kunne ikke lagre settet. Prøv igjen.» og verdiene blir stående. Samme sett kan ikke lagres to ganger (NFR9). **[ASSUMPTION]** |
| Smerte | Coach | Dempet fast svar (chat-bubble-pain), se Component Patterns. |
| Foreldet forslag | Coach | Forslag basert på eldre planversjon avvises med klar melding (NFR9). |
| Første gang: velkomst | Uke | Hint-card, vises én gang, kan lukkes. |
| Ny uke | Uke | Banner øverst fra første åpning i ny uke til første økt er registrert den uka. Kan ikke lukkes. Planen lages ved første åpning (FR4). |
| 8-ukers program | Uke | Første åpning i uke 9 (styrke): program-card øverst, erstatter ny-uke-banner den uka. «Fortsett med dette» beholder planen. Hva «Ja, nytt program» innebærer er åpent (PRD). **[ASSUMPTION]** at kortet forsvinner når et valg er gjort. |
| Løpemål nådd | Ferdig-økt | Feiring i oppsummeringen og melding om at brukeren kan sette nytt mål under Profil (FR3). Ingen kort på Uke, planen fortsetter uendret. «Nådd» = én logget løpetur på minst målavstanden (forslag til PRD, D3). |
| Første løpetur av en økttype | Uke, Ferdig-økt | Ingen pace-line og ingen pace-melding. |
| Økt fullført | Øktoversikt, Løpelogg | Økta er låst (ingen redigering i V1). Under aktiv økt kan loggede sett endres eller fjernes. |
| Demo | Hele appen | Demo-merke i toppen. Coach-svar er innspilte. «Prøv demo» logger inn en seedet testbruker (NFR1). |
| Redusert bevegelse | Hele appen | Appen respekterer telefonens «reduser bevegelse» (prefers-reduced-motion): ingen konfetti, bare motiverende melding og en rolig, statisk markering. Progress-bar og overganger uten animasjon. |
| Aktiv økt gjenopprettes | Øktoversikt, Øvelseslogg | Etter skjermlås eller at appen lukkes åpnes samme økt, øvelse og sett. Ikke lagrede verdier i stepperen gjenopprettes ikke med mindre de er logget. **[ASSUMPTION]** Ingen pausetimer. [PRD v1.1: C6] |
| Ukeplan: ingen økt i dag | Uke | Ingen «dagens økt»-kort. Neste økt og dag vises i stedet. **[ASSUMPTION]** |
| Fokus | Alle skjermer | Synlig fokusring (se DESIGN.md, Elevation & Depth). |
| Tastatur åpent | Øvelseslogg, Coach | Primærhandlingen og feltet blir synlige. **[ASSUMPTION]** |

## Interaction Primitives

- **Tapp for å handle.** Ingen handling krever sveip, flerfingergest eller lang trykk, bortsett fra hold-inne på − og + (raskere endring). Alt har også en ordinær tapp-løsning.
- **Ett om gangen.** Ett spørsmål per skjerm i onboarding. Ett sett om gangen i loggen.
- **Auto-videre.** Når alle sett i en øvelse er logget, går appen videre.
- **Nesten umulig å gjøre feil.** Bare definerte valg i onboarding. Dobbelttrykk gir ingen ekstra effekt (NFR9). Destruktive handlinger krever bekreftelsesdialog.
- **Appen husker.** Plassering og aktiv økt overlever lås og lukk.
- **Ingen pausetimer.** Ingen hurtigknapper i Coach i V1. Ingen push-varsler.
- **Tab bar skjules** under aktiv logging for å gi plass til primærhandlingen.
- **Ikke i V1 (se Fremtidig):** streak, personlig rekord, blaing mellom uker, forhåndsvisning av neste uke.

## Accessibility Floor

Mål: WCAG 2.2 AA (utover NFR8, som ikke navngir nivå; **[PRD v1.1]**). Visuell kontrast og tapp-flatestørrelser er spesifisert i `DESIGN.md` (Colors, Layout & Spacing). Her er oppførselen.

- **Kontrast:** minst 4,5:1 for tekst og minst 3:1 for knapper, ikoner og UI-kanter, i både lys og mørk modus. Dekorative kantlinjer er ikke bærere av informasjon (se DESIGN.md).
- **Tapp-flater:** minst 44 px. − og + på steppere minst 56 px.
- **Tastatur:** alt kan nås og betjenes med tastatur. Fokusrekkefølgen følger lese-rekkefølgen. Fokus er alltid synlig. Modalen (popup-done, bekreftelsesdialog) fanger fokus og flytter fokus til første element, og tilbake ved lukking.
- **Skjermleser:** alle felt har etiketter. − og + har etiketter («Øk vekt med 0,5 kilo», «Reduser reps med 1»). Verdifeltet leses opp med enhet. Status leses opp som tekst («Knebøy, 1 av 2 sett»). Fremdriftsbaren har tekstverdi. Feilmeldinger er koblet til feltet. Nye coach-svar og «Godkjent ✓» annonseres. Banner og popup-done har rolle og navn.
- **Farge aldri eneste signal:** valgt, ferdig, feil og advarsel har alltid ikon eller tekst i tillegg.
- **Redusert bevegelse:** prefers-reduced-motion gir ingen konfetti og ingen animasjon på fremdriftsbar og overganger. Resultatet vises aldri bare som feiring: melding og oppsummering i tekst er alltid der.
- **Tekststørrelse:** følger telefonens innstilling, opptil 200 % uten brutt layout. −/verdi/+ ligger på én linje.
- **Språk:** `lang="nb"`.
- **Tidsavbrudd:** ingen handling har tidsfrist. Pop-upen lukkes ikke av seg selv.

## Key Flows

### Flow 1 – Maris økt (Mari, 26, markedsføringskonsulent som tar fag på siden; onboarding: styrke, 4 økter i uka)

Utgangspunkt: forrige økt (overkropp) er fullført, i dag, onsdag, er det underkropp. Mari er på vei til treningssenteret.

1. Mari åpner appen og ser Uke: uketeller «2 av 4 økter» som horisontal fremdriftsbar og dagens økt (Underkropp, 5 øvelser) uthevet.
2. Hun går til Coach og skriver «Må bli ferdig på 40 min i dag». [PRD v1.1: C9]
3. Coachen svarer «Greit! Her er et forslag:» og viser et forslagskort med bare endringene: «Knebøy 3 → 2 sett», «Markløft 3 → 2 sett», «Utfall 3 → 2 sett», «Leg press 3 → 2 sett».
4. Mari trykker «Godkjenn». Kortet blir «Godkjent ✓». Hun trykker «Se dagens økt».
5. Øktoversikten viser alle øvelsene i økta. Fane-linjen er skjult. Hun velger selv rekkefølge ut fra ledige apparater.
6. Hun åpner Knebøy (racken er ledig). Appen viser «Forrige 60 kg · Anbefalt 62,5 kg», og stepperen er forhåndsutfylt med 62,5.
7. Hun gjør settet, åpner appen igjen (etter å ha låst telefonen, og appen står på samme sted), justerer ved behov med − og +, og trykker «Logg sett». Settet vises under «Loggede sett».
8. Hun gjentar per sett. Når alle sett er logget går appen videre. Hun går tilbake til øktoversikten og velger neste ledige øvelse.
9. Når alt er ferdig trykker hun «Fullfør økt».
10. Anstrengelse: «Hvor anstrengende var økta?» Hun velger «Passe» (med ankerteksten «Jeg hadde 2–3 reps igjen» synlig). Under ligger det valgfrie notatfeltet «Noe du vil huske?»; hun kan la det stå tomt. Hun trykker «Fullfør». Økta er nå låst.
11. **Klimaks:** pop-up (popup-done) med «Bra jobba, Mari!», oppsummering («5 øvelser · 9 sett · Fullført»), og den motiverende meldingen som sammenligner med forrige økt: «Du løftet 2,5 kg mer i knebøy enn sist. Sterk økt!», et tilfeldig motivasjonssitat fra den faste listen, og konfetti. Ved redusert bevegelse: ingen konfetti, bare melding og statisk markering.
12. Hun trykker «Ferdig» og landing er Uke. Uketelleren viser «3 av 4 økter», og «Neste økt: Fredag, Fullkropp» vises. Hun lukker appen.

Feilbaner: (a) Teknisk feil i coachen etter steg 2: feilboble «Noe gikk galt. Planen er uendret.» med «Prøv igjen». (b) Coachen foreslår noe som bryter en regel: vanlig boble med forklaring, ingen kort, planen uendret. (c) Mari dobbelttrykker «Godkjenn»: ingen ekstra effekt. (d) Mari gjorde ikke siste sett: hun fjerner det med ✕ eller logger 0 reps. Logget feil vekt: hun trykker på det loggede settet og endrer eller fjerner det (bare under aktiv økt). (e) Første gang hun logger en øvelse: ingen anbefalt vekt, bare sett og reps og et engangshint. (f) Mari skrur på reduser bevegelse: ingen konfetti. (g) Mari har ikke gjort alle øvelsene og trykker «Fullfør økt»: status blir delvis ut fra loggede sett. [ASSUMPTION: ingen ekstra bekreftelse]

### Flow 2 – Onboarding (Mari, første gang)

1. På innloggingsskjermen velger Mari «Registrer ny bruker» og registrerer seg (e-post og passord, FR1).
2. Steg 1, Fokus: to valgkort, «Styrke» eller «Løping», hver med kort heiende forklaring. Hun velger Styrke.
3. Steg 2, spørsmål etter fokus: for styrke «Hovedfokus» (overkropp, underkropp eller hele kroppen) og «Erfaring» (nybegynner eller erfaren), som valgkort. (Løping: «Mål» og «Lengste løpetur».)
4. Steg 3, «Hvor mange økter i uka?»: runde tallknapper 2 til 5. Hun velger 4.
5. Steg 4, «Hvor trener du?»: «På treningssenter» eller «Hjemme». Stilles bare for styrke; løping hopper over steget.
6. Steg 5: planen genereres. Kort lastetilstand («Lager planen din …»).
7. **Klimaks:** Mari lander rett på Uke med den ferdige planen, velkomst-hinten og uketelleren «0 av 4 økter». Ingen oppsummeringsskjerm.

Gjennomgående: horisontal fremdriftsbar øverst, tilbake-knapp, ett spørsmål per skjerm, alle felt påkrevd. Svar kan rettes senere i Profil, med bekreftelse (FR3). Tilgjengelige dager spørres ikke om i onboarding; de meldes til coachen i chatten (FR9). **[PRD v1.1]**

Feilbane: registreringsfeil (ugyldig e-post, for kort passord) gir en klartekstmelding under feltet (Story 1.2). Mari trykker tilbake: forrige svar er beholdt.

### Flow 3 – Smerte-melding (Mari, to uker senere, etter en tung knebøy)

1. Mari skriver til coachen: «Det gjør vondt i kneet når jeg tar knebøy».
2. Coachen svarer i den rolige, dempede boblen med den faste teksten: «Vi kan beklageligvis ikke bistå med medisinsk rådgivning. Anbefaler deg å ta kontakt med legen eller annen hjelp for videre oppfølging.»
3. Rett under, i samme dempede stil: «Vil du bytte øvelse?» med «Nei» og «Ja, bytt».
4. Mari trykker «Ja, bytt».
5. **Klimaks:** coachen svarer med et vanlig forslagskort («Knebøy → [annen øvelse]», før → etter) som hun må godkjenne. Planen endres ikke før hun trykker «Godkjenn». Alternativt «Nei»: planen er uendret.

Variant: «Jeg har brystsmerter». Samme faste svar, uten bytte-spørsmål og uten planendring (R11). Ingen røde farger og ingen heiende tekst.

Feilbane: teknisk feil → feilboble. Smerte uten bestemt øvelse (f.eks. «Jeg har vondt i ryggen»): bare det faste svaret. **[ASSUMPTION]** (PRD FR13 sier bytte-spørsmål bare ved «en bestemt øvelse eller kroppsdel».)

### Flow 4 – Ny uke (Mari, mandag)

1. Mari åpner appen første gang i ny uke. Planen for uka lages (FR4, Story 2.2).
2. Uke viser banneret øverst: «Ny uke, dette blir bra! Si ifra til coachen dersom dagene ikke passer eller du vil gjøre andre justeringer.»
3. Hun ser at onsdag ikke passer. Hun går til Coach (fane) og skriver «Jeg kan ikke onsdag».
4. Coachen svarer med et forslagskort (flyttet økt). Hun godkjenner.
5. **Klimaks:** etter første registrerte økt den uka forsvinner banneret.

Banneret vises til første registrerte økt, kan ikke lukkes manuelt og har ingen coach-knapp. Ingen blaing til andre uker, ingen forhåndsvisning av neste uke.

Variant, uke 9 (styrke): ved første åpning etter 8 uker viser Uke program-card øverst i stedet for banneret: «8 uker unnagjort! Vil du ha et nytt program?» med «Ja, nytt program» og «Fortsett med dette». Hva «nytt program» innebærer er åpent (PRD).

### Flow 6 – Løpeøkt (Jonas, løper med mål om 10 km)

Utgangspunkt: Jonas valgte Løping i onboarding (steg 4 hoppet over). Han har logget løpeturer før.

1. Jonas åpner Uke. Dagens løpeøkt (rask kort løpetur) viser pace-line: «Sist: 5:42 min/km», og en ekstra heiende melding: «Sist løp du denne på 5:42 per km. Klarer du å slå det i dag?» Første gang en økttype løpes vises ingenting.
2. Etter løpeturen åpner han Løpelogg: én skjerm med Distanse (km) og Tid (min:sek), begge med − og + og skrivefelt som styrke-stepperen.
3. Han fyller inn verdiene og trykker «Fullfør økt».
4. Anstrengelse: Lett, Passe eller Tung med løpe-ankertekst («Jeg kunne prate i hele setninger» osv.), og det valgfrie notatfeltet «Noe du vil huske?». Han velger «Passe» og trykker «Fullfør».
5. **Klimaks:** pop-up med oppsummering (distanse, tid, pace), motiverende melding og motivasjonssitat. Hvis han har logget én løpetur på minst målavstanden: feiring («Du klarte 10 km!») og melding om at han kan sette nytt mål under Profil. Ingen kort på Uke, planen fortsetter uendret.
6. Han trykker «Ferdig» og lander på Uke. Økta er låst.

Feilbaner: første løpetur av en økttype: ingen pace. Teknisk feil ved lagring: «Kunne ikke lagre økta. Prøv igjen.» og verdiene blir stående (se Åpne punkter, [ASSUMPTION] 16).

### Flow 5 – Historikk, profil og utlogging (Mari, helg)

1. Mari går til Historikk og ser loggede økter, nyest først. Hun trykker en økt og ser loggede sett og anstrengelse (Øktdetalj).
2. Hun går til Profil og velger Mørk under «Utseende» (Lys, Mørk, Følg system). Appen bytter med én gang.
3. Hun åpner «Rediger profil» og endrer antall økter. Appen ber om bekreftelse («Planen for resten av uka lages på nytt. Loggede økter beholdes.») (FR3).
4. **Klimaks:** hun trykker «Logg ut» og kommer til innlogging.

Variant for sensor: på innloggingen trykker sensor «Prøv demo», logges inn som seedet testbruker og ser «Demo»-merket. Variant for sletting: «Slett konto» åpner dialog (Avbryt/Slett). Etter sletting er brukeren tilbake på innlogging og kan ikke logge inn (FR16). Tom historikk: se State Patterns.

## Responsive & Platform

Mobil først, stående telefon (se Foundation). Layouten er én kolonne med innholdsbredde opptil 480 px og tilpasser seg ned til 320 px bredde uten horisontal rulling. Ingen egne tablet- eller desktop-oppsett i V1: på bredere skjermer sentreres den samme kolonnen, og fane-linjen forblir nederst. Dette er for sensor som åpner appen i en nettleser på PC. Tekststørrelse opptil 200 % er et eget krav (se Accessibility Floor). Systemets lys/mørk-valg følges når Profil står på «Følg system».

## Fremtidig (V2)

Ikke designet inn i V1-flater. Bare definisjoner, for at vi unngår å bygge noe som må rives:

- **Ukes-streak:** minst én registrert økt hver uke. Teller og streak øverst på Uke. [PRD v1.1: B5]
- **Personlig rekord:** tyngste vekt per øvelse, med sporing og en liten feiring. [PRD v1.1: B6]
- **Konfetti:** B4 er V1 hvis billig å lage, ellers V2. Se Åpne punkter.

## Avvik og avtaler mot PRD v1.0

UX forutsetter følgende. Alle er avtalt i UX-arbeidet, men står ikke i PRD v1.0 ennå. Kilde: `prd-endringer-fra-ux.md`. Kodene A1 osv. er radnumrene i den filen. Teamet avgjør formuleringen.

| Kode | Det UX forutsetter | PRD |
|---|---|---|
| A1 | Styrkeprogram på 8 uker. Første åpning i uke 9: program-card øverst («Ja, nytt program» / «Fortsett med dette»), erstatter ny-uke-banner den uka. Hva «nytt program» innebærer er åpent (D2). | R-regel, FR4/FR14 |
| A2 | Løping beholder programmet til distansemålet er nådd. Når målet er nådd: feiring i oppsummeringen og melding om nytt mål under Profil, ingen kort på Uke, planen uendret. «Nådd» = én logget løpetur på minst målavstanden (forslag, D3). | R-regel, FR4/FR14, R7 |
| A3 | Lys/mørk/følg system, bryter i Profil. | FR3/NFR8 |
| B1 | Uketeller «X av Y økter» øverst på Uke. | FR4, FR5, §6 |
| B2 | Motiverende melding etter fullført økt som sammenligner med forrige økt, vist etter at anstrengelse er registrert. Første gang uten sammenligning: enkel heiing. | §6 |
| B3 | Motivasjonssitat etter registrert økt: fast liste i appen (20 til 30 egne norske setninger), tilfeldig, ingen KI-kall. | §6 |
| B4 | Konfetti eller liten feiring som pop-up (V1 hvis billig, ellers V2). | §6 |
| B5, B6 | Ukes-streak og personlig rekord er V2. | §6 |
| C1 | Dagens økt viser alle øvelser, fri rekkefølge. | FR5 |
| C2 | Forrige og anbefalt vekt vises når øvelsen er logget før. Ellers bare sett og reps. | FR5, R6 |
| C3 | Sett logges ett om gangen, stepper med − og +, auto-videre, fjern sett eller 0 reps. Et logget sett kan trykkes og endres eller fjernes under aktiv økt; etter «Fullfør økt» er økta låst i V1. | FR7, Story 3.1 |
| C4 | Anstrengelse én gang per økt, etter «Fullfør økt» og før melding. | FR7 |
| C5 | Økt-status utledes av loggede sett. | FR7 |
| C6 | Aktiv økt gjenopprettes etter lås eller lukking. | Ny NFR |
| C7 | Oppsummering og neste økt med planlagt dag etter fullført økt. | FR5/FR8 |
| C8 | Norske ankertekster og navn (Lett, Passe, Tung) for anstrengelse, bekreftet (App. A er engelsk). | NFR10, App. A |
| C9 | Tidsbegrenset økt via coachen (ett sett færre per øvelse, bare den økta). | FR9, R8 |
| C10 | Én heiende, støttende tone. Det faste medisinske svaret (FR13) er nøkternt og uendret. | Brief, FR13 |
| F1 | Onboarding i 5 steg: Fokus, fokusspesifikke spørsmål, antall økter 2 til 5, «Hvor trener du?» (bare styrke), plan genereres. «Tilgjengelige dager» er fjernet fra onboarding; tilgjengelighet meldes til coachen. Påvirker FR2, R1, R9, Appendix B (profil A og C bruker dager) og testdata. | FR2, R1, R9, App. B |
| F2 | Ny-uke-banner til første økt er registrert, ingen blaing mellom uker, ingen push, ingen forhåndsvisning. | FR4, FR5 |
| F3 | Logg ut i Profil. | FR1 |
| F4 | Demomodus: «Prøv demo» og Demo-merke. | NFR1 |
| F5 | WCAG 2.2 AA som mål, tekst opptil 200 %. | NFR8 |
| F6 | Forslagskort viser bare endrede linjer, hver før → etter. Oppfyller FR11 uten PRD-endring. | FR11 |
| F7 | Løpelogging: én skjerm med Distanse (km) og Tid (min:sek), begge med − og + og skrivefelt. «Fullfør økt» → anstrengelse → melding. | FR7 |
| F8 | Pace (min:sek per km) på hver løpeøkt på ukeplanen, fra forrige gang samme økttype. Rask kort løpetur får ekstra melding med forrige pace og oppfordring til å slå den. Første gang vises ingenting. NB R7 sier «tid å slå»; fast distanse gjør pace og tid ekvivalente. | FR5, R7 |
| F9 | **Konflikt:** ingen endringsmerke eller endringsliste på ukeplanen. Endringen vises bare på forslagskortet (før → etter) ved godkjenning. PRD FR15 krever at gjeldende plan viser hva som er endret siden forrige versjon. Må presiseres eller svekkes i PRD v1.1, eller FR15 tolkes som oppfylt av forslagskortet. | FR15 |
| F10 | Notat er et valgfritt tekstfelt «Noe du vil huske?» på Fullfør økt-skjermen, under anstrengelsesvalget (styrke og løping), ett per økt. | FR7 |

Merk: F1 til F10 står i `prd-endringer-fra-ux.md`, avsnitt D2. Åpne PRD-spørsmål D1 til D3 står i avsnitt D.

## Åpne punkter

### [ASSUMPTION]

1. Tilbake til øktoversikten eller neste øvelse etter siste sett: auto-videre til neste øvelse, eller til øktoversikten når ingen er igjen (Component Patterns, exercise-card).
2. Onboarding-fremdrift: «Steg N av M» der M er 4 for løping (steg 4 hoppes over) og 5 for styrke.
3. Faneskifte mister ikke tekst som ligger i chatfeltet.
4. Chat: rolig indikator mens coachen svarer, og sendefeltet kan ikke sende på nytt før svaret er kommet.
5. Lastetilstand på Uke og Historikk er skjelett uten bevegelse ved redusert bevegelse.
6. Feil ved lagring av sett: «Kunne ikke lagre settet. Prøv igjen.», verdiene blir stående.
7. Aktiv økt gjenopprettes uten ikke lagrede verdier i stepperen.
8. Uke uten økt i dag viser neste økt og dag i stedet for «dagens økt».
9. Tastatur åpent: primærhandling og felt forblir synlige.
10. «Fullfør økt» med ufullstendige sett gir ingen ekstra bekreftelse; status utledes (C5).
11. Smerte uten bestemt øvelse eller kroppsdel gir bare det faste svaret.
12. Scrim bak pop-up er `{colors.background}` med 60 % dekning (DESIGN.md).
13. Trykket tilstand på stepper-knapper (DESIGN.md).
14. Stepper-steg for løping: 0,1 km for distanse og 5 sekunder for tid (ikke bestemt i memloggen).
15. «Rask kort løpetur» identifiseres av økttypen i planen (R7); pace-line og pace-melding bruker forrige logg av samme økttype.
16. Program-card i uke 9 forsvinner når brukeren har valgt, og «Fortsett med dette» beholder planen uendret. Feil ved lagring av løpeøkt gir «Kunne ikke lagre økta. Prøv igjen.» med verdiene stående.

### [NOTE FOR UX]

1. Ikonsett og tilbake-pil er ikke valgt.
2. Stepper: hold inne gir raskere endring, men hastighet og terskel er ikke bestemt.
3. Deaktivert primærknapp: kontrast ikke beregnet (DESIGN.md).
4. Motiverende melding når det ikke finnes en forrige økt å sammenligne med (første økt): eksempelet i Voice and Tone er et utkast.
5. Konfetti (B4): V1 bare hvis billig, ellers V2.
6. Profil «Rediger profil»: hvilke felter og hvordan endring av fokus håndteres er ikke bestemt utover bekreftelse (FR3). Gjelder også å sette nytt løpemål.
7. Registrerings- og innloggingsskjerm: felter og feilmeldinger følger PRD (Story 1.2); layout er ikke skissert.

### Åpne spørsmål

1. Lagres lys/mørk-valget på enheten eller kontoen? (arkitektur)
2. Hvordan telles 0 reps i status og i R6-progresjonen? (PRD D1)
3. Hva innebærer «nytt program» etter 8 uker: fokus, dager, laster? (PRD D2)
4. Bekreftelse av at «løpemål nådd» betyr én logget løpetur på minst målavstanden (PRD D3, forslag).
5. Skal «Tilgjengelige dager» fjernet fra onboarding få en egen plass senere (profil eller coach), gitt R1, R9 og Appendix B? (PRD v1.1)

Avklart og ikke lenger åpent: navn og ankertekster for anstrengelse, løpelogging, notat, FR15 (avvik F9), kilde for sitater, gjenåpning av logget økt (låst i V1).

Mikroteksteksemplene i Voice and Tone er utkast, bortsett fra den faste teksten ved smerte (ordrett fra PRD) og ankertekstene for anstrengelse (bekreftet).
