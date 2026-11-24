# Øvelsesbibliotek (Story 2.1)

`exercises.json` er et kuratert utvalg på 50 øvelser: 40 fra [Free Exercise DB](https://github.com/yuhonas/free-exercise-db)
(public domain, Unlicense) og 10 egne hjemmeøvelser (`source: "custom"`) som databasen ikke har: tåhev, enbens tåhev, omvendt roing med bøyde knær,
pullups med føttene på en stol, to varianter av pike push-up og fem øvelser med vannflasker eller brusflasker (roing, bicepscurl, hammercurl og skullcrusher). Vi forutsetter ikke utstyr som strikk hjemme. Vi har valgt ut øvelsene for hånd, oversatt navnene til norsk (NFR10) og
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
| `source` | `free-exercise-db` eller `custom` (skrevet av teamet) |
| `nameNo` / `nameEn` | Norsk visningsnavn og engelsk kildenavn |
| `pattern` | `squat`, `hinge`, `single-leg`, `calf`, `horizontal-push`, `vertical-push`, `horizontal-pull`, `vertical-pull`, `biceps`, `triceps`, `core` |
| `location` | `gym` (bare treningssenter) eller `both` (gym og hjemme, kroppsvekt) |
| `bodyweight` | `true` hvis belastningen er kroppsvekt (vekt = `null` i loggen) |
| `primaryMuscles` / `secondaryMuscles` | Muskelgrupper med kildens engelske navn som stabile nøkler. Norske navn står i `muscleNamesNo` øverst i filen |
| `sourceEquipment` / `level` | Utstyr og nivå slik kilden oppgir dem |

Hjemmeøvelser kan bruke en stang, kanten på et solid bord, en stol, en benk eller et trinn (R5), for eksempel pullups og
omvendt roing. Øvelser med flasker er merket som kroppsvekt (`bodyweight: true`), så vekten loggføres ikke.

## Kjente hull hjemme

Ingen. Alle 11 mønstrene har minst to hjemmeøvelser. `knownHomeGaps` i `exercises.json` er tom, og testen i Story 2.1 skal feile hvis et nytt hull oppstår.

## Ikke gjort ennå

- Zod-skjema og Vitest-dekningstest (krever prosjektskjelettet fra Story 1.1).
- «Enkelt utstyr hjemme» fra UX er ikke et eget sted i biblioteket ennå. Merkingen er `gym` eller `both`.
