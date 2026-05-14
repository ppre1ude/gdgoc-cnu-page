import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  archiveNotice,
  createInMemoryNoticeStore,
  createNotice,
  listHomeNotices,
  updateNotice,
} from './notice-service.ts';
import type { Notice } from './notice.ts';

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

  it('lets an operator update editable fields while preserving identity and creation time', async () => {
    const store = createInMemoryNoticeStore();
    const created = await createNotice(store, {
      actorRole: 'team_member',
      body: 'Original body',
      now: '2026-05-11T09:00:00.000Z',
      pinned: false,
      status: 'draft',
      title: 'Original title',
      visibility: 'public',
    });

    const updated = await updateNotice(store, {
      actorRole: 'organizer',
      body: 'Updated body',
      now: '2026-05-12T10:00:00.000Z',
      noticeId: created.id,
      pinned: true,
      status: 'published',
      title: 'Updated title',
      visibility: 'member',
    });

    assert.deepEqual(updated, {
      ...created,
      body: 'Updated body',
      pinned: true,
      status: 'published',
      title: 'Updated title',
      updatedAt: '2026-05-12T10:00:00.000Z',
      visibility: 'member',
    });
    assert.equal(updated.id, created.id);
    assert.equal(updated.createdAt, created.createdAt);
    assert.deepEqual(
      (await store.list()).find((notice) => notice.id === created.id),
      updated,
    );
  });

  it('blocks non-operators from updating notices', async () => {
    const originalNotice: Notice = {
      id: 'notice-existing',
      body: 'Original body',
      createdAt: '2026-05-11T09:00:00.000Z',
      pinned: false,
      status: 'draft',
      title: 'Original title',
      updatedAt: '2026-05-11T09:00:00.000Z',
      visibility: 'public',
    };
    const store = createInMemoryNoticeStore([originalNotice]);

    await assert.rejects(
      updateNotice(store, {
        actorRole: 'member',
        body: 'Updated body',
        now: '2026-05-12T10:00:00.000Z',
        noticeId: originalNotice.id,
        pinned: true,
        status: 'published',
        title: 'Updated title',
        visibility: 'member',
      }),
      /Only operators can update notices/,
    );

    assert.deepEqual((await store.list())[0], originalNotice);
  });

  it('throws a clear error when updating a missing notice', async () => {
    const store = createInMemoryNoticeStore();

    await assert.rejects(
      updateNotice(store, {
        actorRole: 'team_member',
        body: 'Updated body',
        now: '2026-05-12T10:00:00.000Z',
        noticeId: 'notice-missing',
        pinned: true,
        status: 'published',
        title: 'Updated title',
        visibility: 'member',
      }),
      /Notice was not found: notice-missing/,
    );
  });

  it('lets an operator archive a notice and hides it from member home', async () => {
    const store = createInMemoryNoticeStore();
    const created = await createNotice(store, {
      actorRole: 'team_member',
      body: 'Member-visible announcement',
      now: '2026-05-11T09:00:00.000Z',
      pinned: true,
      status: 'published',
      title: 'Build with AI notice',
      visibility: 'member',
    });

    const archived = await archiveNotice(store, {
      actorRole: 'organizer',
      noticeId: created.id,
      now: '2026-05-12T10:00:00.000Z',
    });
    const memberHomeNotices = await listHomeNotices(store, 'member');

    assert.deepEqual(archived, {
      ...created,
      status: 'archived',
      updatedAt: '2026-05-12T10:00:00.000Z',
    });
    assert.equal(memberHomeNotices.length, 0);
  });

  it('blocks non-operators from archiving notices', async () => {
    const originalNotice: Notice = {
      id: 'notice-existing',
      body: 'Member-visible announcement',
      createdAt: '2026-05-11T09:00:00.000Z',
      pinned: true,
      status: 'published',
      title: 'Build with AI notice',
      updatedAt: '2026-05-11T09:00:00.000Z',
      visibility: 'member',
    };
    const store = createInMemoryNoticeStore([originalNotice]);

    await assert.rejects(
      archiveNotice(store, {
        actorRole: 'member',
        noticeId: originalNotice.id,
        now: '2026-05-12T10:00:00.000Z',
      }),
      /Only operators can archive notices/,
    );

    assert.deepEqual((await store.list())[0], originalNotice);
  });

  it('throws a clear error when archiving a missing notice', async () => {
    const store = createInMemoryNoticeStore();

    await assert.rejects(
      archiveNotice(store, {
        actorRole: 'team_member',
        noticeId: 'notice-missing',
        now: '2026-05-12T10:00:00.000Z',
      }),
      /Notice was not found: notice-missing/,
    );
  });

  it('archives an already archived notice idempotently', async () => {
    const originalNotice: Notice = {
      id: 'notice-existing',
      body: 'Member-visible announcement',
      createdAt: '2026-05-11T09:00:00.000Z',
      pinned: true,
      status: 'archived',
      title: 'Build with AI notice',
      updatedAt: '2026-05-11T09:00:00.000Z',
      visibility: 'member',
    };
    const store = createInMemoryNoticeStore([originalNotice]);

    const archived = await archiveNotice(store, {
      actorRole: 'admin',
      noticeId: originalNotice.id,
      now: '2026-05-12T10:00:00.000Z',
    });
    const notices = await store.list();

    assert.deepEqual(archived, {
      ...originalNotice,
      updatedAt: '2026-05-12T10:00:00.000Z',
    });
    assert.equal(notices.length, 1);
    assert.deepEqual(notices[0], archived);
  });
});
