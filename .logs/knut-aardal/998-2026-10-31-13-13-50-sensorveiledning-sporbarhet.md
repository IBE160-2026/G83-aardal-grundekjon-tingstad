# Sensorveiledning og sporbarhet

## 2026-10-31 kl. 13:13 — Knut Aardal

### Oppgave
Knut kjørte `bmad help` og fikk anbefalt `bmad-prd` som neste steg. Deretter spurte Knut hvordan gruppen skal sørge for at kravene i sensorveiledningen (del 1, applikasjon og prosess, 70 %) blir tatt hensyn til i resten av prosjektet. Knut la PDF-en i `.docs/`.

### Plan
- Gjøre PDF-en lesbar for agentene som en Markdown-avskrift.
- Dele kriteriene i produktkrav (kriterium 2–5), som skal inn i PRD/UX/arkitektur/stories, og prosesskrav (kriterium 1, 6 og 7), som skal inn i arbeidsregler, git-flyt og sesjonslogg.
- Lage en levende sporbarhetsmatrise med kontrollpunkter per BMAD-fase.
- Legge en regel i `CLAUDE.md` slik at fremtidige økter jobber mot kriteriene.

### Resultat
- `.docs/sensorveiledning-del1.md`: fullstendig Markdown-avskrift av PDF-en. Den dobbelte «1.» i sensors fremgangsmåte er nummerert om til 1–10.
- `.docs/sensorveiledning-sporbarhet.md`: tabell A med produktkrav, tabell B med prosesskrav (status og bevis), en sjekkliste over varseltegn, og kontrollpunkter per fase (PRD, UX/arkitektur, stories, per story, per epic, før innlevering).
- `CLAUDE.md`: ny seksjon «Sensorveiledning» med regler for planlegging, implementering (branch og PR per story, story-ID, tester, ingen hemmeligheter) og logging av avviste eller rettede KI-forslag.
- Loggcommitene ble pushet til `main` (`921f0bc`).
- PDF-en, de to nye filene og endringen i `CLAUDE.md` er committet på branchen `sensorveiledning` som `fe48e0f`, med en utfyllende commit-melding. Branchen er pushet, og PR [#4](https://github.com/IBE160-2026/G83-aardal-grundekjon-tingstad/pull/4) mot `main` er opprettet. Den venter på gjennomgang fra gruppa.

### Åpne punkter
- Kjør `bmad-prd` med briefen, lærertilbakemeldingen og `.docs/sensorveiledning-sporbarhet.md` (tabell A) som input. PRD-en bør ha en seksjon som heter «Avvik fra brief».
- Bestem gruppens git-arbeidsflyt (branch og PR per story, bruk av GitHub Issues) og bli enige om den i gruppa.
- `project_knowledge` i BMAD-konfig peker på `docs/`, som ikke finnes. Vurder å peke den på `.docs/` eller opprette mappa.
