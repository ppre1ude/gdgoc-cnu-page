import type { UserRole } from './activity.ts';
import type { ChapterUser } from './chapter-user.ts';
import {
  approveGuestToMember,
  changeUserRole,
  type ChapterUserStore,
} from './chapter-user-service.ts';
import { isKnownUserRole } from './role-access-policy.ts';

export type ChapterUserMutationIntent =
  | {
      targetUserId: string;
      type: 'approve_guest_to_member';
    }
  | {
      nextRole: UserRole;
      targetUserId: string;
      type: 'change_user_role';
    };

export type ExecuteChapterUserMutationInput = {
  actorId: string;
  actorRole: UserRole;
  intent: ChapterUserMutationIntent;
  now: string;
  store: ChapterUserStore;
};

export type ChapterUserMutationResult = {
  user: ChapterUser;
};

export async function executeChapterUserMutation({
  actorId,
  actorRole,
  intent,
  now,
  store,
}: ExecuteChapterUserMutationInput): Promise<ChapterUserMutationResult> {
  if (intent.type === 'approve_guest_to_member') {
    return {
      user: await approveGuestToMember(store, {
        actorId,
        actorRole,
        now,
        targetUserId: intent.targetUserId,
      }),
    };
  }

  return {
    user: await changeUserRole(store, {
      actorId,
      actorRole,
      nextRole: intent.nextRole,
      now,
      targetUserId: intent.targetUserId,
    }),
  };
}

export function parseChapterUserMutationIntent(
  value: unknown,
): ChapterUserMutationIntent {
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new Error('Unsupported chapter user mutation intent.');
  }

  if (
    value.type === 'approve_guest_to_member' &&
    typeof value.targetUserId === 'string'
  ) {
    return {
      targetUserId: value.targetUserId,
      type: value.type,
    };
  }

  if (
    value.type === 'change_user_role' &&
    typeof value.targetUserId === 'string' &&
    isKnownUserRole(value.nextRole)
  ) {
    return {
      nextRole: value.nextRole,
      targetUserId: value.targetUserId,
      type: value.type,
    };
  }

  throw new Error('Unsupported chapter user mutation intent.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
