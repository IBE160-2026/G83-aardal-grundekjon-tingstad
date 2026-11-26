---
title: 'Story 1.5: Delete my account'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
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
- [x] `src/shared/ui/button.tsx` -- `destructive` variant -- DESIGN.md button-destructive
- [x] `src/shared/ui/dialog.tsx` -- client `Dialog` (open, onClose, title, description, children): `showModal()`/`close()`, `aria-labelledby`/`aria-describedby`, Tab/Shift+Tab wrap inside, `cancel` event → `onClose`, focus first focusable on open, `::backdrop` scrim -- shared modal pattern (UX-DR13)
- [x] `src/features/account/actions.ts` -- `deleteAccountAction(): Promise<ActionResult<null>>`: no user → redirect login; delete row (catch → `fail("unexpected")`); signOut (ignore `APIError`); revalidate; redirect login
- [x] `src/features/account/components/delete-account-button.tsx` + `api.ts` -- trigger + dialog; «Slett» form via `useActionState`, pending → `aria-disabled`; error under the text in the dialog (`role="alert"`); buttons wrap at 320 px / 200 %
- [x] `src/app/(app)/profil/page.tsx` -- render it last
- [x] `tests/integration/account-deletion.test.ts` -- matrix rows (delete, log in afterwards, double press, other user, DB failure via `vi.spyOn` on the db) + a guard querying `pg_constraint` for every FK to `"user"`: each is `ON DELETE CASCADE` and its table is in the test's covered list
- [x] `tests/e2e/account-deletion.spec.ts` -- dialog text and buttons; focus on «Avbryt», Tab wraps, Escape and «Avbryt» return focus to «Slett konto»; «Slett» (double-click) lands on login and login then fails; axe with the dialog open in light and dark; 320 px no sideways scroll
- [x] `README.md`, `.docs/sensorveiledning-sporbarhet.md` -- mention account deletion; update rows 20, 22, 24, 26, 29

**Acceptance Criteria:**
- Given a signed-in user on Profil, when I open the dialog and press «Slett», then I land on «Logg inn» and pressing Back does not show Profil.
- Given the repo, when I run `lint`, `typecheck`, `format:check`, `test` and `test:e2e`, then all pass with zero axe violations.

## Implementation Notes

- `actions.ts`: `logoutAction` and `deleteAccountAction` share a private `endSession()` (signOut, `APIError` tolerated). `deleteAccountAction` calls it also when there is no session, so a stale cookie is cleared on a re-post.
- `Dialog` restores focus to `document.activeElement` captured at open (not a ref passed in), so any opener works; the effect cleanup closes the native dialog, so unmounting while open (the redirect after «Slett») is safe.
- Integration test DB failure: `vi.spyOn(dbClient, "getDb")` returns a Proxy whose `delete().where()` rejects; Better Auth keeps its own adapter reference, so the session lookup still works.
- The guard test lists `USER_OWNED_TABLES = { session, account, profile }` and compares it to `pg_constraint` (`confdeltype = 'c'`); `verification` has no FK to `user`.
- The "message shown in the dialog" half of the DB-failure row is covered by code (`role="alert"` in `delete-account-button.tsx`) and the action's result in the integration test, not by an e2e test: a server-action DB failure cannot be injected into the production build.
- Verified locally with `DATABASE_URL=postgres://flexpt:flexpt@localhost:5432/flexpt` (no `.env` in this checkout): lint, typecheck, format:check clean; Vitest 132/132; Playwright 41/41.

## Spec Change Log

## Review Triage Log

Pass 1 (2026-11-26): Blind Hunter (BH), Edge Case Hunter (EC), Verification Gap (VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| EC1 / EC-claim1 / BH11 | `Dialog` syncs `open` only from `cancel`; Chrome closes a modal natively on a repeated Escape without `cancel`, leaving `open` true so «Slett konto» cannot reopen it | medium | `onCancel` + `preventDefault` was the only handler; no `close` listener | patch: drive `onClose` from the native `close` event |
| VG1 / BH2 | E2E "Back does not show Profil" can pass before Back renders | medium | Only a negative `toHaveCount(0)` after `goBack()` | patch: wait for load, URL `/logg-inn` and «Logg inn» first |
| EC9 / EC-claim2 / BH1 | Cascade guard checks only direct FKs to `user`; a nested table (sets → log → plan) with RESTRICT would block deletion unseen | medium | `confrelid = '"user"'` only | patch: recursive `pg_constraint` walk requiring `confdeltype = 'c'` |
| BH5 | Demo users may delete (spec Always) but no test | low | No test calls `deleteAccountAction` for a demo user | patch: integration test |
| VG-other2 / BH6 | Theme cookie survival promised in spec and README, untested | low | Jar never sets `theme` | patch: integration test |
| EC10 / BH-small b | `console.error` spy never restored | low | `mockImplementationOnce` without restore | patch |
| BH-small c | Test hard-codes the unexpected message | low | String literal instead of `MESSAGES.unexpected` | patch |
| BH-small a | `?? null` in the `useActionState` wrapper is dead | low | Action returns `ActionResult` or redirects | patch |
| BH8 | Traceability rows «Konsistent visuelt uttrykk» and «Tilpasning til skjermstørrelser» not updated | low | Rows 27 and 30 unchanged | patch |
| VG2 / BH-last | Dialog error message (`role="alert"`) has no test | medium | No component-test harness; a DB failure cannot be injected into the production build | defer |
| VG-other1 / EC2 / BH3 | Old error message still shown after closing and reopening the dialog | low | `useActionState` result never reset; only after a DB failure, and the fix restructures the component | reject |
| EC3 / BH4 | «Avbryt»/Escape while «Slett» is pending closes the dialog but deletion continues | low | Needs a cancel after pressing «Slett» during a sub-second request; fix adds guards | reject |
| EC4 / EC-claim3 | DB down during `getUserId` gives an error page, not the dialog message | low | With the DB down every app page fails; the matrix row is a failing DELETE; fix adds a guard | reject |
| EC5 / BH7 | `endSession` throwing after a committed delete gives an error page | false | Better Auth `signOut` catches its own session lookup and delete errors (`sign-out.mjs`) and always clears the cookie; `APIError` is already tolerated | reject |
| EC6 | «Slett konto» does nothing without JS | low | Spec does not require no-JS; fix needs a confirmation route | reject |
| EC7 | Shift+Tab from the dialog itself can leave it | low | Only after clicking non-focusable text; outside content is inert under `showModal()` | reject |
| EC8 | Guard breaks for a table with two FKs to `user` | low | No such table planned (coach messages have one `user_id`); now uses `distinct` | reject |
| BH9 | Spec `in-review` vs sprint-status `in-progress` | false | Step 5 moves the sprint status | reject |
| BH10 | Spec Design Notes snippet names `COVERED_TABLES` | low | Fix edits this build's spec | reject |
| BH12 | `Dialog.description` should be an optional `ReactNode` for Epic 3 | low | Speculative; Epic 3 can widen it when it needs to | reject |

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
