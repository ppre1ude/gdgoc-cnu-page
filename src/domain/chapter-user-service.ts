import type { UserRole } from './activity.ts';
import type { ChapterUser, RoleChangeLog } from './chapter-user.ts';

export type ChapterUserStore = {
  saveUser(user: ChapterUser): Promise<ChapterUser>;
  listUsers(): Promise<ChapterUser[]>;
  findUser(userId: string): Promise<ChapterUser | null>;
  saveRoleChangeLog(log: RoleChangeLog): Promise<RoleChangeLog>;
  listRoleChangeLogs(): Promise<RoleChangeLog[]>;
};

export type ApproveGuestToMemberInput = {
  actorId: string;
  actorRole: UserRole;
  targetUserId: string;
  now: string;
};

const memberApprovalRoles = new Set<UserRole>([
  'team_member',
  'organizer',
  'admin',
]);

export function createInMemoryChapterUserStore(
  initialUsers: ChapterUser[] = [],
  initialRoleChangeLogs: RoleChangeLog[] = [],
): ChapterUserStore {
  const users = new Map(initialUsers.map((user) => [user.id, user]));
  const roleChangeLogs = new Map(
    initialRoleChangeLogs.map((log) => [log.id, log]),
  );

  return {
    async saveUser(user) {
      users.set(user.id, user);
      return user;
    },
    async listUsers() {
      return [...users.values()];
    },
    async findUser(userId) {
      return users.get(userId) ?? null;
    },
    async saveRoleChangeLog(log) {
      roleChangeLogs.set(log.id, log);
      return log;
    },
    async listRoleChangeLogs() {
      return [...roleChangeLogs.values()];
    },
  };
}

export async function listPendingGuestUsers(
  store: ChapterUserStore,
): Promise<ChapterUser[]> {
  const users = await store.listUsers();

  return users
    .filter((user) => user.role === 'guest')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function approveGuestToMember(
  store: ChapterUserStore,
  input: ApproveGuestToMemberInput,
): Promise<ChapterUser> {
  if (!memberApprovalRoles.has(input.actorRole)) {
    throw new Error('Only operators can approve guests into members.');
  }

  const user = await store.findUser(input.targetUserId);

  if (!user) {
    throw new Error('Chapter user does not exist.');
  }

  if (user.role !== 'guest') {
    throw new Error('Only guest users can be approved into member.');
  }

  const approvedUser: ChapterUser = {
    ...user,
    role: 'member',
    updatedAt: input.now,
  };

  await store.saveUser(approvedUser);
  await store.saveRoleChangeLog({
    id: `role-change-${user.id}-${input.now}`,
    actorId: input.actorId,
    actorRole: input.actorRole,
    createdAt: input.now,
    nextRole: 'member',
    previousRole: user.role,
    targetUserId: user.id,
  });

  return approvedUser;
}
