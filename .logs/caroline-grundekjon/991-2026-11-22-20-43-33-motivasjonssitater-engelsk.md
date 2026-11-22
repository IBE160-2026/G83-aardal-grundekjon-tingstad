# Motivasjonssitater på engelsk

## 2026-11-22 kl. 20:43 — Caroline Grundekjøn

### Oppgave
Lage 30 inspirerende treningssitater til den faste lista som vises i `popup-done` etter en økt. Brukeren ville ha dem på engelsk og ba om at bokmålskravet ble fjernet.

### Plan
- Fant kravet for sitater i epics.md (FR17, UX-DR21, AC i Story 3) og EXPERIENCE.md.
- Skrev 30 sitater, oppdaterte kravet fra bokmål til engelsk og committet på branchen brukeren valgte (docs/story-1.7-glemt-passord).

**KI-forslag rettet (kriterium 1):** Claude leverte først de 30 sitatene på bokmål, fordi epics.md krevde «short bokmål lines». Brukeren avviste dette og ville ha engelsk, og ba om at språkkravet ble fjernet fra dokumentasjonen.

### Resultat
- Commit ee8b013: UX-DR21 og AC for sitat i `.docs/planning-artifacts/epics.md` sier nå «English lines». Teksttabellen (eksempel «Strong today, stronger tomorrow.»), avsnittet «Motivasjonssitat» og B3 i `EXPERIENCE.md` er oppdatert, med en merknad om at engelsk er et bevisst valg.
- PRD og DESIGN.md sier ikke noe om språk og er uendret. `.memlog.md` er ikke endret, fordi den er historikk.
- Lista som ble levert:
  1. Sweat is fat crying.
  2. Strong today, stronger tomorrow.
  3. Lift. Sweat. Repeat.
  4. When you feel like quitting, remember why you started.
  5. The body achieves what the mind believes.
  6. Good things come to those who sweat.
  7. The only bad workout is the one you didn't do.
  8. A little every time adds up to a lot.
  9. You'll never regret a workout.
  10. It's not easy, but it's worth it.
  11. Small steps are still steps.
  12. Today is a good day to get stronger.
  13. Compete with who you were yesterday.
  14. No shortcuts, just miles.
  15. Progress, not perfection.
  16. What feels heavy today is your warm-up tomorrow.
  17. Motivation gets you started. Habit keeps you going.
  18. You're stronger than you think.
  19. Every rep counts.
  20. Tough now, proud later.
  21. One session at a time.
  22. You decide when you're done.
  23. Slow progress is still progress.
  24. Today's sweat is tomorrow's strength.
  25. Your body will thank you for this.
  26. Don't wait for motivation. Just start.
  27. Rest is part of training too.
  28. You showed up. That's half the job.
  29. Better than yesterday, that's the goal.
  30. Strong isn't something you are, it's something you become.

### Åpne punkter
- Legg sitatlista inn i koden når popup-done-storyen i Epic 3 bygges.
- Vurder å bytte ut nr. 1 «Sweat is fat crying» (handler om fett) og nr. 14 «No shortcuts, just miles» (passer bare for løping, men vises også etter styrkeøkter).
