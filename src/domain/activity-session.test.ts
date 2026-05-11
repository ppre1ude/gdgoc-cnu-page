import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ActivityApplication } from './activity-application.ts';
import {
  createActivitySession,
  createInMemorySessionAttendanceStore,
  markAttendanceForSession,
  recordSessionAttendance,
  summarizeSessionAttendance,
} from './activity-session.ts';

const approvedApplication: ActivityApplication = {
  id: 'activity-1_member-1',
  activityId: 'activity-1',
  userId: 'member-1',
  state: 'approved',
  createdAt: '2026-05-11T09:00:00.000Z',
  updatedAt: '2026-05-11T09:30:00.000Z',
};

const appliedApplication: ActivityApplication = {
  ...approvedApplication,
  id: 'activity-1_member-2',
  userId: 'member-2',
  state: 'applied',
};

const cancelledApprovedApplication: ActivityApplication = {
  ...approvedApplication,
  id: 'activity-1_member-3',
  userId: 'member-3',
  cancelledAt: '2026-05-11T10:00:00.000Z',
};

const session = createActivitySession({
  activityId: 'activity-1',
  endsAt: '2026-05-16T06:00:00.000Z',
  now: '2026-05-11T09:00:00.000Z',
  startsAt: '2026-05-16T04:00:00.000Z',
  title: 'Build with AI Prototype Sprint',
});

describe('activity session attendance', () => {
  it('records attended state only for an approved active application', () => {
    const attendance = recordSessionAttendance(approvedApplication, session, {
      activityType: 'event',
      now: '2026-05-16T05:30:00.000Z',
      roleSnapshot: 'member',
    });

    assert.deepEqual(attendance, {
      id: `${session.id}_member-1`,
      activityId: 'activity-1',
      activityType: 'event',
      createdAt: '2026-05-16T05:30:00.000Z',
      roleSnapshot: 'member',
      sessionId: session.id,
      state: 'attended',
      updatedAt: '2026-05-16T05:30:00.000Z',
      userId: 'member-1',
    });
  });

  it('does not record attendance for pending or cancelled applications', () => {
    assert.throws(
      () =>
        recordSessionAttendance(appliedApplication, session, {
          activityType: 'event',
          now: '2026-05-16T05:30:00.000Z',
          roleSnapshot: 'member',
        }),
      /Only approved applications can be marked attended/,
    );

    assert.throws(
      () =>
        recordSessionAttendance(cancelledApprovedApplication, session, {
          activityType: 'event',
          now: '2026-05-16T05:30:00.000Z',
          roleSnapshot: 'member',
        }),
      /Cancelled applications cannot be marked attended/,
    );
  });

  it('derives absent count after the session ends without storing absent state', () => {
    const attended = recordSessionAttendance(approvedApplication, session, {
      activityType: 'event',
      now: '2026-05-16T05:30:00.000Z',
      roleSnapshot: 'member',
    });

    const summary = summarizeSessionAttendance({
      applications: [
        approvedApplication,
        {
          ...approvedApplication,
          id: 'activity-1_member-4',
          userId: 'member-4',
        },
        appliedApplication,
        cancelledApprovedApplication,
      ],
      attendances: [attended],
      now: '2026-05-16T07:00:00.000Z',
      session,
    });

    assert.deepEqual(summary, {
      appliedCount: 1,
      approvedCount: 2,
      attendedCount: 1,
      derivedAbsentCount: 1,
      hasEnded: true,
    });
  });

  it('does not derive absence before the session ends', () => {
    const summary = summarizeSessionAttendance({
      applications: [approvedApplication],
      attendances: [],
      now: '2026-05-16T05:00:00.000Z',
      session,
    });

    assert.equal(summary.derivedAbsentCount, 0);
    assert.equal(summary.hasEnded, false);
  });

  it('stores attendance through the session attendance store', async () => {
    const store = createInMemorySessionAttendanceStore();

    const attendance = await markAttendanceForSession(store, {
      activityType: 'event',
      application: approvedApplication,
      now: '2026-05-16T05:30:00.000Z',
      roleSnapshot: 'member',
      session,
    });

    assert.deepEqual(await store.listBySession(session.id), [attendance]);
    assert.deepEqual(
      await store.findBySessionAndUser(session.id, 'member-1'),
      attendance,
    );
  });
});
