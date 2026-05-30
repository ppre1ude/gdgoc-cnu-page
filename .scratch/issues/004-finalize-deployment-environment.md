# Finalize deployment environment

Labels: ready-for-human
Type: HITL

## What to build

Prepare the target deployment environment so the app can run with real Firebase Auth, Firestore, role bootstrap data, and Gemini access instead of only local development configuration.

## Acceptance criteria

- [ ] Production or preview domain is chosen and added to Firebase Auth authorized domains.
- [ ] The first operator `chapterUsers/{uid}` document exists with the `admin` role in the target Firebase project.
- [ ] Gemini API key restrictions match the deployment target and do not expose the key to the browser.
- [ ] Required environment variables are present in the deployment platform and match `.env.example`.

## Blocked by

None - can start immediately.
