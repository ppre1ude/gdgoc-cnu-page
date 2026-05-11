import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ACTIVITY_APPLICATION_STATES,
  applyToActivity,
  approveActivityApplication,
  cancelActivityApplication,
  isActivityApplicationState,
} from './activity-application.ts';

const appliedApplication = () =>
  applyToActivity({
    activityId: 'activity-1',
    userId: 'member-1',
    now: '2026-05-11T11:00:00.000Z',
  });

describe('activity application state', () => {
  it('lets a member apply to an activity with applied state', () => {
    const application = appliedApplication();

    assert.equal(application.activityId, 'activity-1');
    assert.equal(application.userId, 'member-1');
    assert.equal(application.state, 'applied');
    assert.equal(application.createdAt, '2026-05-11T11:00:00.000Z');
    assert.equal(application.updatedAt, '2026-05-11T11:00:00.000Z');
  });

  it('marks an applied application as cancelled without adding a cancelled state', () => {
    const application = appliedApplication();

    const cancelled = cancelActivityApplication(application, {
      cancellationAllowed: true,
      now: '2026-05-11T12:00:00.000Z',
    });

    assert.equal(cancelled.state, 'applied');
    assert.equal(cancelled.cancelledAt, '2026-05-11T12:00:00.000Z');
    assert.equal(cancelled.updatedAt, '2026-05-11T12:00:00.000Z');
  });

  it('marks an approved application as cancelled without adding a cancelled state', () => {
    const application = appliedApplication();
    const approved = approveActivityApplication(application, {
      now: '2026-05-11T12:00:00.000Z',
    });

    const cancelled = cancelActivityApplication(approved, {
      cancellationAllowed: true,
      now: '2026-05-11T13:00:00.000Z',
    });

    assert.equal(cancelled.state, 'approved');
    assert.equal(cancelled.cancelledAt, '2026-05-11T13:00:00.000Z');
    assert.equal(cancelled.updatedAt, '2026-05-11T13:00:00.000Z');
  });

  it('throws when cancellation is not allowed', () => {
    const application = appliedApplication();

    assert.throws(
      () =>
        cancelActivityApplication(application, {
          cancellationAllowed: false,
          now: '2026-05-11T12:00:00.000Z',
        }),
      /Cancellation is not allowed/,
    );
  });

  it('throws when cancelling an application that is already cancelled', () => {
    const application = appliedApplication();
    const cancelled = cancelActivityApplication(application, {
      cancellationAllowed: true,
      now: '2026-05-11T12:00:00.000Z',
    });

    assert.throws(
      () =>
        cancelActivityApplication(cancelled, {
          cancellationAllowed: true,
          now: '2026-05-11T13:00:00.000Z',
        }),
      /Application is already cancelled/,
    );
  });

  it('throws when approving an application that was cancelled', () => {
    const application = appliedApplication();
    const cancelled = cancelActivityApplication(application, {
      cancellationAllowed: true,
      now: '2026-05-11T12:00:00.000Z',
    });

    assert.throws(
      () =>
        approveActivityApplication(cancelled, {
          now: '2026-05-11T13:00:00.000Z',
        }),
      /Cannot approve a cancelled application/,
    );
  });

  it('defines only applied and approved as application states', () => {
    assert.deepEqual(ACTIVITY_APPLICATION_STATES, ['applied', 'approved']);
    assert.equal(isActivityApplicationState('applied'), true);
    assert.equal(isActivityApplicationState('approved'), true);
    assert.equal(isActivityApplicationState('cancelled'), false);
    assert.equal(isActivityApplicationState('rejected'), false);
    assert.equal(isActivityApplicationState('absent'), false);
  });
});
