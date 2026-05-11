import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  approveGuestToMember,
  createInMemoryChapterUserStore,
  listPendingGuestUsers,
} from './chapter-user-service.ts';
import type { ChapterUser } from './chapter-user.ts';

const guestUser: ChapterUser = {
  id: 'user-guest-1',
  displayName: '홍길동',
  email: 'guest@example.com',
  role: 'guest',
  createdAt: '2026-05-11T09:00:00.000Z',
  updatedAt: '2026-05-11T09:00:00.000Z',
};

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
