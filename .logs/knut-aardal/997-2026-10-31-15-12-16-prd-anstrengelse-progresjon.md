# PRD: anstrengelse og progresjon

## 2026-10-31 kl. 15:12 — Knut Aardal

### Oppgave
Definere hvordan opplevd anstrengelse (easy, ok, hard) skal påvirke progresjonen i PRD-en, slik at FR14 og Story 3.3 kan implementeres og testes. Forslagene ble først drøftet mot v0.2, deretter justert mot Emilie sin v0.4, og så implementert etter at Knut ba om det.

### Plan
- Fant fem hull: skalaen var ikke forklart for brukeren, løping brukte ikke anstrengelse, det fantes ingen nedtrapping, det var uklart om anstrengelse gjaldt per økt eller per øvelse, og samspillet med R8 var ikke beskrevet.
- Justerte forslaget etter v0.4, der R8 bare gjelder én økt. En R8-redusert økt teller derfor som «behold» og teller ikke mot R12.
- Gjennomførte endringene på branchen `docs/prd-effort-progression-v0.5`.

### Resultat
- `.docs/planning-artifacts/prd-flex-pt.md` er oppdatert til v0.5 i commit `c423b66` (42 linjer lagt til, 12 fjernet):
  - R6 er presisert: anstrengelsen for økta gjelder alle øvelsene, og «easy» behandles som «ok».
  - R7 bruker nå anstrengelse, og rolige turer og langturen progredierer hver for seg.
  - Ny regel R12: steg tilbake med −10 % etter to «hard» eller ikke fullført på rad.
  - Vedlegg A har fått en anstrengelsesskala med ankerpunkter og en progresjonstabell.
  - FR4, FR7, FR10, FR14, loggskjermen og Story 2.2, 3.1 og 3.3 er oppdatert, og endringsloggen har fått en linje for v0.5.
- Branchen er pushet, og PR [#7](https://github.com/IBE160-2026/G83-aardal-grundekjon-tingstad/pull/7) mot `main` er opprettet. Claude Code stoppet et forsøk på å flette PR-en uten gjennomgang. Knut valgte at noen i gruppa skal godkjenne og flette den.

### Åpne punkter
- Gruppa må se over og godkjenne v0.5 i en PR, særlig R12 og verdien på 10 % for steg tilbake. Det er et produktvalg som ikke er testet i studier.
- R4 har fortsatt maler som kombinerer styrke og løping, selv om v0.4 bare lar brukeren velge ett av fokusene.
- R11 har fjernet rådet om å ringe 113 ved akutte symptomer. Anbefalingen er å beholde 113 for brystsmerter og besvimelse.
- Scenarioet med stengt treningssenter i vedlegg C motsier seg selv: meldingen sier «uten utstyr», men forventet resultat er manualøvelser.
