import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const demoControlFiles = [
  new URL('../components/auth-panel.tsx', import.meta.url),
  new URL('../features/activities/activity-detail.tsx', import.meta.url),
  new URL('../features/activities/member-home.tsx', import.meta.url),
  new URL('../features/records/record-detail.tsx', import.meta.url),
];

describe('auth demo mode', () => {
  it('does not fall back to a demo session when Firebase is missing', () => {
    const source = readFileSync(
      new URL('../features/auth/auth-session-provider.tsx', import.meta.url),
      'utf8',
    );

    assert.equal(source.includes("'demo'"), false);
    assert.equal(source.includes('createDemoSessionState'), false);
  });

  it('does not expose demo role controls on presentation surfaces', () => {
    for (const fileUrl of demoControlFiles) {
      const source = readFileSync(fileUrl, 'utf8');

      assert.equal(
        source.includes('demoRoleOptions'),
        false,
        `demo role options remain in ${fileUrl.pathname}`,
      );
      assert.equal(
        source.includes('setDemoRole'),
        false,
        `demo role setter remains in ${fileUrl.pathname}`,
      );
      assert.equal(
        source.includes('Demo role') || source.includes('Demo Role'),
        false,
        `demo role copy remains in ${fileUrl.pathname}`,
      );
    }
  });
});
