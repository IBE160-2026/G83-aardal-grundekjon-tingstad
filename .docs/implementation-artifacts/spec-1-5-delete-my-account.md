---
title: 'Story 1.5: Delete my account'
type: 'feature'
created: '2026-11-26'
status: 'in-progress'
baseline_commit: '2f83d16422673f05716af52978f07bcea7f08ca9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A user cannot delete their account, so their health-related data is kept forever (FR16). Profil has no «Slett konto», there is no confirmation dialog or `button-destructive`, and nothing proves that deleting a user leaves no rows behind.

**Approach:** «Slett konto» (`button-destructive`) at the bottom of Profil opens a modal confirmation dialog («Avbryt» / «Slett»). «Slett» runs an `account` Server Action that takes the user id from `shared/auth`, deletes the `user` row (everything the user owns goes by `ON DELETE CASCADE`), clears the session cookie and redirects to `/logg-inn`. An integration test proves no row remains and fails when a later table referencing `user` is not covered.

## Boundaries & Constraints

**Always:** The action takes no user id from the request; it reads it with `getUserId()` from `shared/auth/session`. Deletion is one `DELETE FROM "user" WHERE id = $1` in the `account` slice; the cookie is then cleared with `auth.api.signOut` (which tolerates the already-deleted session). Dialog copy is EXPERIENCE.md's: title «Slett konto», text «Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid.», buttons «Avbryt» (`button-secondary`) and «Slett» (`button-destructive`). Dialog per UX-DR13: traps focus, focuses «Avbryt» on open, returns focus to «Slett konto» on close, Escape cancels, never closes by itself (no backdrop-click close). Scrim = `background` at 60 %, panel `surface`, `rounded-xl`, padding 24 px. `button-destructive` = surface bg, `error` text and 2 px border, never filled red. Demo users may delete their account as well. The theme cookie stays (device setting, not account data).

**Never:** No Better Auth `deleteUser` endpoint (it needs a password or a session under 24 h old; leave `user.deleteUser` disabled). No per-table deletes in application code. No schema change or migration. No password prompt in the dialog.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Delete | signed in, has session, account and profile rows; press «Slett» | no `user`/`session`/`account`/`profile` row for the id; cookie cleared; redirect `/logg-inn` | N/A |
| Log in afterwards | old email + password | not signed in | general wrong-login message |
| Cancel | «Avbryt» or Escape | dialog closes, focus on «Slett konto», nothing deleted | N/A |
| Double press | «Slett» twice quickly, or the action re-posted without a session | one deletion, lands on `/logg-inn`, no error page | no session → redirect `/logg-inn` |
| Other users | user B exists | B's rows untouched | N/A |
| DB failure | `DELETE` throws | nothing deleted, still signed in | `{ ok: false, code: "unexpected" }`, message shown in the dialog |

## Decisions

- **Spec size (2026-11-26, human):** keep the full spec (~2000 tokens) as one story.

</frozen-after-approval>

## Code Map

- `src/features/account/actions.ts` L92-102 -- `logoutAction` pattern (signOut with `isAPIError` tolerance, `revalidatePath("/", "layout")`, `redirect(LOGIN_PATH)`); add `deleteAccountAction` here
- `src/features/account/demo.ts` L54-59 -- `deleteDemoUser`: the same single-row delete shape
- `src/features/account/api.ts` -- export the action and the new `DeleteAccountButton`
- `src/features/account/components/logout-button.tsx` -- `useActionState` + `Button pending` pattern
- `src/features/account/schemas.ts` L15 -- `MESSAGES.unexpected`
- `src/shared/auth/session.ts` -- `getUserId`, `LOGIN_PATH`; do not change
- `src/shared/ui/button.tsx` -- add `destructive` variant (same size and shape as `secondary`)
- `src/shared/ui/` -- new `dialog.tsx` (native `<dialog>` + `showModal()`), reusable by popup-done in Epic 3
- `src/app/(app)/profil/page.tsx` -- add the button after `<LogoutButton />`
- Schema: `session`, `account` (`auth.ts` L36, L49) and `profile` (`profile.ts` L25) cascade already; `verification` is not user-owned
- `tests/integration/demo.test.ts` L21-80 -- `DATABASE_URL` skip, cookie-jar `next/headers` mock, `RedirectError`, `redirectOf`; copy for the new test
- `tests/e2e/auth.spec.ts` L11-29 -- `register`, `logIn`, `scrollsSideways`; `tests/e2e/theme.spec.ts` L158-176 -- axe `scan()` with theme cookie
- UX: `mockups/key-profil.html` L75, L95, L99, L130 (scrim, split buttons, `.dlg`, delete dialog); `DESIGN.md` L104-110, L403

## Tasks & Acceptance

**Execution:**
- [ ] `src/shared/ui/button.tsx` -- `destructive` variant -- DESIGN.md button-destructive
- [ ] `src/shared/ui/dialog.tsx` -- client `Dialog` (open, onClose, title, description, children): `showModal()`/`close()`, `aria-labelledby`/`aria-describedby`, Tab/Shift+Tab wrap inside, `cancel` event → `onClose`, focus first focusable on open, `::backdrop` scrim -- shared modal pattern (UX-DR13)
- [ ] `src/features/account/actions.ts` -- `deleteAccountAction(): Promise<ActionResult<null>>`: no user → redirect login; delete row (catch → `fail("unexpected")`); signOut (ignore `APIError`); revalidate; redirect login
- [ ] `src/features/account/components/delete-account-button.tsx` + `api.ts` -- trigger + dialog; «Slett» form via `useActionState`, pending → `aria-disabled`; error under the text in the dialog (`role="alert"`); buttons wrap at 320 px / 200 %
- [ ] `src/app/(app)/profil/page.tsx` -- render it last
- [ ] `tests/integration/account-deletion.test.ts` -- matrix rows (delete, log in afterwards, double press, other user, DB failure via `vi.spyOn` on the db) + a guard querying `pg_constraint` for every FK to `"user"`: each is `ON DELETE CASCADE` and its table is in the test's covered list
- [ ] `tests/e2e/account-deletion.spec.ts` -- dialog text and buttons; focus on «Avbryt», Tab wraps, Escape and «Avbryt» return focus to «Slett konto»; «Slett» (double-click) lands on login and login then fails; axe with the dialog open in light and dark; 320 px no sideways scroll
- [ ] `README.md`, `.docs/sensorveiledning-sporbarhet.md` -- mention account deletion; update rows 20, 22, 24, 26, 29

**Acceptance Criteria:**
- Given a signed-in user on Profil, when I open the dialog and press «Slett», then I land on «Logg inn» and pressing Back does not show Profil.
- Given the repo, when I run `lint`, `typecheck`, `format:check`, `test` and `test:e2e`, then all pass with zero axe violations.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Direct delete instead of Better Auth's `/delete-user`: that endpoint requires the password or a session younger than `freshAge` (1 day), and the UX has neither. Deleting the `user` row is atomic and the cascade covers every user-owned table, which is the architecture's deletion rule. `signOut` afterwards finds no session, deletes nothing and clears the cookie (`sign-out.mjs`: lookup errors are logged, `deleteSessionCookie` always runs).

The guard test keeps the "every later story extends this test" rule from depending on memory:

```ts
const fks = await db.execute(sql`select conrelid::regclass::text as table, confdeltype
  from pg_constraint where contype = 'f' and confrelid = '"user"'::regclass`);
expect(fks.map((r) => r.table).sort()).toEqual([...COVERED_TABLES].sort());
expect(fks.every((r) => r.confdeltype === "c")).toBe(true);
```

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm run format:check` -- clean
- `docker compose up -d db && npm run db:migrate && npm test` -- deletion tests pass
- `npm run test:e2e` -- deletion, auth, demo, theme and smoke specs pass
- `git status --short` -- no `.env`, build output or test reports
