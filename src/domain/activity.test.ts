import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getActivityRegistrationPolicy,
  listVisibleActivities,
  type Activity,
  type UserRole,
} from './activity.ts';

const baseActivity = {
  id: 'activity-1',
  title: 'Build with AI Prototype Sprint',
  summary: 'Gemini와 Firebase로 초기 프로토타입을 만드는 활동입니다.',
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

describe('getActivityRegistrationPolicy', () => {
  it('defaults missing registration mode to internal application', () => {
    const activity: Activity = {
      ...baseActivity,
      visibility: 'public',
    };

    assert.deepEqual(getActivityRegistrationPolicy(activity), {
      registrationMode: 'internal',
      canApplyInternally: true,
      externalRegistrationUrl: undefined,
      externalRegistrationLabel: '공식 등록 페이지',
    });
  });

  it('uses external registration only for external mode', () => {
    const activity: Activity = {
      ...baseActivity,
      visibility: 'public',
      registrationMode: 'external',
      externalRegistrationUrl: 'https://gdg.community.dev/events/example',
      externalRegistrationLabel: 'GDG 이벤트 등록',
    };

    assert.deepEqual(getActivityRegistrationPolicy(activity), {
      registrationMode: 'external',
      canApplyInternally: false,
      externalRegistrationUrl: 'https://gdg.community.dev/events/example',
      externalRegistrationLabel: 'GDG 이벤트 등록',
    });
  });

  it('allows both internal and external registration for hybrid mode', () => {
    const activity: Activity = {
      ...baseActivity,
      visibility: 'public',
      registrationMode: 'hybrid',
      externalRegistrationUrl: 'https://forms.gle/example',
    };

    assert.deepEqual(getActivityRegistrationPolicy(activity), {
      registrationMode: 'hybrid',
      canApplyInternally: true,
      externalRegistrationUrl: 'https://forms.gle/example',
      externalRegistrationLabel: '공식 등록 페이지',
    });
  });

  it('disables internal and external registration for none mode', () => {
    const activity: Activity = {
      ...baseActivity,
      visibility: 'public',
      registrationMode: 'none',
      externalRegistrationUrl: 'https://forms.gle/example',
      externalRegistrationLabel: 'Ignored link',
    };

    assert.deepEqual(getActivityRegistrationPolicy(activity), {
      registrationMode: 'none',
      canApplyInternally: false,
      externalRegistrationUrl: undefined,
      externalRegistrationLabel: '공식 등록 페이지',
    });
  });
});
