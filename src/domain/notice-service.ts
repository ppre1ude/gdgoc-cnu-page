import type { UserRole } from './activity.ts';
import {
  type Notice,
  type NoticeStatus,
  type NoticeVisibility,
  listVisibleNotices,
} from './notice.ts';

export type NoticeStore = {
  create(notice: Notice): Promise<Notice>;
  save(notice: Notice): Promise<Notice>;
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

export type UpdateNoticeInput = {
  actorRole: UserRole;
  noticeId: string;
  title: string;
  body: string;
  visibility: NoticeVisibility;
  status: NoticeStatus;
  pinned: boolean;
  now: string;
};

export type ArchiveNoticeInput = {
  actorRole: UserRole;
  noticeId: string;
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
    async save(notice) {
      const noticeIndex = notices.findIndex(
        (storedNotice) => storedNotice.id === notice.id,
      );

      if (noticeIndex === -1) {
        notices.push(notice);
      } else {
        notices[noticeIndex] = notice;
      }

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

export async function updateNotice(
  store: NoticeStore,
  input: UpdateNoticeInput,
): Promise<Notice> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can update notices.');
  }

  const existingNotice = await findNoticeOrThrow(store, input.noticeId);

  return store.save({
    ...existingNotice,
    title: input.title,
    body: input.body,
    visibility: input.visibility,
    status: input.status,
    pinned: input.pinned,
    updatedAt: input.now,
  });
}

export async function archiveNotice(
  store: NoticeStore,
  input: ArchiveNoticeInput,
): Promise<Notice> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can archive notices.');
  }

  const existingNotice = await findNoticeOrThrow(store, input.noticeId);

  return store.save({
    ...existingNotice,
    status: 'archived',
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

async function findNoticeOrThrow(
  store: NoticeStore,
  noticeId: string,
): Promise<Notice> {
  const notice = (await store.list()).find(
    (storedNotice) => storedNotice.id === noticeId,
  );

  if (!notice) {
    throw new Error(`Notice was not found: ${noticeId}`);
  }

  return notice;
}
