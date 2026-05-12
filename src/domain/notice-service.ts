import type { UserRole } from './activity.ts';
import {
  type Notice,
  type NoticeStatus,
  type NoticeVisibility,
  listVisibleNotices,
} from './notice.ts';

export type NoticeStore = {
  create(notice: Notice): Promise<Notice>;
  list(): Promise<Notice[]>;
};

export type CreateNoticeInput = {
  actorRole: UserRole;
  title: string;
  body: string;
  visibility: NoticeVisibility;
  status: NoticeStatus;
  pinned: boolean;
  now: string;
};

const operatorRoles = new Set<UserRole>(['team_member', 'organizer', 'admin']);

export function createInMemoryNoticeStore(
  initialNotices: Notice[] = [],
): NoticeStore {
  const notices = [...initialNotices];

  return {
    async create(notice) {
      notices.push(notice);
      return notice;
    },
    async list() {
      return [...notices];
    },
  };
}

export async function createNotice(
  store: NoticeStore,
  input: CreateNoticeInput,
): Promise<Notice> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can create notices.');
  }

  return store.create({
    id: `notice-${crypto.randomUUID()}`,
    title: input.title,
    body: input.body,
    visibility: input.visibility,
    status: input.status,
    pinned: input.pinned,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

export async function listHomeNotices(
  store: NoticeStore,
  role: UserRole,
): Promise<Notice[]> {
  const notices = await store.list();

  return listVisibleNotices(notices, role).sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}
