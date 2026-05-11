import type { ChapterUser } from '@/domain/chapter-user';

export const seedChapterUsers: ChapterUser[] = [
  {
    id: 'seed-user-guest-1',
    displayName: '김민준',
    email: 'minjun.guest@example.com',
    role: 'guest',
    createdAt: '2026-05-10T09:00:00.000Z',
    updatedAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: 'seed-user-guest-2',
    displayName: '이서연',
    email: 'seoyeon.guest@example.com',
    role: 'guest',
    createdAt: '2026-05-11T02:30:00.000Z',
    updatedAt: '2026-05-11T02:30:00.000Z',
  },
  {
    id: 'seed-user-member-1',
    displayName: '박도윤',
    email: 'doyun.member@example.com',
    role: 'member',
    createdAt: '2026-05-01T03:00:00.000Z',
    updatedAt: '2026-05-02T03:00:00.000Z',
  },
];
