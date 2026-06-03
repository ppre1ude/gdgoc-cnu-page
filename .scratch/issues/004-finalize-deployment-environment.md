# Finalize deployment environment

Labels: ready-for-human
Type: HITL
Status: repo-side checks added; external console setup required

## What to build

Prepare the target deployment environment so the app can run with real Firebase Auth, Firestore, role bootstrap data, and Gemini access instead of only local development configuration.

## Acceptance criteria

- [ ] Production or preview domain is chosen and added to Firebase Auth authorized domains.
- [ ] The first operator `chapterUsers/{uid}` document exists with the `admin` role in the target Firebase project.
- [ ] Gemini API key restrictions match the deployment target and do not expose the key to the browser.
- [ ] Required environment variables are present in the deployment platform and match `.env.example`.

## Repo-side evidence

- [x] Added `npm run check:deployment-env` to validate deployment env shape without printing secret values.
- [x] The check verifies Firebase public env keys, Firebase Admin credential shape, server-only `GEMINI_API_KEY`, absence of public Gemini/private keys, and `DEPLOYMENT_ORIGIN`.
- [x] `.env.example` includes `DEPLOYMENT_ORIGIN` so the release-check contract is visible.
- [x] Running `npm run check:deployment-env -- --env-file .env.local` currently fails only on repo-verifiable missing deployment inputs:
  - Firebase Admin credential is incomplete.
  - `DEPLOYMENT_ORIGIN` is not set.

## External actions still required

- Choose the preview or production origin and set `DEPLOYMENT_ORIGIN` for release checks.
- Add that origin to Firebase Auth authorized domains.
- Create or verify the first admin `chapterUsers/{uid}` document in the target Firestore project.
- Configure deployment platform env vars from `.env.example`.
- Restrict `GEMINI_API_KEY` to the deployment target in Google Cloud or Google AI Studio.

## Blocked by

- Human choice of deployment target/domain.
- Firebase console access.
- Deployment platform env access.
