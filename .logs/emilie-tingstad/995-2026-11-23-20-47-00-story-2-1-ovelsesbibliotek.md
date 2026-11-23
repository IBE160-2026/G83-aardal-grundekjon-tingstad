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
- Søkte i kilden etter hjemmeøvelser for calf, vertical-push og biceps. Databasen har bare strikk-varianter og ingenting for biceps. Valgt: ikke forutsette utstyr som strikk, så fire egne kroppsvektøvelser ble lagt til (`source: "custom"`): tåhev, enbens tåhev og to varianter av pike push-up. Biblioteket har nå 50 øvelser (commit 395f3f6). Biceps er eneste kjente hull hjemme (fallback: horizontal pull).
- Pushet og PR opprettet etter dette.
- Justert underveis: standard armhevinger finnes som `Pushups` (ikke `Push-Up`), og trepunkts-dips på parallelle stenger (`Dips_-_Triceps_Version`) ble byttet ut med `Bench_Dips`, fordi det ikke fungerer hjemme.

### Åpne punkter
- Zod-skjema og Vitest-dekningstest for Story 2.1 mangler. Kriteriene i storyen er ikke fullt oppfylt før skjelettet (Story 1.1) er på plass.
- Teamet må gjennomgå utvalget og de norske navnene i PR (akseptkriterium i Story 2.1).
- Avklart: «Enkelt utstyr hjemme» forutsettes ikke i biblioteket (bare `gym` eller `both`). PRD og UX (onboarding) bør justeres tilsvarende.
- Teamet må lese gjennom de fire egne øvelsene (navn og nivå).
- Sporbarhetstabellen (`.docs/sensorveiledning-sporbarhet.md`) og `sprint-status.yaml` er ikke oppdatert for Story 2.1.
- Gjennomgang av utvalget (Emilie): «Sittende kabelro» → «Sittende roing med kabel»; sit-ups lagt til (Crunch tatt ut pga. maks 50); «Kroppsvektsro i stang» fjernet (avansert turnøvelse) og erstattet med egen «Omvendt roing med bøyde knær»; «tricepsstrekk» → «tricepsekstensjon»; «Dips mellom to benker» → «Dips med hendene på en stol». Leg extension og leg curl droppet i v1 (passer ikke i slotene).
- Til neste versjon: utvide biblioteket utover 50 øvelser, evt. slot for isolasjonsøvelser (leg extension, leg curl).
- Runde 2 (Emilie): «Tricepsekstensjon over hodet med manual»; «Chins» → «Chinups»; «Hoftehev (glutebro)» → «Glute bridge (hoftehev på gulv)»; hoppende knebøy satt til beginner. Nye egne hjemmeøvelser (flasker, uten utstyr): pullups med føttene på en stol, roing med flasker, bicepscurl og hammercurl med flasker, skullcrusher med flasker. Fjernet for å holde 50: tricepsekstensjon med håndkle og fire gym-øvelser (smalt nedtrekk, maskin-benkpress, bicepscurl med stang, tåhev med manualer). Ingen kjente hull hjemme lenger. Forslag til norske muskelnavn lagt i `muscleNamesNo` (commit f59b6d9). Instruksjoner og bilder droppes.
- Emilie skal gjennomgå forslaget til norske muskelnavn (`muscleNamesNo` i exercises.json).
- Pike push-up er beholdt som intermediate; vurder om de er for avanserte for nybegynnere hjemme.
