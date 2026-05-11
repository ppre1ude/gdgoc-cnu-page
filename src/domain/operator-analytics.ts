import type { ActivityApplication } from './activity-application.ts';
import type { UserRole } from './activity.ts';
import type { ChapterUser, RoleChangeLog } from './chapter-user.ts';

export type OperatorAnalyticsInput = {
  applications: ActivityApplication[];
  roleChangeLogs: RoleChangeLog[];
  users: ChapterUser[];
};

export type OperatorAnalytics = {
  activeMemberCount: number;
  approvedApplicationCount: number;
  applicationApprovalRate: number;
  pendingApplicationCount: number;
  pendingGuestCount: number;
  roleChangeLogCount: number;
};

const activeMemberRoles = new Set<UserRole>([
  'member',
  'team_member',
  'organizer',
  'admin',
]);

export function calculateOperatorAnalytics(
  input: OperatorAnalyticsInput,
): OperatorAnalytics {
  const activeApplications = input.applications.filter(
    (application) => !application.cancelledAt,
  );
  const pendingApplicationCount = activeApplications.filter(
    (application) => application.state === 'applied',
  ).length;
  const approvedApplicationCount = activeApplications.filter(
    (application) => application.state === 'approved',
  ).length;
  const applicationCount = pendingApplicationCount + approvedApplicationCount;

  return {
    activeMemberCount: input.users.filter((user) =>
      activeMemberRoles.has(user.role),
    ).length,
    approvedApplicationCount,
    applicationApprovalRate:
      applicationCount === 0
        ? 0
        : Math.round((approvedApplicationCount / applicationCount) * 100),
    pendingApplicationCount,
    pendingGuestCount: input.users.filter((user) => user.role === 'guest').length,
    roleChangeLogCount: input.roleChangeLogs.length,
  };
}
