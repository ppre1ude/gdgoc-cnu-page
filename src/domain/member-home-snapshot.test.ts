import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Activity } from './activity.ts';
import {
  createInMemoryActivityStore,
} from './activity-service.ts';
import {
  applyForActivity,
  createInMemoryActivityApplicationStore,
} from './activity-participation-service.ts';
import type { ChapterRecord } from './chapter-record.ts';
import {
  createInMemoryChapterRecordStore,
} from './chapter-record-service.ts';
import type { Notice } from './notice.ts';
import { createInMemoryNoticeStore } from './notice-service.ts';
import type { Showcase } from './showcase.ts';
import { createInMemoryShowcaseStore } from './showcase-service.ts';
import {
  buildMemberHomeSnapshot,
  isMemberHomeSnapshotCurrent,
} from './member-home-snapshot.ts';

describe('member home snapshot', () => {
  it('loads member-visible home sections with current member application state', async () => {
    const stores = createSnapshotStores();
    await applyForActivity(stores.applicationStore, {
      activityId: 'member-event',
      now: '2026-05-15T09:30:00.000Z',
      userId: 'member-1',
    });
    await applyForActivity(stores.applicationStore, {
      activityId: 'past-project',
      now: '2026-05-14T09:30:00.000Z',
      userId: 'member-1',
    });

    const snapshot = await buildMemberHomeSnapshot({
      ...stores,
      now: '2026-05-15T06:00:00.000Z',
      role: 'member',
      userId: 'member-1',
    });

    assert.equal(snapshot.access.status, 'active_member');
    assert.equal(snapshot.role, 'member');
    assert.equal(snapshot.userId, 'member-1');
    assert.equal(snapshot.contentRole, 'member');
    assertIdsInclude(snapshot.activities, [
      'public-event',
      'member-event',
      'member-study',
      'member-project',
      'member-social',
      'past-project',
    ]);
    assert.deepEqual(
      snapshot.sections.upcomingActivities.map((activity) => activity.id),
      ['past-project', 'member-project', 'public-event', 'member-event'],
    );
    assert.deepEqual(
      snapshot.sections.studiesAndProjects.map((activity) => activity.id),
      ['past-project', 'member-project', 'member-study'],
    );
    assert.deepEqual(
      snapshot.sections.challengesAndSocialActivities.map((activity) => activity.id),
      ['member-social'],
    );
    assert.deepEqual(snapshot.applicationStates, {
      'member-event': 'applied',
      'past-project': 'applied',
    });
    assert.equal(snapshot.activeApplicationCount, 2);
    assert.deepEqual(
      snapshot.memberApplicationSummaries.map(({ activity, state }) => [
        activity.id,
        state,
      ]),
      [
        ['past-project', 'applied'],
        ['member-event', 'applied'],
      ],
    );
    assert.deepEqual(
      snapshot.dashboard.calendarActivities.map((activity) => activity.id),
      ['member-project', 'member-event'],
    );
    assert.deepEqual(
      snapshot.dashboard.importantNotices.map((notice) => notice.id),
      ['pinned-member-notice', 'recent-member-notice', 'public-notice'],
    );
    assert.deepEqual(
      snapshot.dashboard.myNextCommitments.map(({ activity }) => activity.id),
      ['member-event'],
    );
    assert.deepEqual(
      snapshot.dashboard.openStudyProjects.map((activity) => activity.id),
      ['member-project', 'member-study'],
    );
    assert.deepEqual(
      snapshot.notices.map((notice) => notice.id),
      ['pinned-member-notice', 'recent-member-notice', 'public-notice'],
    );
    assert.deepEqual(
      snapshot.showcases.map((showcase) => showcase.id),
      ['member-showcase', 'public-showcase'],
    );
    assert.deepEqual(
      snapshot.records.map((record) => record.id),
      ['member-record', 'public-record'],
    );
  });

  it('keeps guests on public content without application state', async () => {
    const stores = createSnapshotStores();

    const snapshot = await buildMemberHomeSnapshot({
      ...stores,
      role: 'guest',
      userId: 'guest-1',
    });

    assert.equal(snapshot.access.status, 'pending_approval');
    assert.equal(snapshot.contentRole, 'guest');
    assert.deepEqual(
      snapshot.activities.map((activity) => activity.id),
      ['public-event'],
    );
    assert.deepEqual(snapshot.applicationStates, {});
    assert.equal(snapshot.activeApplicationCount, 0);
    assert.deepEqual(snapshot.memberApplicationSummaries, []);
    assert.deepEqual(
      snapshot.notices.map((notice) => notice.id),
      ['public-notice'],
    );
  });

  it('lets alumni read member content without enabling applications', async () => {
    const stores = createSnapshotStores();
    await applyForActivity(stores.applicationStore, {
      activityId: 'member-event',
      now: '2026-05-15T09:30:00.000Z',
      userId: 'alumni-1',
    });

    const snapshot = await buildMemberHomeSnapshot({
      ...stores,
      role: 'alumni',
      userId: 'alumni-1',
    });

    assert.equal(snapshot.access.status, 'alumni');
    assert.equal(snapshot.contentRole, 'member');
    assertIdsInclude(snapshot.activities, [
      'public-event',
      'member-event',
      'member-study',
      'member-project',
      'member-social',
      'past-project',
    ]);
    assert.deepEqual(snapshot.applicationStates, {});
    assert.equal(snapshot.activeApplicationCount, 0);
    assert.deepEqual(snapshot.memberApplicationSummaries, []);
  });

  it('marks a snapshot stale when the current role or user changes', async () => {
    const stores = createSnapshotStores();
    const snapshot = await buildMemberHomeSnapshot({
      ...stores,
      role: 'member',
      userId: 'member-1',
    });

    assert.equal(
      isMemberHomeSnapshotCurrent(snapshot, {
        role: 'member',
        userId: 'member-1',
      }),
      true,
    );
    assert.equal(
      isMemberHomeSnapshotCurrent(snapshot, {
        role: 'guest',
        userId: 'member-1',
      }),
      false,
    );
    assert.equal(
      isMemberHomeSnapshotCurrent(snapshot, {
        role: 'member',
        userId: 'member-2',
      }),
      false,
    );
  });
});

function createSnapshotStores() {
  return {
    activityStore: createInMemoryActivityStore([
      activityFixture({
        id: 'member-event',
        startsAt: '2026-05-16T04:00:00.000Z',
        title: 'Member Event',
        type: 'event',
        visibility: 'member',
      }),
      activityFixture({
        id: 'public-event',
        startsAt: '2026-05-15T04:00:00.000Z',
        title: 'Public Event',
        type: 'event',
        visibility: 'public',
      }),
      activityFixture({
        id: 'member-study',
        title: 'Member Study',
        type: 'study',
        visibility: 'member',
      }),
      activityFixture({
        id: 'member-project',
        startsAt: '2026-05-15T08:00:00.000Z',
        title: 'Member Project',
        type: 'project',
        visibility: 'member',
      }),
      activityFixture({
        id: 'past-project',
        startsAt: '2026-05-14T08:00:00.000Z',
        title: 'Past Project',
        type: 'project',
        visibility: 'member',
      }),
      activityFixture({
        id: 'member-social',
        title: 'Member Social',
        type: 'social',
        visibility: 'member',
      }),
      activityFixture({
        id: 'operator-event',
        startsAt: '2026-05-17T04:00:00.000Z',
        title: 'Operator Event',
        type: 'event',
        visibility: 'operator',
      }),
    ]),
    applicationStore: createInMemoryActivityApplicationStore(),
    noticeStore: createInMemoryNoticeStore([
      noticeFixture({
        id: 'public-notice',
        pinned: false,
        title: 'Public Notice',
        updatedAt: '2026-05-15T01:00:00.000Z',
        visibility: 'public',
      }),
      noticeFixture({
        id: 'pinned-member-notice',
        pinned: true,
        title: 'Pinned Member Notice',
        updatedAt: '2026-05-14T01:00:00.000Z',
        visibility: 'member',
      }),
      noticeFixture({
        id: 'recent-member-notice',
        pinned: false,
        title: 'Recent Member Notice',
        updatedAt: '2026-05-16T01:00:00.000Z',
        visibility: 'member',
      }),
      noticeFixture({
        id: 'operator-notice',
        pinned: true,
        title: 'Operator Notice',
        updatedAt: '2026-05-16T01:00:00.000Z',
        visibility: 'operator',
      }),
    ]),
    recordStore: createInMemoryChapterRecordStore([
      recordFixture({
        id: 'public-record',
        publishedAt: '2026-05-14T01:00:00.000Z',
        title: 'Public Record',
        visibility: 'public',
      }),
      recordFixture({
        id: 'member-record',
        publishedAt: '2026-05-15T01:00:00.000Z',
        title: 'Member Record',
        visibility: 'member',
      }),
      recordFixture({
        id: 'operator-record',
        publishedAt: '2026-05-16T01:00:00.000Z',
        title: 'Operator Record',
        visibility: 'operator',
      }),
    ]),
    showcaseStore: createInMemoryShowcaseStore([
      showcaseFixture({
        id: 'public-showcase',
        publishedAt: '2026-05-14T01:00:00.000Z',
        title: 'Public Showcase',
        visibility: 'public',
      }),
      showcaseFixture({
        id: 'member-showcase',
        publishedAt: '2026-05-15T01:00:00.000Z',
        title: 'Member Showcase',
        visibility: 'member',
      }),
      showcaseFixture({
        id: 'operator-showcase',
        publishedAt: '2026-05-16T01:00:00.000Z',
        title: 'Operator Showcase',
        visibility: 'operator',
      }),
    ]),
  };
}

function assertIdsInclude(
  values: { id: string }[],
  expectedIds: string[],
) {
  assert.deepEqual(
    new Set(values.map((value) => value.id)),
    new Set(expectedIds),
  );
}

function activityFixture(overrides: Partial<Activity>): Activity {
  return {
    createdAt: '2026-05-10T00:00:00.000Z',
    id: 'activity',
    registrationMode: 'internal',
    status: 'published',
    summary: 'Activity summary',
    title: 'Activity',
    type: 'event',
    updatedAt: '2026-05-10T00:00:00.000Z',
    visibility: 'member',
    ...overrides,
  };
}

function noticeFixture(overrides: Partial<Notice>): Notice {
  return {
    body: 'Notice body',
    createdAt: '2026-05-10T00:00:00.000Z',
    id: 'notice',
    pinned: false,
    status: 'published',
    title: 'Notice',
    updatedAt: '2026-05-10T00:00:00.000Z',
    visibility: 'member',
    ...overrides,
  };
}

function showcaseFixture(overrides: Partial<Showcase>): Showcase {
  return {
    createdAt: '2026-05-10T00:00:00.000Z',
    id: 'showcase',
    kind: 'achievement',
    publishedAt: '2026-05-10T00:00:00.000Z',
    status: 'published',
    summary: 'Showcase summary',
    tags: [],
    title: 'Showcase',
    updatedAt: '2026-05-10T00:00:00.000Z',
    visibility: 'member',
    ...overrides,
  };
}

function recordFixture(overrides: Partial<ChapterRecord>): ChapterRecord {
  return {
    authorUserId: 'member-1',
    body: 'Record body',
    createdAt: '2026-05-10T00:00:00.000Z',
    id: 'record',
    kind: 'retrospective',
    publishedAt: '2026-05-10T00:00:00.000Z',
    showcaseCandidate: false,
    status: 'published',
    summary: 'Record summary',
    tags: [],
    title: 'Record',
    updatedAt: '2026-05-10T00:00:00.000Z',
    visibility: 'member',
    ...overrides,
  };
}
