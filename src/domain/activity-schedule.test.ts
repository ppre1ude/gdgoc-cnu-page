import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Activity } from './activity.ts';
import {
  getActivitySchedule,
  getDefaultActivitySessionDraft,
  isActivityUpcoming,
  isSessionRecentlyEnded,
  shouldSyncDefaultActivitySession,
} from './activity-schedule.ts';

describe('activity schedule module', () => {
  it('describes a scheduled activity and its default two-hour session window', () => {
    const activity = activityFixture({
      id: 'activity-1',
      startsAt: '2026-05-16T04:00:00.000Z',
      title: 'Build with AI Sprint',
    });

    assert.deepEqual(getActivitySchedule(activity), {
      activityId: 'activity-1',
      createdAt: '2026-05-11T09:00:00.000Z',
      defaultSessionEndsAt: '2026-05-16T06:00:00.000Z',
      defaultSessionId: 'activity-1_default-session',
      kind: 'scheduled',
      startsAt: '2026-05-16T04:00:00.000Z',
      title: 'Build with AI Sprint',
      updatedAt: '2026-05-11T09:00:00.000Z',
    });
  });

  it('keeps unscheduled activities out of default session creation', () => {
    const activity = activityFixture({
      id: 'activity-unscheduled',
      title: 'Open Project',
    });

    assert.deepEqual(getActivitySchedule(activity), {
      activityId: 'activity-unscheduled',
      createdAt: '2026-05-11T09:00:00.000Z',
      kind: 'unscheduled',
      title: 'Open Project',
      updatedAt: '2026-05-11T09:00:00.000Z',
    });
    assert.equal(getDefaultActivitySessionDraft(activity), null);
  });

  it('creates the default session draft from the activity schedule', () => {
    const activity = activityFixture({
      startsAt: '2026-05-16T04:00:00.000Z',
    });

    assert.deepEqual(getDefaultActivitySessionDraft(activity), {
      activityId: 'activity',
      createdAt: '2026-05-11T09:00:00.000Z',
      endsAt: '2026-05-16T06:00:00.000Z',
      id: 'activity_default-session',
      startsAt: '2026-05-16T04:00:00.000Z',
      title: 'Activity',
      updatedAt: '2026-05-11T09:00:00.000Z',
    });
  });

  it('detects when a saved default session is stale', () => {
    const draft = getDefaultActivitySessionDraft(
      activityFixture({
        startsAt: '2026-05-16T04:00:00.000Z',
        title: 'New Title',
        updatedAt: '2026-05-12T09:00:00.000Z',
      }),
    );

    assert.ok(draft);
    assert.equal(
      shouldSyncDefaultActivitySession(
        {
          ...draft,
          title: 'Old Title',
        },
        draft,
      ),
      true,
    );
    assert.equal(
      shouldSyncDefaultActivitySession(
        {
          ...draft,
          startsAt: '2026-05-16T03:00:00.000Z',
        },
        draft,
      ),
      true,
    );
    assert.equal(
      shouldSyncDefaultActivitySession(
        {
          ...draft,
          endsAt: '2026-05-16T05:00:00.000Z',
        },
        draft,
      ),
      true,
    );
    assert.equal(
      shouldSyncDefaultActivitySession(
        {
          ...draft,
          updatedAt: '2026-05-11T09:00:00.000Z',
        },
        draft,
      ),
      true,
    );
    assert.equal(shouldSyncDefaultActivitySession(draft, draft), false);
  });

  it('classifies upcoming activities and recently ended sessions', () => {
    const activity = activityFixture({
      startsAt: '2026-05-20T09:00:00.000Z',
    });
    const session = {
      activityId: 'activity',
      endsAt: '2026-05-14T09:00:00.000Z',
      id: 'session-1',
      startsAt: '2026-05-14T07:00:00.000Z',
    };

    assert.equal(
      isActivityUpcoming(activity, '2026-05-15T00:00:00.000Z'),
      true,
    );
    assert.equal(
      isActivityUpcoming(activity, '2026-05-21T00:00:00.000Z'),
      false,
    );
    assert.equal(
      isSessionRecentlyEnded(session, {
        now: '2026-05-15T00:00:00.000Z',
      }),
      true,
    );
    assert.equal(
      isSessionRecentlyEnded(session, {
        now: '2026-06-30T00:00:00.000Z',
        recentWindowDays: 30,
      }),
      false,
    );
  });
});

function activityFixture(overrides: Partial<Activity>): Activity {
  return {
    createdAt: '2026-05-11T09:00:00.000Z',
    id: 'activity',
    status: 'published',
    summary: 'Activity summary',
    title: 'Activity',
    type: 'event',
    updatedAt: '2026-05-11T09:00:00.000Z',
    visibility: 'member',
    ...overrides,
  };
}
