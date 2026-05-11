import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyForActivity,
  cancelApplicationForActivity,
  createInMemoryActivityApplicationStore,
  getApplicationStateByActivity,
} from './activity-participation-service.ts';

describe('member activity participation flow', () => {
  it('stores a member application and exposes the applied state by activity', async () => {
    const store = createInMemoryActivityApplicationStore();

    await applyForActivity(store, {
      activityId: 'activity-1',
      userId: 'member-1',
      now: '2026-05-11T12:00:00.000Z',
    });

    assert.deepEqual(await getApplicationStateByActivity(store, 'member-1'), {
      'activity-1': 'applied',
    });
  });

  it('lets a member cancel an existing application when cancellation is allowed', async () => {
    const store = createInMemoryActivityApplicationStore();

    await applyForActivity(store, {
      activityId: 'activity-1',
      userId: 'member-1',
      now: '2026-05-11T12:00:00.000Z',
    });

    await cancelApplicationForActivity(store, {
      activityId: 'activity-1',
      cancellationAllowed: true,
      now: '2026-05-11T13:00:00.000Z',
      userId: 'member-1',
    });

    assert.deepEqual(await getApplicationStateByActivity(store, 'member-1'), {
      'activity-1': 'cancelled',
    });
  });
});
