import type { UserRole } from './activity.ts';

export type ChapterUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type RoleChangeLog = {
  id: string;
  actorId: string;
  actorRole: UserRole;
  targetUserId: string;
  previousRole: UserRole;
  nextRole: UserRole;
  createdAt: string;
};
