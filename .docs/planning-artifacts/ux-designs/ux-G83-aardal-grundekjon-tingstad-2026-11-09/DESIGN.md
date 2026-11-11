---
version: 0.1
name: Flex PT
description: Mobil-først treningsapp med KI-coach. Varm, energisk og rolig. Runde former, horisontale fremdriftsbarer og store tapp-flater for bruk med én hånd i treningssenteret.
status: final
updated: 2026-11-11
colors:
  background: '#FFF8F3'
  surface: '#FFFFFF'
  text: '#2B1710'
  text-muted: '#6E5448'
  primary: '#C93A0E'
  on-primary: '#FFFFFF'
  accent: '#9A5B00'
  success: '#1B7A3E'
  warning: '#8F5A00'
  error: '#B3261E'
  border: '#E8D3C6'
  background-dark: '#17100D'
  surface-dark: '#241A15'
  text-dark: '#FFF1E8'
  text-muted-dark: '#CDB3A5'
  primary-dark: '#FF7A45'
  on-primary-dark: '#2B0F03'
  accent-dark: '#FFC247'
  success-dark: '#5FD38A'
  warning-dark: '#FFB547'
  error-dark: '#FF8A80'
  border-dark: '#4A372E'
typography:
  display:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 0.9375rem
    fontWeight: 500
    lineHeight: 1.4
  meta:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.4
  value-input:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 2.25rem
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0
  button:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 1.1875rem
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: 12px
  md: 24px
  lg: 28px
  xl: 34px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '7': 32px
  margin-screen: 20px
  gap-card: 14px
  tap-min: 44px
  tap-stepper: 56px
  tap-button: 68px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.button}'
    rounded: '{rounded.xl}'
    height: '{spacing.tap-button}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
    borderColor: '{colors.primary}'
    typography: '{typography.button}'
    rounded: '{rounded.xl}'
    height: '{spacing.tap-button}'
  button-text:
    textColor: '{colors.primary}'
    typography: '{typography.label}'
    height: '{spacing.tap-min}'
  button-destructive:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.error}'
    borderColor: '{colors.error}'
    typography: '{typography.button}'
    rounded: '{rounded.xl}'
    height: '{spacing.tap-button}'
  input-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    height: '{spacing.tap-button}'
  stepper-button:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    rounded: '{rounded.full}'
    width: '{spacing.tap-stepper}'
    height: '{spacing.tap-stepper}'
  stepper-button-plus:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.full}'
    width: '{spacing.tap-stepper}'
    height: '{spacing.tap-stepper}'
  stepper-value:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.value-input}'
    rounded: '{rounded.md}'
    height: '{spacing.tap-stepper}'
  progress-bar:
    backgroundColor: '{colors.border}'
    textColor: '{colors.primary}'
    rounded: '{rounded.full}'
    height: '{spacing.3}'
  exercise-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.border}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.5}'
  exercise-row:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.border}'
    rounded: '{rounded.md}'
    padding: '{spacing.4}'
    height: '{spacing.tap-button}'
  day-row:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.border}'
    rounded: '{rounded.md}'
    padding: '{spacing.4}'
  day-row-today:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.primary}'
    rounded: '{rounded.md}'
    padding: '{spacing.5}'
  status-tag:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.meta}'
    rounded: '{rounded.full}'
  proposal-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.accent}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.5}'
  proposal-card-approved:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.success}'
    borderColor: '{colors.success}'
    rounded: '{rounded.lg}'
  chat-bubble-coach:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.border}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.4}'
  chat-bubble-user:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.4}'
  chat-bubble-pain:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.4}'
  chat-bubble-error:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.error}'
    borderColor: '{colors.error}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.4}'
  tab-bar:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-muted}'
    borderColor: '{colors.border}'
    typography: '{typography.label}'
    height: '{spacing.tap-button}'
  tab-bar-item-active:
    textColor: '{colors.primary}'
    typography: '{typography.label}'
  choice-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.5}'
  choice-card-selected:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    borderColor: '{colors.primary}'
    rounded: '{rounded.lg}'
  number-chip:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.title}'
    rounded: '{rounded.full}'
    width: '{spacing.tap-button}'
    height: '{spacing.tap-button}'
  number-chip-selected:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.full}'
  banner:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.accent}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.4}'
  hint-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.accent}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '{spacing.4}'
  popup-done:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.xl}'
    padding: '{spacing.6}'
  effort-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.4}'
    height: '{spacing.tap-button}'
  effort-card-selected:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    borderColor: '{colors.primary}'
    rounded: '{rounded.lg}'
  note-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.text-muted}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '{spacing.4}'
  pace-line:
    textColor: '{colors.text-muted}'
    typography: '{typography.meta}'
  program-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    borderColor: '{colors.accent}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '{spacing.5}'
  loading-state:
    textColor: '{colors.text-muted}'
    typography: '{typography.body}'
  demo-badge:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.surface}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
---

## Brand & Style

Flex PT er en personlig trener som tilpasser seg hverdagen. Utseendet skal gjøre brukeren glad og gira til å gi det lille ekstra, uten at det blir høylytt. Retningen er «Rolig flyt»: luftig, myk og vennlig, med store runde former, rause marginer og skriftvekt 500 til 600. Fargetemaet «Pulsslag» (korall og oransje) gir varme og energi. Tonen i teksten er heiende og støttende, men flatene er ikke kantete eller tunge.

Appen brukes ofte i et treningssenter, med én hånd og et raskt blikk. Derfor kommer lesbarhet og store tapp-flater foran dekor. Tall (vekt og reps) er det viktigste på øktskjermen og skal alltid være størst. Fremdrift vises som horisontal fremdriftsbar, ikke ring. Dempede stiler brukes bevisst for smerte og feil, slik at heiende tone aldri havner på et alvorlig budskap.

Gamification (konfetti, streak, rekordsporing) er ikke en del av den visuelle identiteten i V1, med unntak av en liten feiring i pop-upen ved fullført økt (se Components). Se EXPERIENCE.md for hva som er V2.

## Colors

Alle farger er semantiske roller med et lys/mørk-par (`-dark` er verdien i mørk modus). Komponenter og EXPERIENCE.md refererer til rollen, aldri til hex. Der en komponent oppgir `{colors.x}`, løses den til `{colors.x-dark}` i mørk modus. Hex-verdiene er hentet uendret fra temaet «Pulsslag».

| Rolle | Lys | Mørk | Bruk |
|---|---|---|---|
| `background` | `#FFF8F3` | `#17100D` | Sidebakgrunn |
| `surface` | `#FFFFFF` | `#241A15` | Kort, bobler, felt, tab bar |
| `text` | `#2B1710` | `#FFF1E8` | Brødtekst, tall, titler |
| `text-muted` | `#6E5448` | `#CDB3A5` | Etiketter, metatekst, kantlinje på interaktive elementer |
| `primary` | `#C93A0E` | `#FF7A45` | Primærknapp, +, aktiv fane, fremdriftsfyll, valgt valg |
| `on-primary` | `#FFFFFF` | `#2B0F03` | Tekst og ikoner på `primary` |
| `accent` | `#9A5B00` | `#FFC247` | Anbefalt vekt, endringslinjer, banner- og hintkant, Demo-merke |
| `success` | `#1B7A3E` | `#5FD38A` | «Godkjent ✓», fullført-markering |
| `warning` | `#8F5A00` | `#FFB547` | «Kortere økt foreslått» og lignende statuser |
| `error` | `#B3261E` | `#FF8A80` | Feilmelding i felt, feilboble, destruktive handlinger |
| `border` | `#E8D3C6` | `#4A372E` | Dekorative delelinjer og kortkant, ikke eneste kantlinje på et interaktivt element |

Kontrast er beregnet (WCAG 2.2, relativ luminans) for hvert par som brukes:

| Par | Lys | Mørk | Krav |
|---|---|---|---|
| `text` på `background` | 16,20:1 | 17,02:1 | tekst 4,5:1 |
| `text` på `surface` | 17,03:1 | 15,40:1 | tekst 4,5:1 |
| `text-muted` på `background` | 6,60:1 | 9,48:1 | tekst 4,5:1 |
| `text-muted` på `surface` | 6,94:1 | 8,58:1 | tekst og UI-kant |
| `on-primary` på `primary` | 5,13:1 | 6,93:1 | tekst 4,5:1 |
| `primary` på `background` | 4,88:1 | 7,28:1 | tekst og UI 3:1 |
| `primary` på `surface` | 5,13:1 | 6,58:1 | tekst og UI 3:1 |
| `accent` på `background` | 5,16:1 | 11,70:1 | tekst 4,5:1 |
| `accent` på `surface` | 5,43:1 | 10,59:1 | tekst 4,5:1 |
| `success` på `surface` | 5,38:1 | 9,06:1 | tekst 4,5:1 |
| `warning` på `surface` | 5,78:1 | 9,69:1 | tekst 4,5:1 |
| `error` på `surface` | 6,54:1 | 7,46:1 | tekst 4,5:1 |
| `error` på `background` | 6,22:1 | 8,24:1 | tekst 4,5:1 |
| `primary` mot `border` (fremdriftsfyll mot spor) | 3,56:1 | 4,33:1 | UI 3:1 |

Påvist svakhet: `border` mot `background` er bare 1,37:1 (lys) og 1,68:1 (mørk), og mot `surface` 1,44:1 og 1,52:1. Det består ikke 3:1 for UI-grenser. Derfor er `border` kun dekor. Alle interaktive elementer (felt, steppere, valgkort, tallknapper) tegner kanten med `text-muted` (minst 6,60:1) eller `primary`. Fremdriftssporet i `border` er ikke bærer av informasjon alene: fyllet har 3,56:1 mot sporet, og verdien står også som tekst («2 av 4 økter»).

`demo-badge` har `surface` som tekst på `accent`. Forholdet er det samme som `accent` mot `surface`: 5,43:1 (lys) og 10,59:1 (mørk), som oppfyller 4,5:1.

Ikke bruk: `primary` som eneste markering av tilstand (valgt, fullført og feil har alltid ikon eller tekst i tillegg), rød `error` for smerte (smerte er dempet, se chat-bobler), og `accent` som flate bak lang tekst.

## Typography

Systemfontstack: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Ingen nedlastede fonter. Skriftvekt er 400 til 600 (500 for tallverdier). Alle størrelser er i `rem`, slik at de følger telefonens tekststørrelse. Layouten må tåle 200 % uten brutt design.

| Rolle | Størrelse | Vekt | Bruk |
|---|---|---|---|
| `display` | 1,75 rem | 600 | Skjermtittel, f.eks. «Underkropp», «Bra jobba, Mari!» |
| `title` | 1,25 rem | 600 | Kortoverskrifter, øvelsesnavn, tallknapper |
| `body` | 1,0625 rem | 400 | Brødtekst, chatbobler, listeinnhold |
| `label` | 0,9375 rem | 500 | Feltetiketter, fanenavn, knappetekst i tekstknapp |
| `meta` | 0,9375 rem | 400 | Hjelpetekst, «Forrige: 60 kg», tidsangivelser |
| `value-input` | 2,25 rem | 500 | Vekt og reps i stepper |
| `button` | 1,1875 rem | 600 | Knapper |

Regler: Ingen versaler og ingen kursiv som stil. Minste tekststørrelse er 0,9375 rem. Ved 200 % skal stepperen (−, verdi, +) fortsatt ligge på én linje. Verdifeltet krymper før knappene gjør det, og knappene beholder `{spacing.tap-stepper}` i bredde og høyde. Andre rader (dagrader, øvelsesrader) får lov til å brytes til to linjer og vokse i høyden. Tekst avkortes aldri på knapper eller felt.

## Layout & Spacing

Skala: 4 / 8 / 12 / 16 / 20 / 24 / 32 px, oppgitt som `{spacing.1}` til `{spacing.7}`. Skjermmargen er `{spacing.margin-screen}` (20 px) på mobil. Mellomrom mellom kort er `{spacing.gap-card}`. Layouten er én kolonne, mobil først, med rause marginer og myke kort.

Tapp-flater: minst `{spacing.tap-min}` (44 px) for alle interaktive elementer. Steppernes − og + er minst `{spacing.tap-stepper}` (56 px). Primærknapp og rader er `{spacing.tap-button}` (68 px) høye. Mellomrom mellom to tapp-flater er minst `{spacing.2}`.

Primærhandlingen på en skjerm ligger nederst, innen rekkevidde for tommelen. Tab bar (4 faner) er festet nederst på Uke, Coach, Historikk og Profil og skjules under aktiv øktlogging. Innhold får nok bunnmarg til at tab bar og primærknapp aldri dekker siste element, også ved 200 % tekst.

Bredder: innholdet har maksbredde 480 px og sentreres på bredere skjermer. Ingen egne desktop-oppsett (se EXPERIENCE.md, Responsive & Platform).

## Elevation & Depth

Flatt og luftig. Dybde skapes med tonelag (`background`, `surface`) og en kantlinje i `{colors.border}`, ikke med skygge. Skygger brukes ikke på kort eller bobler. Unntaket er pop-upen for ferdig økt: den ligger over en dempet bakgrunn (scrim). Scrim er `{colors.background}` med 60 % dekning. Verdien 60 % er et valg her, ikke bestemt i memloggen.

Fokusring er synlig og ligger utenfor elementet: 3 px i `{colors.primary}` med 2 px avstand. `primary` har minst 4,88:1 mot `background` og 5,13:1 mot `surface` i lys, 7,28:1 og 6,58:1 i mørk, som oppfyller 3:1 for fokusindikator.

## Shapes

Store, runde former gir ro. Kort og bobler bruker `{rounded.lg}` (28 px). Rader, felt og pop-up-elementer bruker `{rounded.md}` (24 px). Knapper og pop-up bruker `{rounded.xl}` (34 px), nesten pille. Steppere, tallknapper og statusmerker bruker `{rounded.full}` og blir helt runde. Chat-boblen har samme radius på alle hjørner (ingen «hale»). Fremdriftsbaren er avrundet i begge ender.

Ikke bland skarpe hjørner (under `{rounded.sm}`) med de runde formene.

## Components

Visuelle spesifikasjoner. Oppførsel ligger i EXPERIENCE.md, Component Patterns. Alle komponentnavn er identiske i begge filer.

- **button-primary**: `{colors.primary}` med tekst i `{colors.on-primary}`, `{rounded.xl}`, høyde `{spacing.tap-button}`, full bredde. Maks én per skjerm. Deaktivert: `{colors.border}` flate og `{colors.text-muted}` tekst, med ordet «utilgjengelig» for skjermleser. [NOTE FOR UX] Kontrast for deaktivert tekst er unntatt fra WCAG, men er ikke beregnet her.
- **button-secondary**: `{colors.surface}`, `{colors.primary}` tekst og 2 px kant, samme form som primær. Brukes for «Avvis», «Avbryt», «Tilbake til Uke».
- **button-text**: tekst i `{colors.primary}`, minst `{spacing.tap-min}` høy. Brukes for «Prøv igjen» og «Send» som sekundær lenke.
- **button-destructive**: `{colors.surface}` med `{colors.error}` tekst og 2 px kant. Brukes for «Slett konto» og «Slett» i dialog. Aldri fylt rød.
- **input-field**: `{colors.surface}`, 1 px kant i `{colors.text-muted}`, `{rounded.md}`. Etikett over i `{typography.label}` (alltid synlig, aldri bare plassholder). Feil: kanten blir 2 px i `{colors.error}`, og meldingen står under feltet i `{colors.error}` med et feilikon foran.
- **stepper-button** (−): runde `{rounded.full}`, `{spacing.tap-stepper}` kvadrat, `{colors.background}` flate, kant i `{colors.text-muted}`, symbol i `{colors.text}`. **stepper-button-plus** (+): `{colors.primary}` flate, symbol i `{colors.on-primary}`. Tegnet − og + er store og tydelige (ikke bindestrek). Trykket tilstand: flaten mørkner/lysner ett trinn mot `{colors.text}`. Trykket tilstand er ikke spesifisert i memloggen.
- **stepper-value**: tekstfelt med `{typography.value-input}`, sentrert, `{rounded.md}`, kant i `{colors.text-muted}`. Etikett («Vekt (kg)», «Reps») over feltet. Stepper = −, verdi og + på én linje. Samme komponent brukes i løpelogg: «Distanse (km)» og «Tid (min:sek)», to steppere over hverandre.
- **progress-bar**: horisontal, høyde `{spacing.3}`, `{rounded.full}`. Spor i `{colors.border}`, fyll i `{colors.primary}`. Tekstverdi står alltid ved siden av eller over («2 av 4 økter», «Steg 2 av 4»). Brukes som uketeller på Uke og som fremdrift i onboarding.
- **exercise-card**: `{colors.surface}`, 1 px `{colors.border}`, `{rounded.lg}`, padding `{spacing.5}`. Øvelsesnavn i `{typography.title}`. Under: «Forrige: 60 kg · Anbefalt: 62,5 kg», der anbefalt vekt er i `{colors.accent}` og `{typography.label}`. Viser stepper for vekt og reps, `button-primary` «Logg sett» og listen «Loggede sett» (hver rad kan trykkes for å endre og har ✕-knapp for å fjerne, minst `{spacing.tap-min}`). Første gang en øvelse logges mangler «Forrige/Anbefalt»-linjen.
- **exercise-row** (øktoversikt): `{colors.surface}`, `{rounded.md}`, høyde minst `{spacing.tap-button}`. Navn til venstre, status til høyre med ikon og tekst: «○ Ikke startet», «◐ 1 av 2 sett», «✓ Ferdig» (`{colors.success}` på ✓ og «Ferdig»), og chevron.
- **day-row** og **day-row-today** (ukeplan): rad per dag med dagnavn, øktnavn og status. I dag har 2 px kant i `{colors.primary}` og mer padding. Fullført dag har ✓ og teksten «Fullført». Hviledag er dempet i `{colors.text-muted}` og har tekst «Hviledag».
- **status-tag**: pille med ikon eller tekst, kant i `{colors.text-muted}` eller statusfarge. Eksempler: «Fullført» (`{colors.success}`), «Kortere økt foreslått» (`{colors.warning}`). Farge er aldri eneste bærer.
- **proposal-card**: `{colors.surface}`, 2 px kant i `{colors.accent}`, `{rounded.lg}`. Tittel «Forslag: endringer». Én linje per endring i formen «Knebøy 3 → 2 sett», der pilen er et tegn og begge verdier står som tekst. Under: `button-secondary` «Avvis» og `button-primary` «Godkjenn» side om side. Etter godkjenning: **proposal-card-approved** med `{colors.success}` kant og «Godkjent ✓», endringslinjene beholdes, og `button-primary` «Se dagens økt» vises (ingen annen primærknapp er på kortet). Etter avvisning: kortet blir en dempet linje «Avvist. Planen er uendret.»
- **chat-bubble-coach**: `{colors.surface}`, 1 px `{colors.border}`, `{rounded.lg}`, venstrejustert, maks 85 % bredde. Brukes for alle vanlige coach-svar, inkludert regelbrudd-forklaring.
- **chat-bubble-user**: `{colors.primary}` flate, `{colors.on-primary}` tekst, høyrejustert.
- **chat-bubble-pain** (dempet smerte-boble): `{colors.background}` flate, 1 px kant i `{colors.text-muted}`, tekst i `{colors.text}`. Ingen fargeaksent, ingen utropstegn, ikke rød. Ved siden av ligger bare de to valgene «Nei» og «Ja, bytt» som `button-secondary` når bytte-spørsmålet vises.
- **chat-bubble-error**: `{colors.surface}`, 2 px kant i `{colors.error}`, tekst i `{colors.text}`, med feilikon og overskriften «Noe gikk galt» i `{colors.error}`. `button-text` «Prøv igjen» i boblen. Rolig, ikke alarmerende.
- **tab-bar**: `{colors.surface}`, 1 px `{colors.border}` over, høyde `{spacing.tap-button}`. Fire faner (Uke, Coach, Historikk, Profil) med ikon og tekst, jevnt fordelt, hver minst `{spacing.tap-min}`. **tab-bar-item-active**: ikon og tekst i `{colors.primary}` pluss en 3 px strek over ikonet. Inaktive faner i `{colors.text-muted}`.
- **choice-card** (onboarding): `{colors.surface}`, 2 px kant i `{colors.text-muted}`, `{rounded.lg}`, tittel i `{typography.title}` og en kort heiende forklaring i `{typography.body}`. **choice-card-selected**: fylt `{colors.primary}`-flate med tekst i `{colors.on-primary}` og et ✓ i en sirkel, så valget er tydelig og ikke bare vises med farge.
- **number-chip** (antall økter 2 til 5): rund, `{spacing.tap-button}` kvadrat, `{typography.title}`, kant i `{colors.text-muted}`. **number-chip-selected**: `{colors.primary}` flate med `{colors.on-primary}` tall og ✓ i hjørnet.
- **banner** (ny-uke): `{colors.surface}`, 2 px kant i `{colors.accent}`, `{rounded.lg}`, tekst i `{colors.text}` med ikon. Ingen lukk-knapp. Ligger øverst på ukeplanen, over uketelleren.
- **hint-card** (førstegangs-hint): som banner, `{rounded.md}`, med en lukk-knapp (✕, minst `{spacing.tap-min}`).
- **effort-card** (Lett, Passe, Tung): `{colors.surface}`, 2 px kant i `{colors.text-muted}`, `{rounded.lg}`, minst `{spacing.tap-button}` høy. Navnet i `{typography.title}` med ankerteksten under i `{typography.body}`. **effort-card-selected**: fylt `{colors.primary}`-flate med tekst i `{colors.on-primary}` og ✓ i en sirkel. Samme valgt-stil gjelder alle tilsvarende valgbokser (for eksempel Utseende i Profil).
- **note-field**: flerlinjers tekstfelt som input-field, `{rounded.md}`, etikett «Noe du vil huske?» alltid synlig, markert «valgfritt».
- **pace-line**: én linje i `{typography.meta}` og `{colors.text-muted}` i day-row for løpeøkt, f.eks. «Sist: 5:42 min/km». Tallet står som tekst, ikke bare i farge.
- **program-card** (uke 9): som banner, 2 px kant i `{colors.accent}`, `{rounded.lg}`, padding `{spacing.5}`. Under teksten: `button-primary` «Ja, nytt program» og `button-secondary` «Fortsett med dette». Ingen lukk-knapp.
- **loading-state** («Lager planen din …»): sentrert tekst i `{typography.body}` og `{colors.text-muted}` med en rolig indikator som står stille ved redusert bevegelse.
- **popup-done** (økt ferdig): modal over scrim, `{colors.surface}`, `{rounded.xl}`, padding `{spacing.6}`. Innhold: `{typography.display}` overskrift, sammendragslinjer, den motiverende meldingen i et eget felt med `{colors.accent}` venstrekant, motivasjonssitatet i `{typography.meta}`, ved nådd løpemål en feiringslinje («Du klarte 10 km!») med melding om nytt mål under Profil, og `button-primary` «Ferdig». Konfetti er et valgfritt dekorlag bak innholdet og finnes ikke ved redusert bevegelse (se EXPERIENCE.md).
- **demo-badge**: liten pille med teksten «Demo», øverst i skjermhodet så lenge demobrukeren er innlogget. Kontrast er oppgitt under Colors.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Hold vekt og reps størst på øktskjermen | Pakk tallene inn i dekor eller små tegn |
| Bruk `text-muted` eller `primary` som kant på alt som kan trykkes | Bruk `border` som eneste kant på felt, steppere eller valgkort (1,37:1 mot bakgrunn) |
| Vis fremdrift som horisontal fremdriftsbar med tekstverdi | Bruk ring, sirkeldiagram eller streak-flammer |
| La − og + være runde og minst 56 px | Gjør steppere mindre for å få plass, også ved stor tekst |
| Vis ikon og tekst sammen med farge (✓ Ferdig, feilikon + melding) | La farge alene vise valgt, ferdig eller feil |
| Bruk heiende fargeaksent (`primary`, `accent`) for fremdrift og feiring | Bruk heiende farge eller utropstegn på smerte, medisin og feil |
| Gi smerte-boblen en dempet, nøytral stil | Bruk rød alarm for smerte eller akutte symptomer |
| Hold flatene luftige med `{rounded.lg}` og rause marginer | Legg på skygger, harde kanter eller tunge skriftvekter (over 600) |
| Bruk `rem` så alt skalerer til 200 % | Fest tekst i px eller avkort tekst på knapper |
| La konfetti være et dekorlag som kan utelates | Gjør konfetti eller animasjon til eneste måte å vise et resultat |

## Visuelle referanser

Spinene vinner ved konflikt. Mocks (lys og mørk): [fargetema Pulsslag](mockups/color-themes-1.html), [designretning Rolig flyt](mockups/directions-1.html) og mocks av alle flater, listet i EXPERIENCE.md under Foundation (mappen `mockups/`).
