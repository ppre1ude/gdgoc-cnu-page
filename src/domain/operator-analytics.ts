import type { ActivityApplication } from './activity-application.ts';
import type { Activity, ActivityType, UserRole } from './activity.ts';
import type {
  ActivitySession,
  SessionAttendance,
} from './activity-session.ts';
import { summarizeSessionAttendance } from './activity-session.ts';
import {
  isActivityUpcoming,
  isSessionRecentlyEnded,
} from './activity-schedule.ts';
import type { ChapterUser, RoleChangeLog } from './chapter-user.ts';
import { isActiveMemberRole } from './role-access-policy.ts';

export type OperatorAnalyticsInput = {
  activities?: Activity[];
  activityCapacityById?: Record<string, number>;
  applications: ActivityApplication[];
  activitySessions?: ActivitySession[];
  now?: string;
  roleChangeLogs: RoleChangeLog[];
  sessionAttendances?: SessionAttendance[];
  users: ChapterUser[];
};

export type ActivityParticipationFunnel = {
  activityId: string;
  appliedCount: number;
  approvedCount: number;
  attendanceRate: number;
  attendedCount: number;
  derivedAbsentCount: number;
  hasEnded: boolean;
  title: string;
  type: ActivityType;
};

export type ActivityTypeAttendanceRate = {
  approvedCount: number;
  attendanceRate: number;
  attendedCount: number;
  derivedAbsentCount: number;
  type: ActivityType;
};

export type LowParticipationMember = {
  absentCount: number;
  approvedCount: number;
  attendanceRate: number;
  attendedCount: number;
  displayName: string;
  userId: string;
};

export type OperatorAnalytics = {
  activeMemberCount: number;
  activityFunnels: ActivityParticipationFunnel[];
  activityTypeAttendanceRates: ActivityTypeAttendanceRate[];
  approvedApplicationCount: number;
  applicationApprovalRate: number;
  attendedSessionCount: number;
  attendanceOpportunityCount: number;
  derivedAbsentSessionCount: number;
  lowParticipationMembers: LowParticipationMember[];
  pendingApplicationCount: number;
  pendingGuestCount: number;
  recentAttendanceRate: number;
  recentEndedSessionCount: number;
  roleChangeLogCount: number;
  upcomingActivityApplicationRate: number;
  upcomingActivityCapacityFillRate: number;
};

export function calculateOperatorAnalytics(
  input: OperatorAnalyticsInput,
): OperatorAnalytics {
  const activeApplications = input.applications.filter(
    (application) => !application.cancelledAt,
  );
  const activeMemberIds = new Set(
    input.users
      .filter((user) => isActiveMemberRole(user.role))
      .map((user) => user.id),
  );
  const activeMemberApplications = activeApplications.filter((application) =>
    activeMemberIds.has(application.userId),
  );
  const pendingApplicationCount = activeApplications.filter(
    (application) => application.state === 'applied',
  ).length;
  const approvedApplicationCount = activeApplications.filter(
    (application) => application.state === 'approved',
  ).length;
  const applicationCount = pendingApplicationCount + approvedApplicationCount;
  const now = input.now ?? new Date().toISOString();
  const activityFunnels = getActivityFunnels({
    activities: input.activities ?? [],
    applications: activeMemberApplications,
    now,
    sessionAttendances: input.sessionAttendances ?? [],
    sessions: input.activitySessions ?? [],
  });
  const recentSessions = getRecentEndedSessions({
    now,
    sessions: input.activitySessions ?? [],
  });
  const recentActivityIds = new Set(
    recentSessions.map((session) => session.activityId),
  );
  const recentActivityFunnels = activityFunnels.filter((funnel) =>
    recentActivityIds.has(funnel.activityId),
  );
  const attendanceOpportunityCount = recentActivityFunnels.reduce(
    (total, funnel) => total + funnel.approvedCount,
    0,
  );
  const attendedSessionCount = recentActivityFunnels.reduce(
    (total, funnel) => total + funnel.attendedCount,
    0,
  );
  const derivedAbsentSessionCount = recentActivityFunnels.reduce(
    (total, funnel) => total + funnel.derivedAbsentCount,
    0,
  );
  const upcomingActivityRates = getUpcomingActivityRates({
    activeMemberCount: activeMemberIds.size,
    activities: input.activities ?? [],
    activityCapacityById: input.activityCapacityById ?? {},
    applications: activeMemberApplications,
    now,
  });

  return {
    activeMemberCount: input.users.filter((user) =>
      isActiveMemberRole(user.role),
    ).length,
    activityFunnels,
    activityTypeAttendanceRates:
      getActivityTypeAttendanceRates(recentActivityFunnels),
    approvedApplicationCount,
    applicationApprovalRate:
      applicationCount === 0
        ? 0
        : Math.round((approvedApplicationCount / applicationCount) * 100),
    attendedSessionCount,
    attendanceOpportunityCount,
    derivedAbsentSessionCount,
    lowParticipationMembers: getLowParticipationMembers({
      activeMemberApplications,
      recentSessions,
      sessionAttendances: input.sessionAttendances ?? [],
      users: input.users,
    }),
    pendingApplicationCount,
    pendingGuestCount: input.users.filter((user) => user.role === 'guest').length,
    recentAttendanceRate: percentage(
      attendedSessionCount,
      attendanceOpportunityCount,
    ),
    recentEndedSessionCount: recentSessions.length,
    roleChangeLogCount: input.roleChangeLogs.length,
    ...upcomingActivityRates,
  };
}

function getUpcomingActivityRates({
  activeMemberCount,
  activities,
  activityCapacityById,
  applications,
  now,
}: {
  activeMemberCount: number;
  activities: Activity[];
  activityCapacityById: Record<string, number>;
  applications: ActivityApplication[];
  now: string;
}) {
  const upcomingActivities = activities.filter(
    (activity) => isActivityUpcoming(activity, now),
  );
  const upcomingActivityIds = new Set(
    upcomingActivities.map((activity) => activity.id),
  );
  const upcomingApplicationCount = applications.filter((application) =>
    upcomingActivityIds.has(application.activityId),
  ).length;
  const capacityActivityIds = new Set(
    upcomingActivities
      .filter((activity) => (activityCapacityById[activity.id] ?? 0) > 0)
      .map((activity) => activity.id),
  );
  const upcomingCapacity = upcomingActivities.reduce(
    (total, activity) =>
      capacityActivityIds.has(activity.id)
        ? total + (activityCapacityById[activity.id] ?? 0)
        : total,
    0,
  );
  const capacityBackedApplicationCount = applications.filter((application) =>
    capacityActivityIds.has(application.activityId),
  ).length;

  return {
    upcomingActivityApplicationRate: percentage(
      upcomingApplicationCount,
      activeMemberCount * upcomingActivities.length,
    ),
    upcomingActivityCapacityFillRate: percentage(
      capacityBackedApplicationCount,
      upcomingCapacity,
    ),
  };
}

function getActivityFunnels({
  activities,
  applications,
  now,
  sessionAttendances,
  sessions,
}: {
  activities: Activity[];
  applications: ActivityApplication[];
  now: string;
  sessionAttendances: SessionAttendance[];
  sessions: ActivitySession[];
}): ActivityParticipationFunnel[] {
  const sessionByActivityId = new Map(
    sessions.map((session) => [session.activityId, session]),
  );

  return activities.flatMap((activity) => {
    const session = sessionByActivityId.get(activity.id);

    if (!session) {
      return [];
    }

    const summary = summarizeSessionAttendance({
      applications: applications.filter(
        (application) => application.activityId === activity.id,
      ),
      attendances: sessionAttendances,
      now,
      session,
    });

    return [
      {
        activityId: activity.id,
        appliedCount: summary.appliedCount,
        approvedCount: summary.approvedCount,
        attendanceRate: percentage(summary.attendedCount, summary.approvedCount),
        attendedCount: summary.attendedCount,
        derivedAbsentCount: summary.derivedAbsentCount,
        hasEnded: summary.hasEnded,
        title: activity.title,
        type: activity.type,
      },
    ];
  });
}

function getRecentEndedSessions({
  now,
  sessions,
}: {
  now: string;
  sessions: ActivitySession[];
}) {
  return sessions.filter((session) =>
    isSessionRecentlyEnded(session, {
      now,
      recentWindowDays: 30,
    }),
  );
}

function getActivityTypeAttendanceRates(
  recentActivityFunnels: ActivityParticipationFunnel[],
): ActivityTypeAttendanceRate[] {
  const typeOrder: ActivityType[] = [
    'event',
    'study',
    'project',
    'challenge',
    'social',
  ];
  const byType = new Map<ActivityType, Omit<ActivityTypeAttendanceRate, 'type'>>();

  for (const funnel of recentActivityFunnels) {
    const existing = byType.get(funnel.type) ?? {
      approvedCount: 0,
      attendedCount: 0,
      derivedAbsentCount: 0,
      attendanceRate: 0,
    };
    const next = {
      approvedCount: existing.approvedCount + funnel.approvedCount,
      attendedCount: existing.attendedCount + funnel.attendedCount,
      derivedAbsentCount:
        existing.derivedAbsentCount + funnel.derivedAbsentCount,
      attendanceRate: 0,
    };

    byType.set(funnel.type, {
      ...next,
      attendanceRate: percentage(next.attendedCount, next.approvedCount),
    });
  }

  return typeOrder.flatMap((type) => {
    const rate = byType.get(type);

    return rate && rate.approvedCount > 0
      ? [
          {
            type,
            ...rate,
          },
        ]
      : [];
  });
}

function getLowParticipationMembers({
  activeMemberApplications,
  recentSessions,
  sessionAttendances,
  users,
}: {
  activeMemberApplications: ActivityApplication[];
  recentSessions: ActivitySession[];
  sessionAttendances: SessionAttendance[];
  users: ChapterUser[];
}): LowParticipationMember[] {
  const userById = new Map(users.map((user) => [user.id, user]));
  const memberParticipation = new Map<
    string,
    Omit<LowParticipationMember, 'attendanceRate' | 'displayName'>
  >();

  for (const session of recentSessions) {
    const attendedUserIds = new Set(
      sessionAttendances
        .filter(
          (attendance) =>
            attendance.sessionId === session.id &&
            attendance.state === 'attended',
        )
        .map((attendance) => attendance.userId),
    );
    const approvedApplications = activeMemberApplications.filter(
      (application) =>
        application.activityId === session.activityId &&
        application.state === 'approved',
    );

    for (const application of approvedApplications) {
      const existing = memberParticipation.get(application.userId) ?? {
        absentCount: 0,
        approvedCount: 0,
        attendedCount: 0,
        userId: application.userId,
      };
      const wasAttended = attendedUserIds.has(application.userId);

      memberParticipation.set(application.userId, {
        ...existing,
        absentCount: existing.absentCount + (wasAttended ? 0 : 1),
        approvedCount: existing.approvedCount + 1,
        attendedCount: existing.attendedCount + (wasAttended ? 1 : 0),
      });
    }
  }

  return [...memberParticipation.values()]
    .filter((member) => member.absentCount > 0)
    .map((member) => ({
      ...member,
      attendanceRate: percentage(member.attendedCount, member.approvedCount),
      displayName: userById.get(member.userId)?.displayName ?? member.userId,
    }))
    .sort((a, b) => {
      if (b.absentCount !== a.absentCount) {
        return b.absentCount - a.absentCount;
      }

      if (a.attendanceRate !== b.attendanceRate) {
        return a.attendanceRate - b.attendanceRate;
      }

      return a.displayName.localeCompare(b.displayName);
    })
    .slice(0, 5);
}

function percentage(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}
