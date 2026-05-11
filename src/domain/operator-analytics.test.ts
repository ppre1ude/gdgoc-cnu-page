import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ActivityApplication } from './activity-application.ts';
import type { ChapterUser, RoleChangeLog } from './chapter-user.ts';
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
        approvedApplicationCount: 1,
        applicationApprovalRate: 50,
        pendingApplicationCount: 1,
        pendingGuestCount: 1,
        roleChangeLogCount: 1,
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
});
