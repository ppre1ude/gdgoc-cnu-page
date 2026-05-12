import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  describeMemberHomeAccess,
  type MemberHomeAccessStatus,
} from './member-access.ts';
import type { UserRole } from './activity.ts';

type ExpectedAccess = {
  role: UserRole;
  status: MemberHomeAccessStatus;
  canViewMemberContent: boolean;
  canApplyToActivities: boolean;
  message: string;
};

describe('describeMemberHomeAccess', () => {
  it('describes member home access by user role', () => {
    const expectedAccess: ExpectedAccess[] = [
      {
        role: 'visitor',
        status: 'login_required',
        canViewMemberContent: false,
        canApplyToActivities: false,
        message: '멤버 홈을 보려면 로그인이 필요합니다.',
      },
      {
        role: 'guest',
        status: 'pending_approval',
        canViewMemberContent: false,
        canApplyToActivities: false,
        message: '운영진 승인 후 멤버 홈을 이용할 수 있습니다.',
      },
      {
        role: 'member',
        status: 'active_member',
        canViewMemberContent: true,
        canApplyToActivities: true,
        message: '멤버 홈을 이용할 수 있습니다.',
      },
      {
        role: 'team_member',
        status: 'active_member',
        canViewMemberContent: true,
        canApplyToActivities: true,
        message: '멤버 홈을 이용할 수 있습니다.',
      },
      {
        role: 'organizer',
        status: 'active_member',
        canViewMemberContent: true,
        canApplyToActivities: true,
        message: '멤버 홈을 이용할 수 있습니다.',
      },
      {
        role: 'admin',
        status: 'active_member',
        canViewMemberContent: true,
        canApplyToActivities: true,
        message: '멤버 홈을 이용할 수 있습니다.',
      },
      {
        role: 'alumni',
        status: 'alumni',
        canViewMemberContent: true,
        canApplyToActivities: false,
        message: '수료 멤버는 멤버 콘텐츠를 볼 수 있지만 활동 신청은 할 수 없습니다.',
      },
    ];

    for (const access of expectedAccess) {
      assert.deepEqual(describeMemberHomeAccess(access.role), {
        status: access.status,
        canViewMemberContent: access.canViewMemberContent,
        canApplyToActivities: access.canApplyToActivities,
        message: access.message,
      });
    }
  });
});
