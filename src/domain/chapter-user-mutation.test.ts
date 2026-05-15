import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ChapterUser } from './chapter-user.ts';
import {
  executeChapterUserMutation,
  parseChapterUserMutationIntent,
} from './chapter-user-mutation.ts';
import { createInMemoryChapterUserStore } from './chapter-user-service.ts';

const guestUser: ChapterUser = {
  id: 'user-guest-1',
  displayName: 'Guest User',
  email: 'guest@example.com',
  role: 'guest',
  createdAt: '2026-05-15T09:00:00.000Z',
  updatedAt: '2026-05-15T09:00:00.000Z',
};

const adminUser: ChapterUser = {
  ...guestUser,
  id: 'user-admin-1',
  displayName: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

describe('chapter user mutation seam', () => {
  it('executes guest approval from actor context and records the role log', async () => {
    const store = createInMemoryChapterUserStore([guestUser]);

    const result = await executeChapterUserMutation({
      actorId: 'operator-1',
      actorRole: 'team_member',
      intent: {
        targetUserId: 'user-guest-1',
        type: 'approve_guest_to_member',
      },
      now: '2026-05-15T10:00:00.000Z',
      store,
    });

    assert.equal(result.user.role, 'member');
    assert.deepEqual(await store.listRoleChangeLogs(), [
      {
        id: 'role-change-user-guest-1-2026-05-15T10:00:00.000Z',
        actorId: 'operator-1',
        actorRole: 'team_member',
        createdAt: '2026-05-15T10:00:00.000Z',
        nextRole: 'member',
        previousRole: 'guest',
        targetUserId: 'user-guest-1',
      },
    ]);
  });

  it('executes admin role changes without accepting caller-supplied actor role', async () => {
    const store = createInMemoryChapterUserStore([adminUser, guestUser]);

    const result = await executeChapterUserMutation({
      actorId: 'user-admin-1',
      actorRole: 'admin',
      intent: {
        nextRole: 'organizer',
        targetUserId: 'user-guest-1',
        type: 'change_user_role',
      },
      now: '2026-05-15T10:00:00.000Z',
      store,
    });

    assert.equal(result.user.role, 'organizer');
    assert.deepEqual(await store.listRoleChangeLogs(), [
      {
        id: 'role-change-user-guest-1-2026-05-15T10:00:00.000Z',
        actorId: 'user-admin-1',
        actorRole: 'admin',
        createdAt: '2026-05-15T10:00:00.000Z',
        nextRole: 'organizer',
        previousRole: 'guest',
        targetUserId: 'user-guest-1',
      },
    ]);
  });

  it('parses only supported chapter user mutation intents', () => {
    assert.deepEqual(
      parseChapterUserMutationIntent({
        actorRole: 'admin',
        targetUserId: 'user-guest-1',
        type: 'approve_guest_to_member',
      }),
      {
        targetUserId: 'user-guest-1',
        type: 'approve_guest_to_member',
      },
    );

    assert.throws(
      () =>
        parseChapterUserMutationIntent({
          targetUserId: 'user-guest-1',
          type: 'delete_user',
        }),
      /Unsupported chapter user mutation intent/,
    );
  });
});
