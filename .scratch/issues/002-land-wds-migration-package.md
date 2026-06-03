# WDS migration landing package

Labels: ready-for-agent
Type: AFK

## What to build

Prepare the completed WDS migration work as a reviewable landing package. The branch should clearly show that common form controls, admin authoring forms, navigation, and the Pretendard font stack now follow the WDS-first design direction.

## Acceptance criteria

- [x] WDS form, navigation, and Pretendard changes are grouped into understandable commits.
  - Evidence: `06b85ff refactor: WDS 폼 primitive로 관리자 작성 화면 정리` groups WDS form/admin work, and `8988f37 refactor: WDS 내비게이션과 Pretendard 기준 정리` groups navigation/Pretendard work.
- [x] `npm run test`, `npm run typecheck`, and `npm run build` pass after the final landing state.
  - Evidence: `npm run test -- src/components/wds-form-control-model.test.ts` passed by running the full `src` tests (199 passed); `npm run typecheck` and `npm run build` also passed.
- [x] Browser QA evidence covers the public home, member branch navigation, and access-gated admin page.
  - Evidence: local-only QA screenshots exist in ignored run output under `.scratch/run/wds-migration-qa/` (`home-desktop.png`, `calendar-branches.png`, `admin-notices.png`). The follow-up `npm run smoke:predeploy` command now regenerates ignored screenshots and `report.json` under `.scratch/run/predeploy-smoke/`.
- [x] Remaining raw control exceptions are documented as intentional or moved into follow-up issues.
  - Evidence: `src/features/onboarding/yonsei-developer-banner.tsx` keeps its native `button` intentionally for the custom interactive onboarding doodle.

## Blocked by

None - can start immediately.
