# WDS migration landing package

Labels: ready-for-agent
Type: AFK

## What to build

Prepare the completed WDS migration work as a reviewable landing package. The branch should clearly show that common form controls, admin authoring forms, navigation, and the Pretendard font stack now follow the WDS-first design direction.

## Acceptance criteria

- [ ] WDS form, navigation, and Pretendard changes are grouped into understandable commits.
- [ ] `npm run test`, `npm run typecheck`, and `npm run build` pass after the final landing state.
- [ ] Browser QA evidence covers the public home, member branch navigation, and access-gated admin page.
- [ ] Remaining raw control exceptions are documented as intentional or moved into follow-up issues.

## Blocked by

None - can start immediately.
