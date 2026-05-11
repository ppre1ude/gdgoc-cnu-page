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

  it('lets a member cancel an applied application when cancellation is allowed', () => {
    const application = appliedApplication();

    const cancelled = cancelActivityApplication(application, {
      cancellationAllowed: true,
      now: '2026-05-11T12:00:00.000Z',
    });

    assert.equal(cancelled.state, 'cancelled');
    assert.equal(cancelled.updatedAt, '2026-05-11T12:00:00.000Z');
  });

  it('lets a member cancel an approved application when cancellation is allowed', () => {
    const application = appliedApplication();
    const approved = approveActivityApplication(application, {
      now: '2026-05-11T12:00:00.000Z',
    });

    const cancelled = cancelActivityApplication(approved, {
      cancellationAllowed: true,
      now: '2026-05-11T13:00:00.000Z',
    });

    assert.equal(cancelled.state, 'cancelled');
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
      /Cannot cancel application from cancelled state/,
    );
  });

  it('throws when approving an application that is already cancelled', () => {
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
      /Cannot approve application from cancelled state/,
    );
  });

  it('defines only applied, approved, and cancelled as application states', () => {
    assert.deepEqual(ACTIVITY_APPLICATION_STATES, [
      'applied',
      'approved',
      'cancelled',
    ]);
    assert.equal(isActivityApplicationState('applied'), true);
    assert.equal(isActivityApplicationState('approved'), true);
    assert.equal(isActivityApplicationState('cancelled'), true);
    assert.equal(isActivityApplicationState('rejected'), false);
    assert.equal(isActivityApplicationState('absent'), false);
  });
});
