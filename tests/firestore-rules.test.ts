import { readFileSync } from 'node:fs';
import { after, afterEach, before, describe, it } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';

let testEnvironment: RulesTestEnvironment;

const projectId = 'demo-gdgoc-cnu';

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterEach(async () => {
  await testEnvironment.clearFirestore();
});

after(async () => {
  await testEnvironment.cleanup();
});

describe('Firestore security rules', () => {
  it('lets visitors read public published activities but not member-only activities', async () => {
    await seedDocument('activities/public-demo', {
      id: 'public-demo',
      status: 'published',
      visibility: 'public',
      title: 'Public demo',
    });
    await seedDocument('activities/member-demo', {
      id: 'member-demo',
      status: 'published',
      visibility: 'member',
      title: 'Member demo',
    });

    const visitorDb = unauthenticatedDb();

    await assertSucceeds(getDoc(doc(visitorDb, 'activities', 'public-demo')));
    await assertFails(getDoc(doc(visitorDb, 'activities', 'member-demo')));
  });

  it('requires visibility-aware queries for collection reads', async () => {
    await seedDocument('activities/public-demo', {
      id: 'public-demo',
      status: 'published',
      visibility: 'public',
      title: 'Public demo',
    });
    await seedDocument('activities/member-demo', {
      id: 'member-demo',
      status: 'published',
      visibility: 'member',
      title: 'Member demo',
    });

    const visitorDb = unauthenticatedDb();

    await assertFails(getDocs(collection(visitorDb, 'activities')));
    await assertSucceeds(
      getDocs(
        query(
          collection(visitorDb, 'activities'),
          where('status', '==', 'published'),
          where('visibility', 'in', ['public']),
        ),
      ),
    );
  });

  it('lets active members create only their own activity applications', async () => {
    await seedChapterUser('member-1', 'member');
    await seedActivity('activity-1', {
      registrationMode: 'internal',
      status: 'published',
      visibility: 'member',
    });

    const memberDb = authenticatedDb('member-1');

    await assertSucceeds(
      setDoc(doc(memberDb, 'activityApplications', 'activity-1_member-1'), {
        id: 'activity-1_member-1',
        activityId: 'activity-1',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
    await assertFails(
      setDoc(doc(memberDb, 'activityApplications', 'activity-1_member-2'), {
        id: 'activity-1_member-2',
        activityId: 'activity-1',
        userId: 'member-2',
        state: 'applied',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
  });

  it('blocks member applications when an activity does not support internal application', async () => {
    await seedChapterUser('member-1', 'member');
    await seedActivity('external-activity', {
      registrationMode: 'external',
      status: 'published',
      visibility: 'member',
    });
    await seedActivity('draft-activity', {
      registrationMode: 'internal',
      status: 'draft',
      visibility: 'member',
    });

    const memberDb = authenticatedDb('member-1');

    await assertFails(
      setDoc(doc(memberDb, 'activityApplications', 'external-activity_member-1'), {
        id: 'external-activity_member-1',
        activityId: 'external-activity',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
    await assertFails(
      setDoc(doc(memberDb, 'activityApplications', 'draft-activity_member-1'), {
        id: 'draft-activity_member-1',
        activityId: 'draft-activity',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
  });

  it('blocks reactivating cancelled applications when activity registration is no longer internal', async () => {
    await seedChapterUser('member-1', 'member');
    await seedActivity('internal-activity', {
      registrationMode: 'internal',
      status: 'published',
      visibility: 'member',
    });
    await seedActivity('external-activity', {
      registrationMode: 'external',
      status: 'published',
      visibility: 'member',
    });
    await seedApplication('internal-activity_member-1', {
      activityId: 'internal-activity',
      userId: 'member-1',
      state: 'applied',
      cancelledAt: '2026-05-14T01:00:00.000Z',
    });
    await seedApplication('external-activity_member-1', {
      activityId: 'external-activity',
      userId: 'member-1',
      state: 'applied',
      cancelledAt: '2026-05-14T01:00:00.000Z',
    });

    const memberDb = authenticatedDb('member-1');

    await assertSucceeds(
      setDoc(doc(memberDb, 'activityApplications', 'internal-activity_member-1'), {
        id: 'internal-activity_member-1',
        activityId: 'internal-activity',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T02:00:00.000Z',
      }),
    );
    await assertFails(
      setDoc(doc(memberDb, 'activityApplications', 'external-activity_member-1'), {
        id: 'external-activity_member-1',
        activityId: 'external-activity',
        userId: 'member-1',
        state: 'applied',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T02:00:00.000Z',
      }),
    );
  });

  it('blocks guests from creating member-only chapter records', async () => {
    await seedChapterUser('guest-1', 'guest');

    const guestDb = authenticatedDb('guest-1');

    await assertFails(
      setDoc(doc(guestDb, 'chapterRecords', 'record-guest-1'), {
        id: 'record-guest-1',
        title: 'Guest writeup',
        summary: 'Guest summary',
        body: 'Guest body',
        kind: 'retrospective',
        visibility: 'member',
        status: 'pending_review',
        authorUserId: 'guest-1',
        showcaseCandidate: false,
        tags: [],
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
  });

  it('lets team members approve guests into members but not grant privileged roles', async () => {
    await seedChapterUser('team-1', 'team_member');
    await seedChapterUser('guest-1', 'guest');
    await seedChapterUser('guest-2', 'guest');

    const teamDb = authenticatedDb('team-1');

    await assertSucceeds(
      updateDoc(doc(teamDb, 'chapterUsers', 'guest-1'), {
        role: 'member',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
    await assertFails(
      updateDoc(doc(teamDb, 'chapterUsers', 'guest-2'), {
        role: 'admin',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
  });

  it('lets operators publish notices and blocks regular members from doing so', async () => {
    await seedChapterUser('team-1', 'team_member');
    await seedChapterUser('member-1', 'member');

    await assertSucceeds(
      setDoc(doc(authenticatedDb('team-1'), 'notices', 'notice-1'), {
        id: 'notice-1',
        title: 'Operator notice',
        body: 'Notice body',
        visibility: 'member',
        status: 'published',
        pinned: true,
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
    await assertFails(
      setDoc(doc(authenticatedDb('member-1'), 'notices', 'notice-2'), {
        id: 'notice-2',
        title: 'Member notice',
        body: 'Notice body',
        visibility: 'member',
        status: 'published',
        pinned: true,
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
  });

  it('lets operators manage sessions and blocks regular members from doing so', async () => {
    await seedChapterUser('team-1', 'team_member');
    await seedChapterUser('member-1', 'member');

    const teamDb = authenticatedDb('team-1');

    await assertSucceeds(
      setDoc(doc(teamDb, 'sessions', 'activity-1_default-session'), {
        id: 'activity-1_default-session',
        activityId: 'activity-1',
        title: 'Build with AI Sprint',
        startsAt: '2026-05-16T04:00:00.000Z',
        endsAt: '2026-05-16T06:00:00.000Z',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
    await assertSucceeds(
      updateDoc(doc(teamDb, 'sessions', 'activity-1_default-session'), {
        title: 'Build with AI Demo Day',
        updatedAt: '2026-05-14T01:00:00.000Z',
      }),
    );
    await assertFails(
      setDoc(doc(authenticatedDb('member-1'), 'sessions', 'member-session'), {
        id: 'member-session',
        activityId: 'activity-1',
        title: 'Member Session',
        startsAt: '2026-05-16T04:00:00.000Z',
        endsAt: '2026-05-16T06:00:00.000Z',
        createdAt: '2026-05-14T00:00:00.000Z',
        updatedAt: '2026-05-14T00:00:00.000Z',
      }),
    );
  });
});

function authenticatedDb(userId: string): Firestore {
  return testEnvironment.authenticatedContext(userId).firestore();
}

function unauthenticatedDb(): Firestore {
  return testEnvironment.unauthenticatedContext().firestore();
}

async function seedDocument(path: string, data: Record<string, unknown>) {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

async function seedChapterUser(userId: string, role: string) {
  await seedDocument(`chapterUsers/${userId}`, {
    id: userId,
    displayName: userId,
    email: `${userId}@example.com`,
    role,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  });
}

async function seedActivity(
  activityId: string,
  overrides: Record<string, unknown>,
) {
  await seedDocument(`activities/${activityId}`, {
    id: activityId,
    title: activityId,
    summary: `${activityId} summary`,
    type: 'event',
    status: 'published',
    visibility: 'member',
    registrationMode: 'internal',
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
    ...overrides,
  });
}

async function seedApplication(
  applicationId: string,
  overrides: Record<string, unknown>,
) {
  await seedDocument(`activityApplications/${applicationId}`, {
    id: applicationId,
    activityId: 'activity-1',
    userId: 'member-1',
    state: 'applied',
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
    ...overrides,
  });
}
