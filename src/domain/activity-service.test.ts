import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createActivity,
  createInMemoryActivityStore,
  getVisibleActivityById,
  listHomeActivities,
} from './activity-service.ts';
import type { Activity } from './activity.ts';

describe('activity authoring flow', () => {
  it('lets an operator create an activity that appears in the member home list', async () => {
    const store = createInMemoryActivityStore();

    const activity = await createActivity(store, {
      actorRole: 'team_member',
      title: 'Build with AI Prototype Sprint',
      summary: 'Firebase와 Gemini로 챕터 홈페이지의 핵심 흐름을 만든다.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-16T04:00:00.000Z',
      registrationMode: 'hybrid',
      externalRegistrationUrl: 'https://gdg.community.dev/events/example',
      externalRegistrationLabel: 'gdg.community.dev 등록',
      now: '2026-05-11T09:00:00.000Z',
    });

    const memberHomeActivities = await listHomeActivities(store, 'member');

    assert.equal(memberHomeActivities.length, 1);
    assert.equal(memberHomeActivities[0]?.id, activity.id);
    assert.equal(memberHomeActivities[0]?.title, 'Build with AI Prototype Sprint');
    assert.equal(memberHomeActivities[0]?.registrationMode, 'hybrid');
    assert.equal(
      memberHomeActivities[0]?.externalRegistrationUrl,
      'https://gdg.community.dev/events/example',
    );
  });
});

describe('activity detail lookup', () => {
  const publishedActivity: Activity = {
    id: 'activity-public',
    title: 'Build with AI Prototype Sprint',
    summary: 'Firebase and Gemini demo activity.',
    type: 'event',
    visibility: 'public',
    status: 'published',
    startsAt: '2026-05-16T04:00:00.000Z',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  };

  it('returns a visible activity detail for the current role', async () => {
    const store = createInMemoryActivityStore([publishedActivity]);

    const activity = await getVisibleActivityById(
      store,
      'activity-public',
      'visitor',
    );

    assert.equal(activity?.id, 'activity-public');
  });

  it('hides member-only activity detail from visitors', async () => {
    const store = createInMemoryActivityStore([
      {
        ...publishedActivity,
        id: 'activity-member',
        visibility: 'member',
      },
    ]);

    const activity = await getVisibleActivityById(
      store,
      'activity-member',
      'visitor',
    );

    assert.equal(activity, null);
  });

  it('does not return draft activity detail', async () => {
    const store = createInMemoryActivityStore([
      {
        ...publishedActivity,
        id: 'activity-draft',
        status: 'draft',
      },
    ]);

    const activity = await getVisibleActivityById(
      store,
      'activity-draft',
      'admin',
    );

    assert.equal(activity, null);
  });
});
