import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyForActivity,
  approveApplicationForActivity,
  cancelApplicationForActivity,
  createInMemoryActivityApplicationStore,
  getCancelledActivityIdsByUser,
  getApplicationStateByActivity,
  listApplicationsForActivity,
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

    assert.deepEqual(await getApplicationStateByActivity(store, 'member-1'), {});
    assert.deepEqual(await listApplicationsForActivity(store, 'activity-1'), []);
    assert.deepEqual(await getCancelledActivityIdsByUser(store, 'member-1'), [
      'activity-1',
    ]);
  });

  it('lets a member reapply after cancelling with a fresh approval state', async () => {
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

    const reapplied = await applyForActivity(store, {
      activityId: 'activity-1',
      userId: 'member-1',
      now: '2026-05-11T14:00:00.000Z',
    });

    assert.equal(reapplied.state, 'applied');
    assert.equal(reapplied.cancelledAt, undefined);
    assert.equal(reapplied.createdAt, '2026-05-11T14:00:00.000Z');
    assert.deepEqual(await getApplicationStateByActivity(store, 'member-1'), {
      'activity-1': 'applied',
    });
  });

  it('lets an operator list applications for an activity and approve one', async () => {
    const store = createInMemoryActivityApplicationStore();

    await applyForActivity(store, {
      activityId: 'activity-1',
      userId: 'member-1',
      now: '2026-05-11T12:00:00.000Z',
    });

    assert.deepEqual(
      (await listApplicationsForActivity(store, 'activity-1')).map(
        (application) => application.state,
      ),
      ['applied'],
    );

    await approveApplicationForActivity(store, {
      activityId: 'activity-1',
      now: '2026-05-11T14:00:00.000Z',
      userId: 'member-1',
    });

    assert.deepEqual(await getApplicationStateByActivity(store, 'member-1'), {
      'activity-1': 'approved',
    });
  });
});
