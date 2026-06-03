# Add operator attendance UI slice

Labels: needs-triage
Type: product-slice

## What to build

Turn the existing session attendance domain and admin-side attendance action into a focused operator UI for reviewing sessions and marking approved participants attended.

## Acceptance criteria

- [ ] Operators can select a scheduled activity session and see approved, pending, attended, and derived absent counts.
- [ ] Operators can mark an approved active application as attended without allowing pending or cancelled applications.
- [ ] Members can see their own attendance/application state without seeing operator-only details.
- [ ] Firestore rules and browser smoke cover the new route or panel.

## Blocked by

- `.scratch/issues/008-plan-first-usable-release.md`
