import type { UserRole } from './activity.ts';
import { canReadPublishedResource } from './role-access-policy.ts';

export type NoticeVisibility = 'public' | 'member' | 'operator';
export type NoticeStatus = 'draft' | 'published' | 'archived';

export type Notice = {
  id: string;
  title: string;
  body: string;
  visibility: NoticeVisibility;
  status: NoticeStatus;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export function listVisibleNotices(
  notices: Notice[],
  role: UserRole,
): Notice[] {
  return notices.filter((notice) => canReadPublishedResource(role, notice));
}
