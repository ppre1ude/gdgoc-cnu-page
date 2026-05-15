'use client';

import type { UserRole } from '@/domain/activity';
import type { ChapterUser } from '@/domain/chapter-user';
import {
  executeChapterUserMutation,
  type ChapterUserMutationIntent,
} from '@/domain/chapter-user-mutation';
import type { ChapterUserStore } from '@/domain/chapter-user-service';
import { getFirebaseAuth, hasFirebaseConfig } from '@/lib/firebase/client';

export type ChapterUserMutationActorInput = {
  actorId: string;
  actorRole: UserRole;
  now: string;
};

export type ApproveGuestToMemberMutationInput =
  ChapterUserMutationActorInput & {
    targetUserId: string;
  };

export type ChangeUserRoleMutationInput = ChapterUserMutationActorInput & {
  nextRole: UserRole;
  targetUserId: string;
};

export type ChapterUserMutationClient = {
  approveGuestToMember(
    input: ApproveGuestToMemberMutationInput,
  ): Promise<ChapterUser>;
  changeUserRole(input: ChangeUserRoleMutationInput): Promise<ChapterUser>;
};

export function createBrowserChapterUserMutationClient(
  store: ChapterUserStore,
): ChapterUserMutationClient {
  return {
    approveGuestToMember(input) {
      return executeMutation(store, input, {
        targetUserId: input.targetUserId,
        type: 'approve_guest_to_member',
      });
    },
    changeUserRole(input) {
      return executeMutation(store, input, {
        nextRole: input.nextRole,
        targetUserId: input.targetUserId,
        type: 'change_user_role',
      });
    },
  };
}

async function executeMutation(
  store: ChapterUserStore,
  actor: ChapterUserMutationActorInput,
  intent: ChapterUserMutationIntent,
) {
  if (hasFirebaseConfig()) {
    return requestServerMutation(intent);
  }

  const result = await executeChapterUserMutation({
    actorId: actor.actorId,
    actorRole: actor.actorRole,
    intent,
    now: actor.now,
    store,
  });

  return result.user;
}

async function requestServerMutation(intent: ChapterUserMutationIntent) {
  const currentUser = getFirebaseAuth().currentUser;

  if (!currentUser) {
    throw new Error('Firebase user is not signed in.');
  }

  const response = await fetch('/api/chapter-user-mutations', {
    body: JSON.stringify(intent),
    headers: {
      Authorization: `Bearer ${await currentUser.getIdToken()}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const payload = (await response.json()) as {
    error?: string;
    user?: ChapterUser;
  };

  if (!response.ok || !payload.user) {
    throw new Error(payload.error ?? 'Chapter user mutation failed.');
  }

  return payload.user;
}
