import type { UserRole } from './activity.ts';
import {
  canApplyToActivities,
  canViewMemberContent,
} from './role-access-policy.ts';

export type MemberHomeAccessStatus =
  | 'login_required'
  | 'pending_approval'
  | 'active_member'
  | 'alumni';

export type MemberHomeAccess = {
  status: MemberHomeAccessStatus;
  canViewMemberContent: boolean;
  canApplyToActivities: boolean;
  message: string;
};

const activeMemberAccess = {
  status: 'active_member',
  canViewMemberContent: true,
  canApplyToActivities: true,
  message: '멤버 홈을 이용할 수 있습니다.',
} satisfies MemberHomeAccess;

export function describeMemberHomeAccess(role: UserRole): MemberHomeAccess {
  switch (role) {
    case 'visitor':
      return {
        status: 'login_required',
        canViewMemberContent: false,
        canApplyToActivities: false,
        message: '멤버 홈을 보려면 로그인이 필요합니다.',
      };
    case 'guest':
      return {
        status: 'pending_approval',
        canViewMemberContent: false,
        canApplyToActivities: false,
        message: '운영진 승인 후 멤버 홈을 이용할 수 있습니다.',
      };
    case 'alumni':
      return {
        status: 'alumni',
        canViewMemberContent: canViewMemberContent(role),
        canApplyToActivities: canApplyToActivities(role),
        message: '수료 멤버는 멤버 콘텐츠를 볼 수 있지만 활동 신청은 할 수 없습니다.',
      };
    case 'member':
    case 'team_member':
    case 'organizer':
    case 'admin':
      return activeMemberAccess;
  }
}
