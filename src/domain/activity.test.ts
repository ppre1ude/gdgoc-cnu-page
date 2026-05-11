import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listVisibleActivities,
  type Activity,
  type UserRole,
} from './activity.ts';

const baseActivity = {
  id: 'activity-1',
  title: 'Build with AI Prototype Sprint',
  summary: 'Gemini와 Firebase로 프로토타입을 만든다.',
  type: 'event',
  status: 'published',
  startsAt: '2026-05-16T04:00:00.000Z',
  createdAt: '2026-05-11T09:00:00.000Z',
  updatedAt: '2026-05-11T09:00:00.000Z',
} satisfies Omit<Activity, 'visibility'>;

describe('listVisibleActivities', () => {
  it('shows only public published activities to visitors and member-visible activities to members', () => {
    const activities: Activity[] = [
      { ...baseActivity, id: 'public', visibility: 'public' },
      { ...baseActivity, id: 'member', visibility: 'member' },
      { ...baseActivity, id: 'operator', visibility: 'operator' },
      {
        ...baseActivity,
        id: 'draft',
        visibility: 'public',
        status: 'draft',
      },
    ];

    const idsFor = (role: UserRole) =>
      listVisibleActivities(activities, role).map((activity) => activity.id);

    assert.deepEqual(idsFor('visitor'), ['public']);
    assert.deepEqual(idsFor('member'), ['public', 'member']);
  });
});
