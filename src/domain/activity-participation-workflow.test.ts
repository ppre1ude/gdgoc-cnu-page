import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Activity } from './activity.ts';
import {
  applyForActivity,
  approveApplicationForActivity,
  createInMemoryActivityApplicationStore,
} from './activity-participation-service.ts';
import {
  createInMemoryActivitySessionStore,
  createInMemorySessionAttendanceStore,
  markAttendanceForSession,
} from './activity-session.ts';
import { buildActivityParticipationSnapshot } from './activity-participation-workflow.ts';

describe('activity participation workflow snapshot', () => {
  it('loads applications, default sessions, attendances, and summaries by activity', async () => {
    const scheduledActivity = activityFixture({
      id: 'activity-scheduled',
      startsAt: '2026-05-16T04:00:00.000Z',
      title: 'Scheduled Activity',
      type: 'event',
    });
    const unscheduledActivity = activityFixture({
      id: 'activity-unscheduled',
      title: 'Unscheduled Study',
      type: 'study',
    });
    const applicationStore = createInMemoryActivityApplicationStore();
    const sessionStore = createInMemoryActivitySessionStore();
    const attendanceStore = createInMemorySessionAttendanceStore();

    await applyForActivity(applicationStore, {
      activityId: scheduledActivity.id,
      now: '2026-05-15T01:00:00.000Z',
      userId: 'member-1',
    });
    const approvedApplication = await approveApplicationForActivity(
      applicationStore,
      {
        activityId: scheduledActivity.id,
        now: '2026-05-15T02:00:00.000Z',
        userId: 'member-1',
      },
    );
    await applyForActivity(applicationStore, {
      activityId: scheduledActivity.id,
      now: '2026-05-15T03:00:00.000Z',
      userId: 'member-2',
    });
    await applyForActivity(applicationStore, {
      activityId: unscheduledActivity.id,
      now: '2026-05-15T04:00:00.000Z',
      userId: 'member-3',
    });

    const seededSnapshot = await buildActivityParticipationSnapshot({
      activities: [scheduledActivity, unscheduledActivity],
      applicationStore,
      attendanceStore,
      now: '2026-05-16T05:30:00.000Z',
      sessionStore,
    });
    const scheduledSession =
      seededSnapshot.sessionsByActivity[scheduledActivity.id];

    assert.ok(scheduledSession);

    await markAttendanceForSession(attendanceStore, {
      activityType: scheduledActivity.type,
      application: approvedApplication,
      now: '2026-05-16T05:40:00.000Z',
      roleSnapshot: 'member',
      session: scheduledSession,
    });

    const snapshot = await buildActivityParticipationSnapshot({
      activities: [scheduledActivity, unscheduledActivity],
      applicationStore,
      attendanceStore,
      now: '2026-05-16T07:00:00.000Z',
      sessionStore,
    });

    assert.deepEqual(
      snapshot.applicationsByActivity[scheduledActivity.id].map(
        (application) => [application.userId, application.state],
      ),
      [
        ['member-1', 'approved'],
        ['member-2', 'applied'],
      ],
    );
    assert.deepEqual(
      snapshot.applicationsByActivity[unscheduledActivity.id].map(
        (application) => application.userId,
      ),
      ['member-3'],
    );
    assert.equal(
      snapshot.sessionsByActivity[scheduledActivity.id]?.id,
      'activity-scheduled_default-session',
    );
    assert.equal(snapshot.sessionsByActivity[unscheduledActivity.id], null);
    assert.deepEqual(
      snapshot.attendancesBySession['activity-scheduled_default-session'].map(
        (attendance) => attendance.userId,
      ),
      ['member-1'],
    );
    assert.deepEqual(
      snapshot.attendedUserIdsBySession['activity-scheduled_default-session'],
      ['member-1'],
    );
    assert.deepEqual(snapshot.summariesByActivity[scheduledActivity.id], {
      appliedCount: 1,
      approvedCount: 1,
      attendedCount: 1,
      derivedAbsentCount: 0,
      hasEnded: true,
    });
    assert.equal(snapshot.summariesByActivity[unscheduledActivity.id], null);
    assert.deepEqual(
      snapshot.sessions.map((session) => session.id),
      ['activity-scheduled_default-session'],
    );
    assert.deepEqual(
      snapshot.applications.map((application) => application.userId),
      ['member-1', 'member-2', 'member-3'],
    );
    assert.deepEqual(
      snapshot.sessionAttendances.map((attendance) => attendance.userId),
      ['member-1'],
    );
  });
});

function activityFixture(overrides: Partial<Activity>): Activity {
  return {
    createdAt: '2026-05-10T00:00:00.000Z',
    id: 'activity',
    registrationMode: 'internal',
    status: 'published',
    summary: 'Activity summary',
    title: 'Activity',
    type: 'event',
    updatedAt: '2026-05-10T00:00:00.000Z',
    visibility: 'member',
    ...overrides,
  };
}
