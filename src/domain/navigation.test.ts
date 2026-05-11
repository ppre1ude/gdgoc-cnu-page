import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getAdminNavigationItems,
  getPrimaryNavigationItems,
} from './navigation.ts';

describe('primary navigation', () => {
  it('does not expose individual admin tools in the top navigation', () => {
    const hrefs = getPrimaryNavigationItems('team_member').map((item) => item.href);

    assert.equal(hrefs.includes('/admin'), true);
    assert.equal(hrefs.includes('/admin/activities'), false);
    assert.equal(hrefs.includes('/admin/notices'), false);
  });

  it('keeps admin entry out of visitor and member navigation', () => {
    assert.equal(
      getPrimaryNavigationItems('visitor').some((item) => item.href === '/admin'),
      false,
    );
    assert.equal(
      getPrimaryNavigationItems('member').some((item) => item.href === '/admin'),
      false,
    );
  });
});

describe('admin navigation', () => {
  it('groups operator tools under the admin dashboard', () => {
    assert.deepEqual(getAdminNavigationItems(), [
      {
        description:
          '활동을 등록하고 Gemini 작성 보조, 신청 승인, 출석 흐름을 확인합니다.',
        href: '/admin/activities',
        label: 'Activity Admin',
      },
      {
        description:
          '공지사항을 등록하고 핀 고정, 공개 범위, 멤버 홈 노출을 관리합니다.',
        href: '/admin/notices',
        label: 'Notice Admin',
      },
    ]);
  });
});
