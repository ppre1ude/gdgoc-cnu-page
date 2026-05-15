import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { koreanCopy } from './korean-copy.ts';

const suspiciousMojibakePattern = /[\uFFFD\u4E00-\u9FFF\uF900-\uFAFF]/u;
const loginAfterCopyFiles = [
  new URL('../components/role-gate.tsx', import.meta.url),
  new URL('../domain/member-access.ts', import.meta.url),
  new URL('../domain/navigation.ts', import.meta.url),
  new URL('../features/activities/activity-admin.tsx', import.meta.url),
  new URL('../features/activities/member-home.tsx', import.meta.url),
];

describe('Korean Copy Catalog', () => {
  it('keeps shared logged-in copy in one catalog', () => {
    assert.equal(
      koreanCopy.roleGate.defaultTitle,
      '권한이 필요합니다',
    );
    assert.equal(
      koreanCopy.memberAccess.alumni.message,
      '수료 멤버는 멤버 콘텐츠를 볼 수 있지만 활동 신청은 할 수 없습니다.',
    );
    assert.equal(
      koreanCopy.memberHome.activitySections.upcoming.title,
      '다가오는 활동',
    );
    assert.equal(
      koreanCopy.activityAdmin.saveErrors.invalidStartsAt,
      'Activity 일정은 올바른 날짜 / 시간으로 입력해야 합니다.',
    );
  });

  it('does not contain mojibake characters in catalog values', () => {
    for (const value of collectStrings(koreanCopy)) {
      assert.equal(
        suspiciousMojibakePattern.test(value),
        false,
        `Suspicious mojibake in copy value: ${value}`,
      );
    }
  });

  it('keeps logged-in source copy free of suspicious mojibake characters', () => {
    for (const fileUrl of loginAfterCopyFiles) {
      const contents = readFileSync(fileUrl, 'utf8');

      assert.equal(
        suspiciousMojibakePattern.test(contents),
        false,
        `Suspicious mojibake remains in ${fileUrl.pathname}`,
      );
    }
  });
});

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}
