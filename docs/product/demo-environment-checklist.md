# Demo Environment Remaining Checklist

Last checked: 2026-05-30

Firebase Web app, Google Auth provider, Firestore, demo data seed, public Activity CRUD loop, Gemini API response, WDS foundation, Pretendard font stack, and WDS navigation/form migration have been verified in local development.

## Latest Local Gate

- [x] `npm run test`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run test:rules:emulator`
- [x] Browser smoke on `/`, `/calendar`, `/notices`, `/studies`, `/projects`, `/records`, `/admin/notices`, and `/login`

## Deployment Blockers To Resolve

- [ ] Decide how to handle `npm audit --audit-level=high` findings before production. Current audit reports high findings through `firebase-tools` transitive `tar`/`tmp` paths and moderate findings through `next`/`postcss`, `protobufjs`, `qs`, and `uuid`.
- [ ] Upgrade the local Java runtime to JDK 21 or newer before adopting `firebase-tools@15`, because the emulator warns that Java versions below 21 will soon lose support.
- [ ] Fix npm registry authentication for `@wanteddev/*` packages so dependency freshness checks can run without `npm outdated` failing against GitHub Packages.

## Firebase Residual Checks

- [ ] Add the final production/preview domain to Firebase Auth authorized domains after the deployment target is chosen.
- [ ] Re-run Firestore rules verification immediately before public deployment.
- [ ] Confirm the first operator `chapterUsers/{uid}` document is bootstrapped with the `admin` role in the target Firebase project.

## Gemini Residual Checks

- [ ] Restrict the Gemini API key to the expected environment and deployment target.
- [ ] Confirm the deployed AI route fails safely when Gemini quota, network, or schema validation fails.

## Visual QA Residual Checks

- [ ] Run desktop and mobile QA on the preview URL, not only localhost.
- [ ] Re-check WDS navigation, member branch links, admin access-gate screens, and form controls on the preview URL.
