# G83 — Blind sensur

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Medlemmer

- Knut Aardal
- Caroline Boman Grundekjøn
- Emilie Tingstad

## API-nøkler

Appen kan kjøres lokalt uten API-nøkler. Bare én ekstern tjeneste kan kreve nøkkel: språkmodellen bak coachen (Claude fra Anthropic). Den er av som standard.

### Coachen

Coachen har to moduser, styrt av miljøvariabelen `COACH_MODE`:

| Modus | Hva coachen gjør | Nøkkel |
|---|---|---|
| `demo` (standard) | Svarer med innspilte svar på eksempelmeldingene | Ingen |
| `live` | Kaller Claude via det offisielle Anthropic SDK-et | `ANTHROPIC_API_KEY` |

Demobrukere («Prøv demo») bruker alltid demo-modus, uansett `COACH_MODE`.

Verken brukere eller sensor logger inn hos Anthropic. Det er serveren som kaller Claude med nøkkelen; brukeren logger bare inn i appen.

#### Slik tester du den ekte coachen lokalt

1. Lag en konto på [Claude Console](https://platform.claude.com) og kjøp kreditt. Et claude.ai-abonnement (Pro/Max) dekker ikke API-bruk.
2. Lag en API-nøkkel under **API Keys**. Sett gjerne et utgiftstak for kontoen.
3. Kopier `.env.example` til `.env` og fyll inn:

   ```
   COACH_MODE=live
   ANTHROPIC_API_KEY=<din nøkkel>
   ```

4. Start appen på nytt.

Modell-id-en er en konfigurasjonsverdi (standard `claude-haiku-5-5`). Hver bruker kan sende inntil 20 coachmeldinger per døgn (norsk tid), slik at forbruket holdes nede.

### E-post

Versjon 1 sender ingen e-post. «Glemt passord» er flyttet til versjon 2, fordi det krever et verifisert avsenderdomene for e-post (se PRD-en, kapittel 6).

`.env` er ignorert av git. Nøkler skal aldri committes.
