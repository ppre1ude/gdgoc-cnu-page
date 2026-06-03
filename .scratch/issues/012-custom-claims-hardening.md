# Plan Firebase custom claims hardening

Labels: ready-for-human
Type: HITL

## What to build

Decide whether privileged roles remain Firestore-only for the first usable release or move admin/operator enforcement into Firebase custom claims.

## Acceptance criteria

- [ ] The role enforcement boundary is documented: Firestore-only, custom claims, or staged migration.
- [ ] Required server-side claim write path is identified if custom claims are chosen.
- [ ] Firestore rules, admin UI, and login/session behavior have a verification plan.
- [ ] Risks of stale claims and role-change propagation are recorded.

## Blocked by

- Human decision on production hardening level.
- `.scratch/issues/008-plan-first-usable-release.md`
