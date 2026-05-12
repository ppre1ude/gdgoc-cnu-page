import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createInMemoryNoticeStore,
  createNotice,
  listHomeNotices,
} from './notice-service.ts';

describe('notice publishing flow', () => {
  it('lets an operator create pinned notices that appear first on member home', async () => {
    const store = createInMemoryNoticeStore();

    await createNotice(store, {
      actorRole: 'team_member',
      body: '이번 주 토요일 Build with AI 프로토타입 데모를 진행합니다.',
      now: '2026-05-11T09:00:00.000Z',
      pinned: false,
      status: 'published',
      title: 'Build with AI 데모 안내',
      visibility: 'member',
    });
    await createNotice(store, {
      actorRole: 'team_member',
      body: '행사 전까지 Firebase 로그인과 Activity 신청 흐름을 확인해주세요.',
      now: '2026-05-11T10:00:00.000Z',
      pinned: true,
      status: 'published',
      title: '발표 전 확인사항',
      visibility: 'member',
    });

    const notices = await listHomeNotices(store, 'member');

    assert.deepEqual(
      notices.map((notice) => notice.title),
      ['발표 전 확인사항', 'Build with AI 데모 안내'],
    );
  });
});
