import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ActivityApplication } from './activity-application.ts';
import type { Activity } from './activity.ts';
import type { ChapterUser, RoleChangeLog } from './chapter-user.ts';
import type {
  ActivitySession,
  SessionAttendance,
} from './activity-session.ts';
import { calculateOperatorAnalytics } from './operator-analytics.ts';

const users: ChapterUser[] = [
  {
    id: 'guest-1',
    displayName: 'Guest',
    email: 'guest@example.com',
    role: 'guest',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'member-1',
    displayName: 'Member',
    email: 'member@example.com',
    role: 'member',
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'team-member-1',
    displayName: 'Team Member',
    email: 'team@example.com',
    role: 'team_member',
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'alumni-1',
    displayName: 'Alumni',
    email: 'alumni@example.com',
    role: 'alumni',
    createdAt: '2025-05-01T09:00:00.000Z',
    updatedAt: '2025-05-01T09:00:00.000Z',
  },
];

const applications: ActivityApplication[] = [
  {
    id: 'activity-1_member-1',
    activityId: 'activity-1',
    userId: 'member-1',
    state: 'applied',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'activity-2_team-member-1',
    activityId: 'activity-2',
    userId: 'team-member-1',
    state: 'approved',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T10:00:00.000Z',
  },
  {
    id: 'activity-3_member-1',
    activityId: 'activity-3',
    userId: 'member-1',
    state: 'approved',
    cancelledAt: '2026-05-11T11:00:00.000Z',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T11:00:00.000Z',
  },
];

const roleChangeLogs: RoleChangeLog[] = [
  {
    id: 'role-change-1',
    actorId: 'operator-1',
    actorRole: 'team_member',
    createdAt: '2026-05-11T10:00:00.000Z',
    nextRole: 'member',
    previousRole: 'guest',
    targetUserId: 'member-1',
  },
];

describe('operator analytics', () => {
  it('summarizes active members, pending guests, applications, and approval rate', () => {
    assert.deepEqual(
      calculateOperatorAnalytics({
        applications,
        roleChangeLogs,
        users,
      }),
      {
        activeMemberCount: 2,
        activityFunnels: [],
        activityTypeAttendanceRates: [],
        approvedApplicationCount: 1,
        applicationApprovalRate: 50,
        attendedSessionCount: 0,
        attendanceOpportunityCount: 0,
        derivedAbsentSessionCount: 0,
        lowParticipationMembers: [],
        pendingApplicationCount: 1,
        pendingGuestCount: 1,
        recentAttendanceRate: 0,
        recentEndedSessionCount: 0,
        roleChangeLogCount: 1,
        upcomingActivityApplicationRate: 0,
        upcomingActivityCapacityFillRate: 0,
      },
    );
  });

  it('returns zero approval rate when there are no active applications', () => {
    assert.equal(
      calculateOperatorAnalytics({
        applications: [],
        roleChangeLogs: [],
        users: [],
      }).applicationApprovalRate,
      0,
    );
  });

  it('summarizes upcoming application and capacity fill rates for active members', () => {
    const upcomingActivities: Activity[] = [
      {
        id: 'upcoming-study',
        title: 'Upcoming Study',
        summary: 'Upcoming study summary.',
        type: 'study',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-20T09:00:00.000Z',
        createdAt: '2026-05-01T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
      {
        id: 'upcoming-event',
        title: 'Upcoming Event',
        summary: 'Upcoming event summary.',
        type: 'event',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-25T09:00:00.000Z',
        createdAt: '2026-05-01T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
      {
        id: 'starting-now',
        title: 'Starting Now',
        summary: 'Starting now summary.',
        type: 'event',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-11T09:00:00.000Z',
        createdAt: '2026-05-01T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
      {
        id: 'past-event',
        title: 'Past Event',
        summary: 'Past event summary.',
        type: 'event',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-01T09:00:00.000Z',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
    ];
    const upcomingApplications: ActivityApplication[] = [
      {
        id: 'upcoming-study_member-1',
        activityId: 'upcoming-study',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T09:00:00.000Z',
      },
      {
        id: 'upcoming-study_team-member-1',
        activityId: 'upcoming-study',
        userId: 'team-member-1',
        state: 'approved',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T10:00:00.000Z',
      },
      {
        id: 'upcoming-event_member-1',
        activityId: 'upcoming-event',
        userId: 'member-1',
        state: 'approved',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T10:00:00.000Z',
      },
      {
        id: 'upcoming-event_team-member-1',
        activityId: 'upcoming-event',
        userId: 'team-member-1',
        state: 'applied',
        cancelledAt: '2026-05-10T11:00:00.000Z',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T11:00:00.000Z',
      },
      {
        id: 'upcoming-event_alumni-1',
        activityId: 'upcoming-event',
        userId: 'alumni-1',
        state: 'approved',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T10:00:00.000Z',
      },
      {
        id: 'upcoming-event_guest-1',
        activityId: 'upcoming-event',
        userId: 'guest-1',
        state: 'applied',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T09:00:00.000Z',
      },
      {
        id: 'starting-now_member-1',
        activityId: 'starting-now',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T09:00:00.000Z',
      },
      {
        id: 'past-event_member-1',
        activityId: 'past-event',
        userId: 'member-1',
        state: 'approved',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T10:00:00.000Z',
      },
    ];

    const analytics = calculateOperatorAnalytics({
      activities: upcomingActivities,
      activityCapacityById: {
        'upcoming-study': 4,
        'upcoming-event': 2,
      },
      applications: upcomingApplications,
      now: '2026-05-11T09:00:00.000Z',
      roleChangeLogs: [],
      users,
    });

    assert.equal(analytics.upcomingActivityApplicationRate, 75);
    assert.equal(analytics.upcomingActivityCapacityFillRate, 50);
  });

  it('summarizes recent attendance funnels and low-participation active members', () => {
    const analyticsActivities: Activity[] = [
      {
        id: 'activity-event',
        title: 'Past Event',
        summary: 'Past event summary.',
        type: 'event',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-01T09:00:00.000Z',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
      {
        id: 'activity-study',
        title: 'Past Study',
        summary: 'Past study summary.',
        type: 'study',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-05T09:00:00.000Z',
        createdAt: '2026-04-25T09:00:00.000Z',
        updatedAt: '2026-04-25T09:00:00.000Z',
      },
      {
        id: 'activity-future',
        title: 'Future Event',
        summary: 'Future event summary.',
        type: 'event',
        visibility: 'member',
        status: 'published',
        startsAt: '2026-05-20T09:00:00.000Z',
        createdAt: '2026-05-01T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
    ];
    const activitySessions: ActivitySession[] = [
      {
        id: 'activity-event_default-session',
        activityId: 'activity-event',
        title: 'Past Event',
        startsAt: '2026-05-01T09:00:00.000Z',
        endsAt: '2026-05-01T11:00:00.000Z',
        createdAt: '2026-04-20T09:00:00.000Z',
        updatedAt: '2026-04-20T09:00:00.000Z',
      },
      {
        id: 'activity-study_default-session',
        activityId: 'activity-study',
        title: 'Past Study',
        startsAt: '2026-05-05T09:00:00.000Z',
        endsAt: '2026-05-05T11:00:00.000Z',
        createdAt: '2026-04-25T09:00:00.000Z',
        updatedAt: '2026-04-25T09:00:00.000Z',
      },
      {
        id: 'activity-future_default-session',
        activityId: 'activity-future',
        title: 'Future Event',
        startsAt: '2026-05-20T09:00:00.000Z',
        endsAt: '2026-05-20T11:00:00.000Z',
        createdAt: '2026-05-01T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
    ];
    const attendanceApplications: ActivityApplication[] = [
      {
        id: 'activity-event_member-1',
        activityId: 'activity-event',
        userId: 'member-1',
        state: 'approved',
        createdAt: '2026-04-25T09:00:00.000Z',
        updatedAt: '2026-04-26T09:00:00.000Z',
      },
      {
        id: 'activity-event_team-member-1',
        activityId: 'activity-event',
        userId: 'team-member-1',
        state: 'approved',
        createdAt: '2026-04-25T09:00:00.000Z',
        updatedAt: '2026-04-26T09:00:00.000Z',
      },
      {
        id: 'activity-study_team-member-1',
        activityId: 'activity-study',
        userId: 'team-member-1',
        state: 'approved',
        createdAt: '2026-04-30T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
      {
        id: 'activity-future_member-1',
        activityId: 'activity-future',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T09:00:00.000Z',
      },
      {
        id: 'activity-study_alumni-1',
        activityId: 'activity-study',
        userId: 'alumni-1',
        state: 'approved',
        createdAt: '2026-04-30T09:00:00.000Z',
        updatedAt: '2026-05-01T09:00:00.000Z',
      },
    ];
    const sessionAttendances: SessionAttendance[] = [
      {
        id: 'activity-event_default-session_member-1',
        activityId: 'activity-event',
        activityType: 'event',
        sessionId: 'activity-event_default-session',
        userId: 'member-1',
        state: 'attended',
        roleSnapshot: 'member',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ];

    const analytics = calculateOperatorAnalytics({
      activities: analyticsActivities,
      applications: attendanceApplications,
      activitySessions,
      now: '2026-05-11T09:00:00.000Z',
      roleChangeLogs: [],
      sessionAttendances,
      users,
    });

    assert.equal(analytics.recentEndedSessionCount, 2);
    assert.equal(analytics.attendanceOpportunityCount, 3);
    assert.equal(analytics.attendedSessionCount, 1);
    assert.equal(analytics.derivedAbsentSessionCount, 2);
    assert.equal(analytics.recentAttendanceRate, 33);
    assert.deepEqual(analytics.activityFunnels, [
      {
        activityId: 'activity-event',
        appliedCount: 0,
        approvedCount: 2,
        attendanceRate: 50,
        attendedCount: 1,
        derivedAbsentCount: 1,
        hasEnded: true,
        title: 'Past Event',
        type: 'event',
      },
      {
        activityId: 'activity-study',
        appliedCount: 0,
        approvedCount: 1,
        attendanceRate: 0,
        attendedCount: 0,
        derivedAbsentCount: 1,
        hasEnded: true,
        title: 'Past Study',
        type: 'study',
      },
      {
        activityId: 'activity-future',
        appliedCount: 1,
        approvedCount: 0,
        attendanceRate: 0,
        attendedCount: 0,
        derivedAbsentCount: 0,
        hasEnded: false,
        title: 'Future Event',
        type: 'event',
      },
    ]);
    assert.deepEqual(analytics.activityTypeAttendanceRates, [
      {
        approvedCount: 2,
        attendanceRate: 50,
        attendedCount: 1,
        derivedAbsentCount: 1,
        type: 'event',
      },
      {
        approvedCount: 1,
        attendanceRate: 0,
        attendedCount: 0,
        derivedAbsentCount: 1,
        type: 'study',
      },
    ]);
    assert.deepEqual(analytics.lowParticipationMembers, [
      {
        absentCount: 2,
        approvedCount: 2,
        attendanceRate: 0,
        attendedCount: 0,
        displayName: 'Team Member',
        userId: 'team-member-1',
      },
    ]);
  });
});
