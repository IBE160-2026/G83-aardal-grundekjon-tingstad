# Prosjektnavn flexpt

## 2026-11-25 kl. 20:26 — Knut Aardal

### Oppgave
Avklare om oppgaven bruker navnet «Blind sensur» eller «flexpt», og om det er trygt å bytte til «Flex PT»/flexpt. Deretter bytte prosjektnavnet i BMAD-konfigen.

### Plan
- Søke i sensorveiledningen og repoet etter begge navnene.
- Bytte `project_name` i BMAD-konfigen. README-overskriften avklares først med foreleser.

### Resultat
- Sensorveiledningen (`.docs/sensorveiledning-del1.md`) nevner ingen av navnene.
- «G83 — Blind sensur» i `README.md` kom med første commit i repoet (`17e1ef7`, Bård Pettersen, 2026-09-07). Navnet er altså satt av emnet og ikke av gruppa. README er ikke endret.
- Claude foreslo å bytte navnet via branch og PR. Det gikk ikke, fordi `_bmad/` står i `.gitignore`, så konfigen er lokal for hvert medlem. Byttet ble gjort lokalt i stedet.
- `project_name` er endret fra `blind_sensur` til `flexpt` i `_bmad/config.toml`, `_bmad/bmm/config.yaml`, `_bmad/cis/config.yaml` og `_bmad/core/config.yaml`. Endringen gjelder bare Knuts maskin.
- Issue fra 2026-10-31 om `project_name` er lukket.

### Åpne punkter
- Spør foreleser om README-overskriften «G83 — Blind sensur» kan endres til «G83 — Flex PT».
- Caroline og Emilie må bytte `project_name` til `flexpt` i sin egen lokale `_bmad/`-konfig.
