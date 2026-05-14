import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ActivityApplication } from './activity-application.ts';
import type { Activity } from './activity.ts';
import {
  createActivitySession,
  createDefaultActivitySession,
  createInMemoryActivitySessionStore,
  loadOrSyncDefaultActivitySession,
  createInMemorySessionAttendanceStore,
  markAttendanceForSession,
  recordSessionAttendance,
  summarizeSessionAttendance,
  syncDefaultActivitySession,
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
  it('creates a default two-hour session for a scheduled activity', () => {
    const activity: Activity = {
      id: 'activity-1',
      title: 'Scheduled Activity',
      summary: 'Scheduled activity summary.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-16T04:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-11T09:00:00.000Z',
    };

    assert.deepEqual(createDefaultActivitySession(activity), {
      id: 'activity-1_default-session',
      activityId: 'activity-1',
      title: 'Scheduled Activity',
      startsAt: '2026-05-16T04:00:00.000Z',
      endsAt: '2026-05-16T06:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-11T09:00:00.000Z',
    });
  });

  it('keeps the activity creation time when deriving an updated default session', () => {
    const activity: Activity = {
      id: 'activity-1',
      title: 'Updated Scheduled Activity',
      summary: 'Scheduled activity summary.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-17T04:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    };

    assert.deepEqual(createDefaultActivitySession(activity), {
      id: 'activity-1_default-session',
      activityId: 'activity-1',
      title: 'Updated Scheduled Activity',
      startsAt: '2026-05-17T04:00:00.000Z',
      endsAt: '2026-05-17T06:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    });
  });

  it('does not create a default session for an unscheduled activity', () => {
    const activity: Activity = {
      id: 'activity-1',
      title: 'Notice-like Activity',
      summary: 'No schedule yet.',
      type: 'project',
      visibility: 'member',
      status: 'published',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-11T09:00:00.000Z',
    };

    assert.equal(createDefaultActivitySession(activity), null);
  });

  it('stores and updates the default session for a scheduled activity', async () => {
    const store = createInMemoryActivitySessionStore();
    const activity: Activity = {
      id: 'activity-1',
      title: 'Build with AI Sprint',
      summary: 'Scheduled activity summary.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-16T04:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-11T09:00:00.000Z',
    };

    const firstSession = await syncDefaultActivitySession(store, activity);
    const updatedSession = await syncDefaultActivitySession(store, {
      ...activity,
      title: 'Build with AI Demo Day',
      startsAt: '2026-05-17T04:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    });

    assert.deepEqual(await store.listByActivity(activity.id), [updatedSession]);
    assert.deepEqual(updatedSession, {
      ...firstSession,
      title: 'Build with AI Demo Day',
      startsAt: '2026-05-17T04:00:00.000Z',
      endsAt: '2026-05-17T06:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    });
  });

  it('loads an already synced default session without rewriting it', async () => {
    const activity: Activity = {
      id: 'activity-1',
      title: 'Build with AI Sprint',
      summary: 'Scheduled activity summary.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-16T04:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    };
    const syncedSession = createDefaultActivitySession(activity);

    assert.ok(syncedSession);

    const store = createInMemoryActivitySessionStore([syncedSession]);

    assert.deepEqual(
      await loadOrSyncDefaultActivitySession(store, activity),
      syncedSession,
    );
  });

  it('does not store a default session for an unscheduled activity', async () => {
    const store = createInMemoryActivitySessionStore();
    const activity: Activity = {
      id: 'activity-1',
      title: 'Unscheduled Project',
      summary: 'No fixed session yet.',
      type: 'project',
      visibility: 'member',
      status: 'published',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-11T09:00:00.000Z',
    };

    assert.equal(await syncDefaultActivitySession(store, activity), null);
    assert.deepEqual(await store.listByActivity(activity.id), []);
  });

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
