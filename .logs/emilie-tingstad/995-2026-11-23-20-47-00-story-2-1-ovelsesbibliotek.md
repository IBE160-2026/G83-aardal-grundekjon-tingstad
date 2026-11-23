# Story 2.1: Øvelsesbibliotek

## 2026-11-23 kl. 20:47 — Emilie Tingstad

### Oppgave
Få ordnet øvelsesbiblioteket fra Free Exercise DB slik at det kan brukes i appen før byggingen starter. Brukeren ba om at det ble gjort med en gang (Story 2.1 i `epics.md`).

### Plan
- Følge Story 2.1 og PRD Appendix A: håndplukket utvalg på 30–50 øvelser, skrevet til `data/exercises/`.
- Lastet ned kilden (876 øvelser) til en midlertidig mappe utenfor repoet og listet kandidater per bevegelsesmønster.
- Utvalgsskript i repoet som validerer ID-er, dekning (gym og hjemme) og utstyr mot merkingen.
- Branch `feat/story-2.1-ovelsesbibliotek`.

### Resultat
- `scripts/select-exercises.mjs`: håndkuratert liste med norske navn, uten avhengigheter. Commit f1027bd.
- `data/exercises/exercises.json` (46 øvelser) og `data/exercises/README.md` med kilde, lisens, felter og kjente hull. Commit 8b1bc88.
- Hvert av de 11 mønstrene har minst 2 gym-øvelser. Hjemme (`both`) har minst 2, unntatt kjente hull: calf, vertical-push og biceps, som bruker fallback i Appendix A.
- Format valgt: én JSON-fil med `exercises` og `knownHomeGaps`. Felter: id, nameNo, nameEn, pattern, location (`gym`/`both`), bodyweight, muskelgrupper, sourceEquipment, level.
- Ikke pushet og ingen PR opprettet ennå.
- Justert underveis: standard armhevinger finnes som `Pushups` (ikke `Push-Up`), og trepunkts-dips på parallelle stenger (`Dips_-_Triceps_Version`) ble byttet ut med `Bench_Dips`, fordi det ikke fungerer hjemme.

### Åpne punkter
- Zod-skjema og Vitest-dekningstest for Story 2.1 mangler. Kriteriene i storyen er ikke fullt oppfylt før skjelettet (Story 1.1) er på plass.
- Teamet må gjennomgå utvalget og de norske navnene i PR (akseptkriterium i Story 2.1).
- «Enkelt utstyr hjemme» (fra UX) er ikke et eget sted i biblioteket ennå; merkingen er `gym` eller `both`. Må avklares mot PRD og FR6/R5.
- Sporbarhetstabellen (`.docs/sensorveiledning-sporbarhet.md`) og `sprint-status.yaml` er ikke oppdatert for Story 2.1.
