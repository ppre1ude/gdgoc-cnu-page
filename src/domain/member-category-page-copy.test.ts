import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('member category page copy', () => {
  it('does not show a dashboard return button on branch pages', () => {
    const source = readFileSync(
      new URL('../features/activities/member-category-page.tsx', import.meta.url),
      'utf8',
    );

    assert.equal(source.includes('Dashboard로 돌아가기'), false);
  });
});
