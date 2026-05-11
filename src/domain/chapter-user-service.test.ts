import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  approveGuestToMember,
  changeUserRole,
  createInMemoryChapterUserStore,
  listPendingGuestUsers,
  submitGuestProfile,
} from './chapter-user-service.ts';
import type { ChapterUser } from './chapter-user.ts';

const guestUser: ChapterUser = {
  id: 'user-guest-1',
  displayName: 'Guest User',
  email: 'guest@example.com',
  role: 'guest',
  createdAt: '2026-05-11T09:00:00.000Z',
  updatedAt: '2026-05-11T09:00:00.000Z',
};

const guestProfileInput = {
  cohort: '3rd',
  department: 'Computer Engineering',
  interests: 'Building Gemini-powered campus service prototypes',
  motivation: 'I want to turn a workshop idea into a usable demo.',
  studentId: '20261234',
};

const memberUser: ChapterUser = {
  ...guestUser,
  id: 'user-member-1',
  displayName: 'Member User',
  email: 'member@example.com',
  role: 'member',
};

const adminUser: ChapterUser = {
  ...guestUser,
  id: 'user-admin-1',
  displayName: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

describe('chapter user guest profile submission flow', () => {
  it('creates a new guest user when the submitter is not found', async () => {
    const store = createInMemoryChapterUserStore();

    const submitted = await submitGuestProfile(store, {
      id: 'user-guest-new',
      displayName: 'New Guest',
      email: 'new.guest@example.com',
      now: '2026-05-11T10:00:00.000Z',
      profile: guestProfileInput,
    });

    assert.deepEqual(submitted, {
      id: 'user-guest-new',
      displayName: 'New Guest',
      email: 'new.guest@example.com',
      role: 'guest',
      createdAt: '2026-05-11T10:00:00.000Z',
      updatedAt: '2026-05-11T10:00:00.000Z',
      profileSubmittedAt: '2026-05-11T10:00:00.000Z',
      ...guestProfileInput,
    });
    assert.deepEqual(await store.findUser('user-guest-new'), submitted);
  });

  it('updates an existing guest user profile without changing its role or createdAt', async () => {
    const store = createInMemoryChapterUserStore([guestUser]);

    const submitted = await submitGuestProfile(store, {
      id: 'user-guest-1',
      displayName: 'Updated Guest',
      email: 'updated.guest@example.com',
      now: '2026-05-11T10:00:00.000Z',
      profile: {
        ...guestProfileInput,
        interests: 'Gemini API, Firebase, and campus community tools',
      },
    });

    assert.equal(submitted.role, 'guest');
    assert.equal(submitted.createdAt, '2026-05-11T09:00:00.000Z');
    assert.equal(submitted.updatedAt, '2026-05-11T10:00:00.000Z');
    assert.equal(submitted.profileSubmittedAt, '2026-05-11T10:00:00.000Z');
    assert.equal(submitted.displayName, 'Updated Guest');
    assert.equal(submitted.email, 'updated.guest@example.com');
    assert.equal(
      submitted.interests,
      'Gemini API, Firebase, and campus community tools',
    );
  });

  it('preserves an existing non-guest role while updating profile fields', async () => {
    const store = createInMemoryChapterUserStore([
      {
        ...guestUser,
        id: 'user-member-1',
        role: 'member',
      },
    ]);

    const submitted = await submitGuestProfile(store, {
      id: 'user-member-1',
      displayName: 'Member User',
      email: 'member@example.com',
      now: '2026-05-11T10:00:00.000Z',
      profile: guestProfileInput,
    });

    assert.equal(submitted.role, 'member');
    assert.equal(submitted.department, 'Computer Engineering');
    assert.equal(submitted.profileSubmittedAt, '2026-05-11T10:00:00.000Z');
  });

  it('returns profile-enriched guest users sorted by createdAt', async () => {
    const store = createInMemoryChapterUserStore([
      {
        ...guestUser,
        id: 'guest-newer',
        createdAt: '2026-05-11T11:00:00.000Z',
        profileSubmittedAt: '2026-05-11T11:30:00.000Z',
        department: 'Media Communication',
      },
      {
        ...guestUser,
        id: 'guest-older',
        createdAt: '2026-05-10T09:00:00.000Z',
        profileSubmittedAt: '2026-05-10T09:30:00.000Z',
        department: 'Computer Engineering',
      },
      {
        ...guestUser,
        id: 'member-1',
        role: 'member',
        createdAt: '2026-05-09T09:00:00.000Z',
      },
    ]);

    const pendingGuests = await listPendingGuestUsers(store);

    assert.deepEqual(
      pendingGuests.map((user) => ({
        id: user.id,
        department: user.department,
        profileSubmittedAt: user.profileSubmittedAt,
      })),
      [
        {
          id: 'guest-older',
          department: 'Computer Engineering',
          profileSubmittedAt: '2026-05-10T09:30:00.000Z',
        },
        {
          id: 'guest-newer',
          department: 'Media Communication',
          profileSubmittedAt: '2026-05-11T11:30:00.000Z',
        },
      ],
    );
  });
});

describe('chapter user approval flow', () => {
  it('lets an operator approve a guest into member and records a role change log', async () => {
    const store = createInMemoryChapterUserStore([guestUser]);

    const approved = await approveGuestToMember(store, {
      actorId: 'operator-1',
      actorRole: 'team_member',
      now: '2026-05-11T10:00:00.000Z',
      targetUserId: 'user-guest-1',
    });

    assert.equal(approved.role, 'member');
    assert.equal(approved.updatedAt, '2026-05-11T10:00:00.000Z');
    assert.deepEqual(await listPendingGuestUsers(store), []);
    assert.deepEqual(await store.listRoleChangeLogs(), [
      {
        id: 'role-change-user-guest-1-2026-05-11T10:00:00.000Z',
        actorId: 'operator-1',
        actorRole: 'team_member',
        createdAt: '2026-05-11T10:00:00.000Z',
        nextRole: 'member',
        previousRole: 'guest',
        targetUserId: 'user-guest-1',
      },
    ]);
  });

  it('does not let a member approve guests', async () => {
    const store = createInMemoryChapterUserStore([guestUser]);

    await assert.rejects(
      () =>
        approveGuestToMember(store, {
          actorId: 'member-1',
          actorRole: 'member',
          now: '2026-05-11T10:00:00.000Z',
          targetUserId: 'user-guest-1',
        }),
      /Only operators can approve guests/,
    );
  });

  it('only approves users that are still guests', async () => {
    const store = createInMemoryChapterUserStore([
      {
        ...guestUser,
        id: 'user-member-1',
        role: 'member',
      },
    ]);

    await assert.rejects(
      () =>
        approveGuestToMember(store, {
          actorId: 'operator-1',
          actorRole: 'team_member',
          now: '2026-05-11T10:00:00.000Z',
          targetUserId: 'user-member-1',
        }),
      /Only guest users can be approved into member/,
    );
  });
});

describe('chapter user role admin flow', () => {
  it('lets an admin change a persisted user role and records a role change log', async () => {
    const store = createInMemoryChapterUserStore([adminUser, memberUser]);

    const changed = await changeUserRole(store, {
      actorId: 'user-admin-1',
      actorRole: 'admin',
      now: '2026-05-11T10:00:00.000Z',
      targetUserId: 'user-member-1',
      nextRole: 'organizer',
    });

    assert.equal(changed.role, 'organizer');
    assert.equal(changed.updatedAt, '2026-05-11T10:00:00.000Z');
    assert.deepEqual(await store.findUser('user-member-1'), changed);
    assert.deepEqual(await store.listRoleChangeLogs(), [
      {
        id: 'role-change-user-member-1-2026-05-11T10:00:00.000Z',
        actorId: 'user-admin-1',
        actorRole: 'admin',
        createdAt: '2026-05-11T10:00:00.000Z',
        nextRole: 'organizer',
        previousRole: 'member',
        targetUserId: 'user-member-1',
      },
    ]);
  });

  it('does not let non-admin actors use the general role-change API', async () => {
    const store = createInMemoryChapterUserStore([adminUser, memberUser]);

    await assert.rejects(
      () =>
        changeUserRole(store, {
          actorId: 'user-organizer-1',
          actorRole: 'organizer',
          now: '2026-05-11T10:00:00.000Z',
          targetUserId: 'user-member-1',
          nextRole: 'team_member',
        }),
      /Only admins can change user roles/,
    );
    assert.equal((await store.findUser('user-member-1'))?.role, 'member');
    assert.deepEqual(await store.listRoleChangeLogs(), []);
  });

  it('does not change persisted users to visitor', async () => {
    const store = createInMemoryChapterUserStore([adminUser, memberUser]);

    await assert.rejects(
      () =>
        changeUserRole(store, {
          actorId: 'user-admin-1',
          actorRole: 'admin',
          now: '2026-05-11T10:00:00.000Z',
          targetUserId: 'user-member-1',
          nextRole: 'visitor',
        }),
      /Persisted users cannot be changed to visitor/,
    );
    assert.equal((await store.findUser('user-member-1'))?.role, 'member');
    assert.deepEqual(await store.listRoleChangeLogs(), []);
  });

  it('does not let an admin remove their own admin role', async () => {
    const store = createInMemoryChapterUserStore([
      adminUser,
      {
        ...adminUser,
        id: 'user-admin-2',
        email: 'admin2@example.com',
      },
    ]);

    await assert.rejects(
      () =>
        changeUserRole(store, {
          actorId: 'user-admin-1',
          actorRole: 'admin',
          now: '2026-05-11T10:00:00.000Z',
          targetUserId: 'user-admin-1',
          nextRole: 'organizer',
        }),
      /Admins cannot remove their own admin role/,
    );
    assert.equal((await store.findUser('user-admin-1'))?.role, 'admin');
    assert.deepEqual(await store.listRoleChangeLogs(), []);
  });

  it('does not demote the last admin', async () => {
    const store = createInMemoryChapterUserStore([adminUser, memberUser]);

    await assert.rejects(
      () =>
        changeUserRole(store, {
          actorId: 'external-admin-1',
          actorRole: 'admin',
          now: '2026-05-11T10:00:00.000Z',
          targetUserId: 'user-admin-1',
          nextRole: 'organizer',
        }),
      /The last admin cannot be demoted/,
    );
    assert.equal((await store.findUser('user-admin-1'))?.role, 'admin');
    assert.deepEqual(await store.listRoleChangeLogs(), []);
  });
});
