---
review: recheck
target: ../ARCHITECTURE-SPINE.md (revised draft, 2026-11-16)
inputs: review-reconcile.md, review-rubric.md, review-currency.md, review-adversarial.md; context ../../../prd-flex-pt.md (v1.1)
date: 2026-11-16
---

# Recheck of the revised spine

**Verdict:** The revision closes most of the critical findings: slice API, session slots, one-week versions, typed plan changes, the medical swap path, PostgreSQL in the PRD, and the environments. Some high findings are only partly closed, mostly around week creation, demo state, approval and program transitions. The revision also adds a few new inconsistencies, chiefly that the dependency diagram has too few edges and that AD-7 does not fit R13. One more short pass is needed before epics.

Scope: every **critical** and **high** finding in the four reviews. Medium and low findings are not rechecked, unless a new contradiction touches them. Status: **closed** = the spine now decides it so two stories cannot diverge; **partly** = the main point is decided, but a named part is still open; **open** = not addressed.

## 1. Status per finding

### review-reconcile.md

| # | Sev | Finding | Status | Evidence / what remains |
| --- | --- | --- | --- | --- |
| C1 | crit | Cross-slice calls contradict AD-1 | closed | AD-1: `api.ts` is the only public surface, edges in the diagram, ESLint rule. (The diagram is missing edges. See N1.) |
| C2 | crit | Log link breaks when a new version is made | closed | AD-8 session slots: logs reference the slot, logged and past slots are never changed. A version covers one week (AD-7). (Ambiguity about slot contents: see N5.) |
| C3 | crit | Week generation: owner, trigger, idempotency | partly | AD-7: `ensureCurrentWeek` with a unique (program, week_start) key, no backfill. Still open: **which entry points call it**. AD-4 says "a server action called by the page", but not whether the coach, logging and the "next session" view call it too, or what they read on a Monday before it has run. See N3. |
| H1 | high | Active session / set editing data model | closed | AD-8: `in_progress` → `finished`, the server rejects changes after finish, unique set log, restore from the database. |
| H2 | high | R11 swap impossible if the message is not sent | partly | AD-11: `classifyMedical` returns a body part, then code offers the swap, "yes" makes a swap proposal. Still open: there is no split between **acute symptoms and localised pain**. One word list plus "any body part it recognises" means that "brystsmerter" (chest) matches chest exercises and gets a swap offer. EXPERIENCE says acute symptoms must not get one. |
| H3 | high | R8 marker and fixed fast-run distance | closed | AD-2: R8 reductions and the fast-run distance are stored outputs. AD-3: the fast-run distance is on the program. AD-10: reduce carries a reason. |
| H4 | high | Demo user, badge, shared demo state | partly | AD-9: demo users always get the Demo provider. AD-16: picker, badge on demo user, rerunnable seed. Still open: on the published site, examiners **share** demo users, which they can delete (FR16) or log over. There is no copy per visitor, no block on deleting a demo user, and no reset path there except rerunning the seed by hand. |
| H5 | high | Demo provider matching rule | partly | AD-9: one recording per Appendix C scenario, fixed fallback reply. Still open: the **matching method** (keywords? profile?), the UX flows "40 min i dag" / "kan ikke onsdag", and how recordings refer to sessions/slots of a freshly seeded user. |
| H6 | high | Proposal schema, diff, rule-break text owner | closed | AD-10: closed set of plan changes in the engine, the model sets no numbers, the engine returns the diff, the rule-break text comes from code. |
| H7 | high | Day exclusions scope and lifetime | closed | ER: `PLAN_WEEK ||--o{ DAY_EXCLUSION` (scoped to a week). Created through the exclude-days plan change. That they never carry over follows from the week scope, but it is not stated. |
| H8 | high | Program week counting, partial first week | partly | AD-13: week number from the first `week_start`, and a partial first week only from the start date. Still open: where the **R13 week-9 card answer** is stored, and whether the card comes back every week after week 8. |

### review-rubric.md

| # | Sev | Finding | Status | Evidence / what remains |
| --- | --- | --- | --- | --- |
| 1 | crit | Planned-session identity across versions | closed | AD-8, AD-7 (current-version pointer on the plan week). |
| 2 | high | AD-1 vs AD-3 | closed | AD-1 / AD-3 now agree (owner's `api.ts`). See N1 for missing edges. |
| 3 | high | Change-proposal contract, engine import | closed | AD-10: the engine owns the plan-change types. AD-9: the JSON schema is derived from them. |
| 4 | high | Lazy week generation vs AD-4 | partly | Same as reconcile C3. AD-4 now names the write, but the trigger is still open (N3). |
| 5 | high | "My knee hurts" under AD-9/AD-10 | partly | Path is decided (AD-11). Acute vs localised split is missing (see reconcile H2). |
| 6 | high | PostgreSQL vs PRD NFR5/§4 | closed | PRD v1.1 NFR5 (line 54) and §4 (line 83) now say PostgreSQL. |
| 7 | high | Deployment & environments | closed | AD-17 table (local/examiner, dev, published), pooler + direct URL, previews have no DB, Supabase pause noted, standalone image, one-off migrate/seed service. Region is still unset (rubric #16, medium). |
| 8 | high | Public live coach without rate limit | closed | AD-9: daily limit per non-demo user (default 20), fixed message above it, no call. |

### review-currency.md

| # | Sev | Finding | Status | Evidence / what remains |
| --- | --- | --- | --- | --- |
| F-1 | high | Supabase connection from Vercel | closed | AD-5: postgres.js, transaction pooler, prepared statements off, separate direct URL for migrations. Caveat (unverified in F-1): the direct host may be IPv6-only. If so, use the session pooler (5432) for migrations. |
| F-2 | high | `postgres:18` data directory | closed | AD-17: volume at `/var/lib/postgresql`, healthcheck, migrate/seed before the app starts. |

### review-adversarial.md

| # | Sev | Finding | Status | Evidence / what remains |
| --- | --- | --- | --- | --- |
| H1 | crit | AD-1 vs AD-3 | closed | AD-1 (`api.ts`, user id first, lint). But the seed in `shared/db` calls slices (N2), and the diagram is missing edges (N1). |
| H2 | crit | Session identity lost on new version | closed | AD-8. |
| H3 | crit | What a version spans | partly | AD-7: one week, generation creates v1. Still open: a proposal based on **last week's** current version stays "current" for that week, so the Sunday 23:50 / Monday-approve case passes the stale check and changes a past week. The rule should say "current version of the current week". |
| H4 | crit | Proposal shape defined twice | closed | AD-10, AD-9. |
| H5 | high | Medical pre-check blocks swap | partly | See reconcile H2 (no symptom vs body-part split). |
| H6 | high | Approval idempotency and transaction owner | partly | AD-7 stale check stops a second version on a double click. Still open: **one command and one transaction** for approve. Coach owns `change_proposal.status`, plan writes the version, and nothing says who sets `approved`, in what order, or what a repeated approve returns (NFR9 wants "no extra effect", not an error). |
| H7 | high | Current version / current program | partly | The current version is a pointer on the plan week (closed). There is still no rule for the **current program** (USER ‖–o{ PROGRAM). |
| H8 | high | Day exclusions scope | closed | Scoped to the week (ER). |
| H9 | high | R8 marker for progression | closed | AD-2 / AD-10, plus the logged slot is never changed (AD-8). |
| H10 | high | Session status derived twice | closed | AD-2: session status only in the engine. ("Remove a set" semantics left to the story.) |
| H11 | high | Running goal reached | partly | AD-2: computed only by the engine. AD-3: stored on the program by plan. Still open: **when** it is checked (on «Fullfør økt» through `plan.api`, or at the next generation), and how a new goal resets it. |
| H12 | high | Lazy generation is a write on a read path | partly | See reconcile C3 / N3. |
| H13 | high | Demo data hand-seeded with absolute ids/dates | closed | AD-16: through the slices' `api.ts` and the engine, relative dates, generated ids, idempotent and resettable. (The shared published demo state is under reconcile H4.) |
| H15 | high | Profile change → replan, new program vs version | partly | The profile → plan edge exists. Still open: which changes start a **new program** (R13: a focus change resets the count), and the confirm preview. Also, the profile still has two writers (AD-3 table). See N4. |

## 2. Still open or partly closed (deduplicated)

1. Week creation trigger: who calls `ensureCurrentWeek`, and what coach and logging read before it runs (reconcile C3, rubric #4, adversarial H12).
2. Medical check: no split between acute symptoms and localised pain, so "brystsmerter" can get a swap offer (reconcile H2, rubric #5, adversarial H5).
3. Shared demo users on the published site can be deleted or used up by one examiner, with no reset path there (reconcile H4).
4. Demo provider matching method, the two UX flows, and how recordings refer to slots are undefined (reconcile H5).
5. Approve has no single command or transaction. Who sets the status, and a repeated approve gives an error rather than no effect (adversarial H6).
6. No current-program pointer. The stale check does not reject a proposal based on last week's version (adversarial H7, H3).
7. Profile change: which changes start a new program, the preview, and two writers of the profile (adversarial H15).
8. Program state triggers: the R13 week-9 card answer is not stored, and when running-goal-reached is set or reset is not defined (reconcile H8, adversarial H11).

## 3. New contradictions introduced by the revision

| # | Between | Contradiction |
| --- | --- | --- |
| N1 | AD-1 diagram vs AD-3 / AD-7 / AD-9 / AD-12 | AD-1 allows cross-slice imports "only along the edges in the diagram". But plan has no edge to `onboarding`/`profile`, though `ensureCurrentWeek(userId, today)` needs the profile. Coach has no edge to `profile`, though AD-12 sends profile fields. Coach has no edge to `account`, though `account` owns the coach usage counter that AD-9 enforces. `account` has no edges at all. |
| N2 | AD-16 + source tree vs AD-1 diagram | The seed lives in `src/shared/db` and "calls the slices' `api.ts`". The diagram only allows slices → shared, never shared → slices. |
| N3 | AD-4 vs AD-7 | "Page loads never write", yet the current week is created by "a server action called by the page". From a Server Component that is still a write during render, and from the client the first render has no week. AD-7 does not say whether other entry points (coach, logging) call it. |
| N4 | AD-7 vs AD-7 / AD-13 / PRD R13 | "A plan week belongs to one program" with a unique key on (program, week_start), but "a new program creates the next version of the current week". A new program (and, by R13, a focus change) must create a new plan week under the new program, not a version of the old program's week. |
| N5 | AD-8 vs AD-7 and the ER diagram | Slots belong to the plan week and are shared by versions (`PLAN_VERSION }o--o{ SESSION_SLOT`), and new slots are made "only for new sessions". It is undefined whether a moved, reduced or swapped session keeps its slot (then its date and targets must live per version, which the ER does not show, or the slot row is edited and older versions change) or gets a new slot (then it is not a "new session"). |
| N6 | AD-9 / AD-18 vs AD-11 | Recordings are "one per Appendix C scenario", and "the Appendix C scenarios run against the Demo provider". But "My knee hurts" is caught by `classifyMedical` and never reaches any provider, so that recording and test cannot exist as written. |
| N7 | AD-18 / Conventions vs source tree (low) | Tests for the medical word list, the Demo-provider scenarios and the FR16 cascade check have no home in `tests/` (only `engine/` and `e2e/`). |
