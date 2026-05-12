import type { UserRole } from './activity.ts';

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

const roleVisibilityRank: Record<UserRole, number> = {
  visitor: 0,
  guest: 0,
  member: 1,
  alumni: 1,
  team_member: 2,
  organizer: 2,
  admin: 2,
};

const noticeVisibilityRank: Record<NoticeVisibility, number> = {
  public: 0,
  member: 1,
  operator: 2,
};

export function listVisibleNotices(
  notices: Notice[],
  role: UserRole,
): Notice[] {
  const allowedRank = roleVisibilityRank[role];

  return notices.filter((notice) => {
    if (notice.status !== 'published') {
      return false;
    }

    return noticeVisibilityRank[notice.visibility] <= allowedRank;
  });
}
