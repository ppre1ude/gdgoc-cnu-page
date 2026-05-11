import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createActivity,
  createInMemoryActivityStore,
  listHomeActivities,
} from './activity-service.ts';

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
