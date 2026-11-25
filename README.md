# G83 — Flex PT

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Medlemmer

- Knut Aardal
- Caroline Boman Grundekjøn
- Emilie Tingstad

## API-nøkler

Appen kan kjøres lokalt uten API-nøkler. To eksterne tjenester kan kreve nøkkel: språkmodellen bak coachen (Claude fra Anthropic) og e-posttjenesten som sender lenker for glemt passord (Resend). Begge er av som standard.

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

### E-post for glemt passord

E-posten styres av `MAIL_MODE`:

| Modus | Hva skjer med lenken | Nøkkel |
|---|---|---|
| `console` (standard) | Lenken skrives i serverloggen, og ingen e-post sendes | Ingen |
| `live` | Lenken sendes på e-post via Resend | `RESEND_API_KEY` og `MAIL_FROM` |
| `memory` | Lenken legges i en innboks i minnet (brukes av testene) | Ingen |

Lokalt finner du lenken i terminalen der appen kjører, eller med `docker compose logs app`. Uten et verifisert domene sender Resend bare til e-postadressen som eier Resend-kontoen.

`.env` er ignorert av git. Nøkler skal aldri committes.
