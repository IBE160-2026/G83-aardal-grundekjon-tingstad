# Øvelsesbibliotek (Story 2.1)

`exercises.json` er et kuratert utvalg på 46 øvelser fra [Free Exercise DB](https://github.com/yuhonas/free-exercise-db).
Kilden er public domain (Unlicense). Vi har valgt ut øvelsene for hånd, oversatt navnene til norsk (NFR10) og
gruppert dem etter bevegelsesmønster (PRD Appendix A).

## Lag filen på nytt

```
node scripts/select-exercises.mjs            # laster ned kilden fra GitHub
node scripts/select-exercises.mjs sti/til/exercises.json   # bruker en lokal kopi
```

Utvalget ligger i `scripts/select-exercises.mjs`. Skriptet stopper med feil hvis en ID ikke finnes i kilden, hvis et
mønster mangler øvelser, hvis en «both»-øvelse trenger utstyr, eller hvis antallet er utenfor 30–50.

## Felter

| Felt | Betydning |
| --- | --- |
| `id` | Stabil ID, samme som i kilden |
| `nameNo` / `nameEn` | Norsk visningsnavn og engelsk kildenavn |
| `pattern` | `squat`, `hinge`, `single-leg`, `calf`, `horizontal-push`, `vertical-push`, `horizontal-pull`, `vertical-pull`, `biceps`, `triceps`, `core` |
| `location` | `gym` (bare treningssenter) eller `both` (gym og hjemme, kroppsvekt) |
| `bodyweight` | `true` hvis belastningen er kroppsvekt (vekt = `null` i loggen) |
| `primaryMuscles` / `secondaryMuscles` | Muskelgrupper fra kilden (engelsk) |
| `sourceEquipment` / `level` | Utstyr og nivå slik kilden oppgir dem |

Hjemmeøvelser kan bruke en stang, kanten på et solid bord, en benk eller et trinn (R5), for eksempel pullups og
omvendt roing.

## Kjente hull hjemme

Mønstrene `calf`, `vertical-push` og `biceps` har ingen hjemmeøvelse i kilden. Planmotoren bruker da fallbacken i
PRD Appendix A: calf → single-leg, vertical push → horizontal push, biceps → horizontal pull.
Listen står også i `knownHomeGaps` i `exercises.json`.

## Ikke gjort ennå

- Zod-skjema og Vitest-dekningstest (krever prosjektskjelettet fra Story 1.1).
- «Enkelt utstyr hjemme» fra UX er ikke et eget sted i biblioteket ennå. Merkingen er `gym` eller `both`.
