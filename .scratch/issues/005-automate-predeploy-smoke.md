# Automate predeploy smoke checks

Labels: ready-for-agent
Type: AFK

## What to build

Turn the current manual predeploy smoke routine into a repeatable check that verifies the main public, member, auth, and admin-gated routes before preview or production deployment.

## Acceptance criteria

- [x] A documented command or script visits `/`, `/calendar`, `/notices`, `/studies`, `/projects`, `/records`, `/admin/notices`, and `/login`.
  - Evidence: `npm run smoke:predeploy` runs `scripts/predeploy-smoke.ts` against `PREDEPLOY_SMOKE_BASE_URL` or `http://localhost:3000`; fresh machines can run `npm run smoke:predeploy:install` to install the Chromium runtime.
- [x] The check fails on console errors, missing page headings, header overflow, or broken member branch navigation semantics.
  - Evidence: the script records console/page errors, expected route text, header overflow, and member branch navigation link/active-state checks.
- [x] The check confirms the computed font stack includes Pretendard.
  - Evidence: the script reads `getComputedStyle(document.body).fontFamily` for every route and fails when Pretendard is missing.
- [x] Screenshots or a concise report are saved under an ignored run-output path.
  - Evidence: latest local run passed 16 route checks across desktop and mobile, then wrote screenshots plus `.scratch/run/predeploy-smoke/report.json`.

## Blocked by

Resolved: `.scratch/issues/002-land-wds-migration-package.md`
