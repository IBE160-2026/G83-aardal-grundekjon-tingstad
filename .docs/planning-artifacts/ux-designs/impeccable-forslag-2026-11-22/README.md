# Designforslag fra Impeccable (2026-11-22)

> **Beslutning 2026-11-22:** Gruppa avviste alle fem nye retningene (01–05) og beholder dagens design, Pulsslag, slik det står i `DESIGN.md`. Filene er beholdt som dokumentasjon av et vurdert og avvist KI-forslag.

Seks SVG-er av samme skjerm, **Uke** (startsiden), med samme innhold: persona Mari (syntetiske demodata), styrke 4 økter i uka, onsdag i uke 47, 1 av 4 økter gjort. Kun retning, ikke vedtatt. `DESIGN.md` i UX-mappa gjelder til gruppa velger noe annet.

Skjermen er en Operate-flate: navigasjon (fanelinje), økter og knapper er standard. Hver retning bidrar bare med typografi, palett, tetthet og ett signaturgrep.

| Fil | Retning | Signaturgrep | Risiko |
| --- | --- | --- | --- |
| `01-o-kart.svg` | **O-kart** (tildelt av Impeccables terning) | Uka som orienteringsløype: økter er poster i magenta, gjennomført etappe heltrukket, planlagte stiplet, hviledager som grønne felt, søndag som mål (dobbel ring). En endring fra coachen kan tegnes som omlagt løype. | Krever at brukeren kjenner o-kart for å få med seg referansen; fungerer likevel som tidslinje. |
| `02-timeplan.svg` | **Timeplan** (Impeccables eget førstevalg) | Uka som skoletimeplan: hver økttype har fast «fagfarge» (overkropp blå, underkropp oker) overalt i appen. | Det mest kjente valget; nær vanlige kalenderapper. |
| `03-kassettomslag.svg` | **Kassettomslag** (katalogutfordrer, konkurransedyktig) | Uka som mixtape: side A/B, økter som spor med spilletid, dagens økt «spilles nå». | Håndskrift kun i overskrifter (lesbarhet); nostalgi treffer ikke alle. |
| `04-grafittkonsoll.svg` | **Grafittkonsoll** (katalogutfordrer, konkurransedyktig) | Mørk arbeidsflate med hårlinjeskiller, monospace-tall og status som fargekode. | Kjølig mot den heiende tonen; lyst tema må utformes separat. |
| `05-kategoristandard.svg` | **Kategoristandard** (trygg utgang) | Vanlig treningsapp: hvite kort, fremdriftsring, dagvelger, én blå aksent. | Ikke til å skille fra konkurrentene. |
| `06-pulsslag-dagens.svg` | **Pulsslag** (dagens design, referanse) | Nåværende `DESIGN.md` tegnet i samme ramme til sammenligning. | Krem og terrakotta er ett av de vanligste KI-genererte uttrykkene. |

Avviste katalogutfordrere og hva vi tok med oss:

- **Stjerneatlas:** postens størrelse rangerer (dagens post er størst).
- **Emisjonslinjer:** status vises med linjeform (heltrukket/stiplet), ikke bare farge.
- **Figurkatalog og spaltesats:** ikke brukt.

Seed-referanse: `seed:a29c213b506b0c6c`. SVG-ene er generert av et skript. Fonter faller tilbake til systemfonter hvis de ikke er installert.
