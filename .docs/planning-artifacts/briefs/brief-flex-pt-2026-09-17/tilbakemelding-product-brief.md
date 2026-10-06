# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G83 – G83-aardal-grundekjon-tingstad |
| **Product brief** | `.docs/planning-artifacts/briefs/brief-flex-pt-2026-09-17/brief.md` (commit `2426f17`) |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

Briefen er skrevet på engelsk; tilbakemeldingen er på norsk.

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

**Det som er bra:**

1. Problemet er godt beskrevet med konkrete situasjoner: et program med fire faste økter som ikke virker når brukeren bare rekker to, og en reise eller lav energi som gjør at hele planen må lages på nytt. Primærbrukeren (en treningsinteressert person med travel og skiftende hverdag) er tydelig.
2. Kjerneideen er presis: samtalen med coachen skal gi en *synlig endring i treningsplanen*, ikke bare generelle råd. Eksempelet med to helkroppsøkter i stedet for en plan med flere separate økter gjør dette konkret.
3. Dere har selv satt Strava, Apple Health, Garmin, kalenderintegrasjon, ernæring og syklus-/graviditetsprogram utenfor v1, og bedt om tilbakemelding på det. Svaret er ja: det er riktig å holde alt dette utenfor.

**De viktigste endringene:**

1. Suksesskriteriene bygger på en pilot med ti brukere over fire uker. Det er vanskelig å gjennomføre og dokumentere innenfor emnet, og det kan ikke bli automatiske tester. Legg til funksjonelle kriterier som kan testes, og gjør piloten til en mindre brukertest.
2. Briefen sier ikke hvordan treningsplanen lages og endres. Bestem hva som er regler i koden (f.eks. maks antall økter per uke, hviledag etter tung økt, progresjon i prosent) og hva språkmodellen gjør. Ellers kan dere ikke kontrollere om planene er forsvarlige.
3. Avklar språkmodell, kostnad og hvordan sensor kan kjøre appen uten deres nøkkel. Coach-dialogen er kjernen, så appen må ha en plan for demo- eller testmodus.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Vanskelig**

**Sammenlignbart med:** Mer krevende enn 7) Kurs-FAQ-chatbot (middels). Flex PT har en chatbot med hukommelse på tvers av samtaler, men i tillegg skal samtalen endre en strukturert treningsplan, og planen skal genereres og progresjoneres ut fra logget aktivitet. Fem kjernefunksjoner som henger tett sammen, faglige krav til treningsplanene og innlogging med persistent profil gjør at v1 slik den er beskrevet, ligger i nedre del av «vanskelig».

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Høy | Plangenerering ut fra mål, erfaring, tilgjengelige dager og utstyr, progresjon basert på loggede økter, og omplanlegging når økter faller bort. Treningsfaglige regler er ikke beskrevet. |
| Datamodell – antall entiteter og relasjoner mellom dem | Middels | Bruker, profil, mål, utstyr, treningsplan, økt, øvelse, logg, samtale og «hukommelse». Planen må kunne versjoneres når coachen endrer den. |
| Brukere, roller og innlogging | Middels | Innlogging med persistent profil og strengt skille mellom brukeres data. Én rolle. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Høy | Coachen skal tolke fritekst, huske kontekst, bruke valgt kommunikasjonsstil og foreslå konkrete, strukturerte endringer i planen. Det krever strukturert output og validering av forslagene. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Middels | Språkmodell-API. Andre integrasjoner er riktig holdt utenfor v1. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Lav | Ikke relevant utover at brukere ikke skal se hverandres data. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Lav | Ikke i v1. |
| Sikkerhet og personvern | Middels | Treningsdata, energinivå og eventuelle skader kan grense mot helseopplysninger, og samtalene sendes til en ekstern språkmodell. Briefen nevner dette, men uten konkrete valg. |

**Hva vanskelighetsgraden betyr for dere:**

- _Vanskelig:_ Et vanskelig prosjekt gir større mulighet for toppkarakter, men også større risiko. Definer en minimal versjon som sikkert kan bli ferdig, og legg resten i tydelige trinn etterpå. For Flex PT kan det være: profil → regelbasert ukeplan → logg økt → coachen foreslår én endring som brukeren godkjenner. Hukommelse på tvers av samtaler og valgbar coachstil kan komme i neste trinn.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | Risiko | Fem kjernefunksjoner som avhenger av hverandre, og ingen PRD ennå. Tre personer gjør det mulig, men bare med en tydelig minimal versjon. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | Risiko | Brukerreisen er godt beskrevet, men hvordan planen genereres og endres er ikke det. Det er det største hullet før PRD. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | En webapp med innlogging, database og chat mot et LLM-API er godt dokumentert. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | Stor risiko | Hvis språkmodellen lager planene fritt, kan dere ikke systematisk avgjøre om de er realistiske og trygge. Legg faste regler i koden som validerer alle planer og endringer, og lag eksempelprofiler med forventet plan. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | Risiko | Innlogging, dataseparasjon, logging og regelvalidering av planer kan testes godt. Coachens tolkning må testes med faste scenarioer (f.eks. «jeg er bortreist torsdag–søndag» skal gi en plan uten økter disse dagene). |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Stor risiko | Ikke omtalt. Uten nøkkel virker verken plan eller coach. Planlegg en demomodus med testbruker, ferdig plan og lagrede coachsvar. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Risiko | Samtaler med lang kontekst og hukommelse gir mange tokens. Velg modell, anslå kostnad og planlegg testmodus. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart med justert omfang.** Se forslagene under.

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Lag treningsplanen regelbasert i v1 (maler for f.eks. 2, 3 og 4 økter per uke, valgt ut fra profilen), og la coachen foreslå endringer som valideres mot reglene og som brukeren må godkjenne.
2. Avgrens til én eller to treningstyper i v1 (f.eks. styrke og løping) og ett eller to mål. Flere treningstyper og fri målsetting kan komme senere.
3. Erstatt firukers pilot med en kort brukertest med 3–5 personer, og legg til funksjonelle kriterier som kan bli automatiske tester.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Tydelig: treningsplan, logging og en coach som tilpasser planen til hverdagen. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Konkrete eksempler (halvmaraton, første pull-up, fire økter som blir to) og en tydelig beskrivelse av dagens fragmenterte løsninger. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | OK | Godt beskrevet fra brukerens side, uten teknologi. Beskriv også hvordan brukeren godkjenner eller avviser coachens forslag. |
| What Makes This Different – er vurderingen ærlig og realistisk? | Juster | Koblingen mellom samtale, historikk og plan er en god differensiator, men nevn konkrete alternativer (f.eks. eksisterende AI-treningsapper og ChatGPT) og hvorfor brukeren skal velge Flex PT. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | OK | Tydelig primærbruker, og personer som trenger medisinsk oppfølging er bevisst holdt utenfor. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Endre | Det funksjonelle minimumet i første avsnitt er godt. Pilotmålene (8 av 10, 6 av 10 aktive i 3 av 4 uker, 7 av 10 vil fortsette) kan vanskelig gjennomføres i emnet. Legg til testbare kriterier for plan, logging, coachendringer og dataseparasjon. |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | Juster | In og out er tydelig delt, men fem kjernefunksjoner er mye. Prioriter dem og angi en minimal versjon. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Integrasjoner, kalender og ernæring er tydelig plassert i 2–3-årshorisonten. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | De fem kjernefunksjonene kan bli epics direkte. Repoet har foreløpig få commits; kom i gang med PRD og lagre prompts og KI-økter. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Juster | Rikelig med funksjonalitet. Risikoen er at coachen og plangenereringen blir halvferdige. Definer en minimal versjon. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Endre | Legg til regler for planer og funksjonelle kriterier, og lag faste scenarioer for coachen med forventet endring i planen. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | OK | Tydelig bruker og brukssituasjon. Skisser ukeplanen, loggingen og hvordan en foreslått endring vises og godkjennes. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | Juster | Teknologi er ikke valgt. Skill tydelig mellom regelmotor for planer og KI-lag i arkitekturen. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Endre | Planlegg demomodus med testbruker og lagrede coachsvar, og `.env.example` for egen nøkkel. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Briefen sier at datahåndtering skal avklares før testing; gjør det nå. Nøkler i `.env` utenfor Git, og kun fiktive testbrukere i repoet. |

## 3. Neste steg for gruppen

1. Beskriv hvordan planen lages og endres: hvilke regler ligger i koden, og hva gjør språkmodellen? Lag 3–4 eksempelprofiler med forventet ukeplan.
2. Definer en minimal versjon av de fem kjernefunksjonene, og skriv om suksesskriteriene til testbare krav. Gjør piloten til en kort brukertest.
3. Velg språkmodell, planlegg demomodus og datahåndtering, og gå videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
