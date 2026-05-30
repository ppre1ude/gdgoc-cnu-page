# Automate predeploy smoke checks

Labels: ready-for-agent
Type: AFK

## What to build

Turn the current manual predeploy smoke routine into a repeatable check that verifies the main public, member, auth, and admin-gated routes before preview or production deployment.

## Acceptance criteria

- [ ] A documented command or script visits `/`, `/calendar`, `/notices`, `/studies`, `/projects`, `/records`, `/admin/notices`, and `/login`.
- [ ] The check fails on console errors, missing page headings, header overflow, or broken member branch navigation semantics.
- [ ] The check confirms the computed font stack includes Pretendard.
- [ ] Screenshots or a concise report are saved under an ignored run-output path.

## Blocked by

- `.scratch/issues/002-land-wds-migration-package.md`
