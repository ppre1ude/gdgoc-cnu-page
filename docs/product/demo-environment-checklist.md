# Demo Environment Remaining Checklist

Last checked: 2026-06-03

Firebase Web app, Google Auth provider, Firestore, demo data seed, public Activity CRUD loop, Gemini API response, WDS foundation, Pretendard font stack, WDS navigation/form migration, and local predeploy smoke automation have been verified in local development.

## Latest Local Gate

- [x] `npm run test`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run test:rules:emulator`
- [x] Browser smoke on `/`, `/calendar`, `/notices`, `/studies`, `/projects`, `/records`, `/admin/notices`, and `/login`
- [x] `npm run smoke:predeploy`

## Dependency Blockers To Resolve

- [x] Apply safe transitive updates for `protobufjs`, `qs`, and `tmp`.
- [ ] Decide how to handle the remaining `npm audit --audit-level=high` findings before production. Current audit reports 13 findings after safe updates: 2 high and 11 moderate.
- [ ] Approve or defer `firebase-tools@15` after the local Java runtime is upgraded to JDK 21 or newer.
- [ ] Decide whether to wait for a safe `firebase-admin` upstream patch path or accept the current moderate transitive server-runtime audit risk for a limited release.
- [ ] Decide whether to override or upgrade the Next/PostCSS path; do not land Next-adjacent dependency changes without explicit approval.
- [ ] Fix npm registry authentication for `@wanteddev/*` packages so dependency freshness checks can run without `npm outdated` failing against GitHub Packages.

## Firebase Residual Checks

- [x] Add `npm run check:deployment-env` for repo-side deployment env verification without printing secrets.
- [ ] Add the final production/preview domain to Firebase Auth authorized domains after the deployment target is chosen.
- [ ] Re-run Firestore rules verification immediately before public deployment.
- [ ] Confirm the first operator `chapterUsers/{uid}` document is bootstrapped with the `admin` role in the target Firebase project.
- [ ] Provide a Firebase Admin credential in the deployment platform through `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`.
- [ ] Set `DEPLOYMENT_ORIGIN` to the chosen preview or production origin before running release checks.

## Gemini Residual Checks

- [x] Deployment env check fails if Gemini secrets are exposed through `NEXT_PUBLIC_*` keys.
- [ ] Restrict the Gemini API key to the expected environment and deployment target.
- [ ] Confirm the deployed AI route fails safely when Gemini quota, network, or schema validation fails.

## Visual QA Residual Checks

- [ ] Run desktop and mobile QA on the preview URL, not only localhost.
- [ ] Re-check WDS navigation, member branch links, admin access-gate screens, and form controls on the preview URL.

## Product Scope After Release Readiness

- [ ] Choose the first usable release slice from `.scratch/issues/008-plan-first-usable-release.md`.
- [x] Candidate backlog now includes attendance UI, operator application management, member profile approval fields, custom claims hardening, and Discord notification publishing.
- [ ] Convert human-decision candidates into thin implementation issues after approval policy, role-hardening level, and Discord publishing policy are chosen.
