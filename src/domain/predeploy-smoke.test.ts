import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  getPredeploySmokeOutputDir,
  predeploySmokeRoutes,
  smokeViewports,
} from './predeploy-smoke.ts';

describe('predeploy smoke configuration', () => {
  it('covers the public, member, auth, and admin-gated routes', () => {
    assert.deepEqual(
      predeploySmokeRoutes.map((route) => ({
        expectedMainText: route.expectedMainText,
        path: route.path,
        screenshotName: route.screenshotName,
      })),
      [
        {
          expectedMainText: 'GDGoC CNU Values',
          path: '/',
          screenshotName: 'home.png',
        },
        {
          expectedMainText: '다음 일정 확인',
          path: '/calendar',
          screenshotName: 'calendar.png',
        },
        {
          expectedMainText: '중요 공지 확인',
          path: '/notices',
          screenshotName: 'notices.png',
        },
        {
          expectedMainText: '스터디 탐색',
          path: '/studies',
          screenshotName: 'studies.png',
        },
        {
          expectedMainText: '프로젝트 탐색',
          path: '/projects',
          screenshotName: 'projects.png',
        },
        {
          expectedMainText: '기록 살펴보기',
          path: '/records',
          screenshotName: 'records.png',
        },
        {
          expectedMainText: 'Access Denied',
          path: '/admin/notices',
          screenshotName: 'admin-notices.png',
        },
        {
          expectedMainText: 'Google Login',
          path: '/login',
          screenshotName: 'login.png',
        },
      ],
    );

    assert.equal(
      predeploySmokeRoutes.every((route) => route.expectedMainText.length > 0),
      true,
    );
    assert.deepEqual(
      smokeViewports.map((viewport) => viewport.name),
      ['desktop', 'mobile'],
    );
    assert.equal(getPredeploySmokeOutputDir().startsWith('.scratch/run/'), true);
  });

  it('documents a Playwright smoke command that checks browser regressions', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    );
    const scriptSource = readFileSync(
      new URL('../../scripts/predeploy-smoke.ts', import.meta.url),
      'utf8',
    );

    assert.equal(
      packageJson.scripts['smoke:predeploy'],
      'node --experimental-strip-types scripts/predeploy-smoke.ts',
    );
    assert.equal(
      packageJson.scripts['smoke:predeploy:install'],
      'playwright install chromium',
    );
    assert.equal(scriptSource.includes('chromium'), true);
    assert.equal(scriptSource.includes('launchChromium'), true);
    assert.equal(scriptSource.includes('npx playwright install chromium'), true);
    assert.equal(scriptSource.includes("page.on('console'"), true);
    assert.equal(scriptSource.includes("waitUntil: 'domcontentloaded'"), true);
    assert.equal(scriptSource.includes("'networkidle'"), false);
    assert.equal(scriptSource.includes('HYDRATION_SETTLE_MS'), true);
    assert.equal(scriptSource.includes("page.locator('main')"), true);
    assert.equal(scriptSource.includes('smokeViewports'), true);
    assert.equal(scriptSource.includes('assertPageHasHeading'), true);
    assert.equal(scriptSource.includes('Pretendard'), true);
    assert.equal(scriptSource.includes('assertHeaderDoesNotOverflow'), true);
    assert.equal(scriptSource.includes('assertMemberBranchNavigation'), true);
    assert.equal(scriptSource.includes('activeBranchPath'), true);
    assert.equal(scriptSource.includes('screenshot'), true);
    assert.equal(scriptSource.includes('report.json'), true);
  });
});
