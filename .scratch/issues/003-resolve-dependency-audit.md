# Resolve dependency audit findings

Labels: needs-triage, ready-for-human
Type: HITL

## What to build

Decide and apply the safest dependency update path for the current `npm audit --audit-level=high` findings without destabilizing Next.js, Firebase Admin, Firebase Tools, or WDS package resolution.

## Acceptance criteria

- [ ] Each high or moderate audit finding is classified as production runtime, build-time tooling, emulator tooling, or transitive false urgency.
- [ ] Non-breaking `npm audit fix` changes are applied only when they keep tests and build green.
- [ ] Breaking updates such as `firebase-tools@15` or any Next.js-adjacent change are explicitly approved before landing.
- [ ] The final branch records the remaining accepted risk, if any.

## Blocked by

None - can start immediately.
