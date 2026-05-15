import type { UserRole } from './activity.ts';
import { koreanCopy } from './korean-copy.ts';
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
  message: koreanCopy.memberAccess.activeMember.message,
} satisfies MemberHomeAccess;

export function describeMemberHomeAccess(role: UserRole): MemberHomeAccess {
  switch (role) {
    case 'visitor':
      return {
        status: 'login_required',
        canViewMemberContent: false,
        canApplyToActivities: false,
        message: koreanCopy.memberAccess.visitor.message,
      };
    case 'guest':
      return {
        status: 'pending_approval',
        canViewMemberContent: false,
        canApplyToActivities: false,
        message: koreanCopy.memberAccess.guest.message,
      };
    case 'alumni':
      return {
        status: 'alumni',
        canViewMemberContent: canViewMemberContent(role),
        canApplyToActivities: canApplyToActivities(role),
        message: koreanCopy.memberAccess.alumni.message,
      };
    case 'member':
    case 'team_member':
    case 'organizer':
    case 'admin':
      return activeMemberAccess;
  }
}
