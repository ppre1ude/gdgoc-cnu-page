# Run preview deployment QA

Labels: ready-for-human
Type: HITL

## What to build

After a preview deployment exists, verify the deployed app from the user perspective rather than relying on localhost. This should cover public pages, member navigation, auth entry, role gates, and WDS responsive behavior.

## Acceptance criteria

- [ ] Preview URL loads public home, login, member branch pages, and admin access-gated pages without console errors.
- [ ] Firebase Auth authorized domain works for the preview URL.
- [ ] Member and operator role-gated behavior is verified with real or approved test accounts.
- [ ] Desktop and mobile screenshots confirm WDS navigation and form surfaces do not overlap.

## Available command

- Run `PREDEPLOY_SMOKE_BASE_URL=<preview-url> npm run smoke:predeploy` after the preview URL exists.

## Blocked by

- `.scratch/issues/004-finalize-deployment-environment.md`
- Preview deployment URL.
- Real or approved test accounts for member/operator role checks.
