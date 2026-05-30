# Define production release and rollback runbook

Labels: ready-for-human
Type: HITL

## What to build

Define the production deployment procedure, post-deploy verification path, and rollback criteria so the first public release can be executed without guessing under time pressure.

## Acceptance criteria

- [ ] The release path names the deployment target, required commands, and required environment variables.
- [ ] Post-deploy checks cover Firebase Auth, Firestore rules, Gemini route behavior, public pages, member pages, and admin gates.
- [ ] Rollback criteria are concrete enough to decide whether to revert, redeploy, or pause.
- [ ] Ownership for domain/DNS/Firebase console actions is clear.

## Blocked by

- `.scratch/issues/006-preview-deployment-qa.md`
