---
title: 'Story 1.3: Choose light, dark or system theme'
type: 'feature'
created: '2026-11-25'
status: 'done'
baseline_commit: '221331d8ee537c27a850d5f7025a767409ccc89d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The CSS already supports light, dark and system themes through `data-theme` on `<html>`, but nothing sets the attribute. The user cannot choose a theme, and the Story 1.3 ACs (theme picker, no flash, survives logout, axe in both themes, reduced motion) are unmet.

**Approach:** Add «Utseende» on Profil: a native radio group Lys / Mørk / Følg system styled as `effort-card-selected`. A Zod-validated Server Action stores the choice in a device cookie, and the root layout reads it on the server to set `data-theme` (AD-14). Add axe checks in Playwright for login and Profil in light and dark.

## Boundaries & Constraints

**Always:** The theme code lives in `features/profile` (spine: "profile, theme, running goal") and is exported only through its `api.ts`. The cookie is read on the server in the root layout: `light` → `data-theme="light"`, `dark` → `data-theme="dark"`, anything else or no cookie → no attribute (system). The Server Action validates input with Zod and returns `ActionResult`. The picker updates `<html>` at once on the client (optimistic) so the switch is immediate. It uses tokens only, a 3 px focus ring on the focused card, selected = filled `primary` + ✓ (not colour alone), tap height ≥ 44 px, and works at 320 px and 200 % text. No CSS transition on theme or selection change.

**Never:** Do not store the theme in the database or on the user. Do not clear the cookie on logout. Do not add `next-themes`, an inline pre-hydration script or `localStorage`. Do not put a theme picker on the login screen. Do not use other Profil content from the mock (profile summary, Rediger profil, Slett konto): it belongs to 1.4, 1.5 and 2.6.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Choose Mørk | radio «Mørk» | cookie `theme=dark` (1 year, path `/`, `SameSite=Lax`); `<html data-theme="dark">` at once and after reload | N/A |
| Choose Lys | radio «Lys» | cookie `theme=light`; `data-theme="light"` even when the OS is dark | N/A |
| Choose Følg system | radio «Følg system» | cookie deleted; no `data-theme`; the page follows the OS colour scheme | N/A |
| No / unknown cookie | none, or `theme=blue` | no attribute; «Følg system» checked | N/A |
| Invalid action input | `"blue"` posted to the action | cookie unchanged | `{ ok: false, code: "invalid" }`, the picker reverts to the server value |
| Logout and login | `theme=dark`, then Logg ut | login screen and the app after login are still dark | N/A |
| Reduced motion | `prefers-reduced-motion: reduce` | theme switch with no transition | N/A |

</frozen-after-approval>

## Code Map

- `src/app/globals.css` -- already has `@custom-variant dark` on `data-theme` + media fallback and dark tokens in two identical blocks; reuse it, do not duplicate tokens
- `src/app/layout.tsx` -- root `<html lang="nb">`; add the attribute from the profile slice
- `src/app/(app)/profil/page.tsx` -- heading, spacer, `LogoutButton`; put «Utseende» between the heading and the spacer
- `src/features/profile/api.ts` -- empty public surface; owner of theme per spine l.268
- `src/features/account/actions.ts` -- pattern for Zod + `ActionResult` actions (`fail`, `ok` from `src/shared/lib/result.ts`)
- `src/shared/ui/button.tsx` -- token-class pattern; `src/shared/ui/` is where a reusable `choice-card` belongs
- `tests/integration/auth.test.ts` l.25–57 -- how `next/headers` / `next/cache` are mocked with a cookie jar
- `tests/e2e/auth.spec.ts` -- `register`, `logIn`, `tabBar` helpers and the 320 px / 200 % checks to reuse
- `playwright.config.ts` -- Pixel 7 project, production build on port 3100
- UX: `DESIGN.md` l.267–280, 422 (effort-card-selected, also for Utseende); `mockups/key-profil.html` l.110, 127 (three cards in a row, ✓ badge)

## Tasks & Acceptance

**Execution:**
- [x] `src/features/profile/theme.ts` -- `Theme = "light"|"dark"|"system"`, `THEME_COOKIE = "theme"`, pure `parseTheme(value?: string): Theme`, Zod `themeSchema`, `getTheme()` (server, reads `cookies()`) -- single source of truth
- [x] `src/features/profile/actions.ts` -- `setThemeAction(theme: unknown): Promise<ActionResult<Theme>>`: Zod-validates, sets or deletes the cookie; no session needed (device setting, not user data)
- [x] `src/features/profile/components/theme-picker.tsx` -- client; `<fieldset>` + `<legend>Utseende</legend>`, three visually hidden native radios inside card labels; `useOptimistic` + `startTransition`; on change sets `document.documentElement` `data-theme` (or removes it) then calls the action; reverts on `ok: false`
- [x] `src/shared/ui/choice-card.tsx` -- radio card: label card with selected style (`bg-primary text-on-primary` + ✓ circle), `has-[:focus-visible]` focus ring, ≥ 44 px
- [x] `src/features/profile/api.ts` -- export `getTheme`, `ThemePicker`, `setThemeAction`, type `Theme`
- [x] `src/app/layout.tsx` -- async, `data-theme={theme === "system" ? undefined : theme}`
- [x] `src/app/(app)/profil/page.tsx` -- render `ThemePicker` with the server value
- [x] `tests/integration/theme.test.ts` -- `parseTheme` (light, dark, system, missing, junk, case) and `setThemeAction` with a mocked cookie jar: sets, deletes, rejects junk unchanged
- [x] `package.json` -- devDependency `@axe-core/playwright@4.14.1`
- [x] `tests/e2e/theme.spec.ts` -- the matrix rows end-to-end: immediate switch and reload with no flash (attribute present in the server HTML), radio group by role and keyboard arrows, system follows `emulateMedia({ colorScheme })`, survives logout and login, reduced motion → computed `transition-duration` `0s`; axe (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) on `/logg-inn` and `/profil` in light and dark
- [x] `.docs/sensorveiledning-sporbarhet.md` -- update theme / NFR8 rows

**Acceptance Criteria:**
- Given Profil, when a screen reader reaches «Utseende», then it announces a radio group with three options and the checked one, and arrow keys change the choice.
- Given the repo, when I run `lint`, `typecheck`, `format:check`, `test` and `test:e2e` (compose DB up), then all pass with zero axe violations in both themes.

## Implementation Notes

- `getTheme()` lives in `src/features/profile/get-theme.ts` (`server-only`), not in `theme.ts`, so the client picker can import the pure `theme.ts` without pulling in `next/headers`. `theme.ts` also exports `themeAttribute()`, used by the layout and the picker.
- `ChoiceCard` covers the whole card with the native radio (`opacity-0`, `absolute inset-0`) instead of `sr-only`: with `sr-only` the label intercepted Playwright's click on the input. A tap anywhere on the card hits the radio, and the label shows the focus ring through `has-[:focus-visible]`.
- e2e waits for the `theme` cookie before reloading or logging out. A reload in the few milliseconds before the action has answered shows the old theme, because the cookie is not set yet. This is accepted: the next reload is correct.
- Matrix row "Invalid action input": the rejection and the unchanged cookie are covered in `tests/integration/theme.test.ts`. The picker's revert on `ok: false` has no test, because the UI can only send valid values.
- Vitest: 103 passed. Playwright: 24 passed (theme spec 27/27 with `--repeat-each 3`). Axe found no violations on `/logg-inn` and `/profil` in light or dark.

## Spec Change Log

## Review Triage Log

Pass 1 (2026-11-25): Blind Hunter (BH), Edge Case Hunter (EC), Verification Gap (VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| EC1 / BH2 / VG-other | A thrown action (network, 500) leaves `<html>` on the new theme while the radio reverts | medium | `choose()` reverted only on a returned `ok: false`; a rejected promise skipped `applyTheme(theme)` | patch: try/catch reverts on both |
| EC3 / BH1 | A failed save snaps back silently; `result.message` is never shown | medium | `choose()` dropped the message; the UX says errors are shown in plain text | patch: `role="alert"` under the cards |
| VG1 / BH3 | The picker's rollback has no test | medium | No test makes the action fail; removing the revert stayed green | patch: e2e aborts the action POST and checks radio, attribute, cookie and message |
| EC4 / BH4 | The cookie has no `httpOnly` / `secure` | low | Only the server reads the cookie, so `httpOnly` is a one-word fix; `secure` would break the examiner's `http://localhost:3000` in browsers that do not treat localhost as secure, and the theme is not sensitive | patch (`httpOnly` only) |
| BH10 | Axe skips `/registrer` | low | Same form patterns as login; one extra `scan()` | patch |
| BH8 | `api.ts` exports the unused `setThemeAction` and mixes server-only and client exports | low | Nothing outside the slice calls the action (deleted). The mix matches `account/api.ts`, and no client component imports a slice barrel | patch (delete export); rest reject |
| BH6 | Traceability row "Konsistent visuelt uttrykk" lacks `choice-card` | low | Row 27 listed only 1.1/1.2 components | patch |
| EC2 | Two quick choices: an earlier failure could revert over a later success | low | Needs a failed save to overtake a newer successful one; the fix adds a sequence ref | reject |
| EC5 | `baseURL` may be undefined in the axe test | false | `playwright.config.ts` always sets `use.baseURL` | reject |
| EC6 / BH5 | The reduced-motion test passes vacuously | false | It fails as soon as a plain (non-`motion-safe`) transition is added to `body` or the cards, which is the regression it guards | reject |
| EC-claim | `getTheme` is not in `theme.ts` as the task says | false | Recorded with its reason in Implementation Notes | reject |
| BH7 | The diff lacks `package-lock.json` and the spec | false | Left out of the review diff on purpose; both are committed with the story | reject |
| BH9 | Reading the cookie makes public pages dynamic | false | `/logg-inn` and `/registrer` were already dynamic: they read the session to redirect signed-in users | reject |
| BH11 | Sprint status still `in-progress` | false | Step 5 moves it to `review` | reject |

## Design Notes

Device cookie instead of a `profile` column: the spine (AD-14) chose this so the server knows the theme on first paint without a DB read, and so it survives logout. The action needs no session because a theme cookie is not user data, and the login screen also gets the theme. Native radios give radio-group semantics and arrow-key handling for free; ARIA `role="radio"` divs (as in the mock) would need custom key handling. The optimistic DOM write makes the switch immediate. The action's cookie write then refreshes the route, and the server-rendered attribute takes over with the same value.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm run format:check` -- clean
- `docker compose up -d db && npm run db:migrate && npm test` -- theme tests pass
- `npm run test:e2e` -- theme, auth and smoke specs pass, no axe violations
- `git status --short` -- no `.env`, build output or test reports
