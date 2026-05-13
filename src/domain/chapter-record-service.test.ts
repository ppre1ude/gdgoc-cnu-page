import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createInMemoryChapterRecordStore,
  listHomeChapterRecords,
  publishChapterRecord,
  submitChapterRecord,
} from './chapter-record-service.ts';
import type { ChapterRecord } from './chapter-record.ts';

const baseRecord: ChapterRecord = {
  id: 'chapter-record-public',
  title: 'Build with AI Sprint Retrospective',
  summary: 'What we learned while prototyping with Gemini and Firebase.',
  body: 'Members reflected on idea shaping, vibe coding, and demo tradeoffs.',
  kind: 'retrospective',
  visibility: 'public',
  status: 'published',
  authorUserId: 'member-1',
  submittedAt: '2026-05-12T09:00:00.000Z',
  publishedAt: '2026-05-13T09:00:00.000Z',
  publishedByUserId: 'operator-1',
  showcaseCandidate: true,
  tags: ['Build with AI', 'Firebase'],
  createdAt: '2026-05-12T09:00:00.000Z',
  updatedAt: '2026-05-13T09:00:00.000Z',
};

describe('chapter record submission flow', () => {
  it('lets active members submit a long-form record for review', async () => {
    const store = createInMemoryChapterRecordStore();

    const record = await submitChapterRecord(store, {
      actorRole: 'member',
      actorUserId: 'member-1',
      title: 'Gemini API Review',
      summary: 'Notes from trying Gemini API in a campus assistant prototype.',
      body: 'Long-form observations about prompts, latency, and UX tradeoffs.',
      kind: 'review',
      visibility: 'member',
      status: 'pending_review',
      now: '2026-05-12T09:00:00.000Z',
    });

    assert.equal(record.kind, 'review');
    assert.equal(record.status, 'pending_review');
    assert.equal(record.authorUserId, 'member-1');
    assert.equal(record.submittedAt, '2026-05-12T09:00:00.000Z');
    assert.equal(record.showcaseCandidate, false);
    assert.deepEqual(await store.list(), [record]);
  });

  it('lets active members save a draft without entering review', async () => {
    const store = createInMemoryChapterRecordStore();

    const record = await submitChapterRecord(store, {
      actorRole: 'team_member',
      actorUserId: 'team-member-1',
      title: 'Nano Banana Technical Note',
      summary: 'Draft notes for image generation workflow experiments.',
      body: 'A longer technical note will be completed after the next sprint.',
      kind: 'technical_note',
      visibility: 'operator',
      status: 'draft',
      now: '2026-05-12T10:00:00.000Z',
    });

    assert.equal(record.status, 'draft');
    assert.equal(record.visibility, 'operator');
    assert.equal(record.submittedAt, undefined);
  });

  it('blocks guests and alumni from submitting chapter records', async () => {
    const store = createInMemoryChapterRecordStore();

    await assert.rejects(
      submitChapterRecord(store, {
        actorRole: 'guest',
        actorUserId: 'guest-1',
        title: 'Guest Retrospective',
        summary: 'Guests should not create long-form records.',
        body: 'This should not be stored.',
        kind: 'retrospective',
        visibility: 'member',
        status: 'pending_review',
        now: '2026-05-12T09:00:00.000Z',
      }),
      /Only active members can submit chapter records/,
    );

    await assert.rejects(
      submitChapterRecord(store, {
        actorRole: 'alumni',
        actorUserId: 'alumni-1',
        title: 'Alumni Review',
        summary: 'Alumni should not create long-form records.',
        body: 'This should not be stored.',
        kind: 'review',
        visibility: 'member',
        status: 'pending_review',
        now: '2026-05-12T09:00:00.000Z',
      }),
      /Only active members can submit chapter records/,
    );

    assert.deepEqual(await store.list(), []);
  });
});

describe('chapter record publishing flow', () => {
  it('lets an operator publish a pending record and mark it as a showcase candidate', async () => {
    const store = createInMemoryChapterRecordStore([
      {
        ...baseRecord,
        id: 'chapter-record-pending',
        status: 'pending_review',
        visibility: 'member',
        publishedAt: undefined,
        publishedByUserId: undefined,
        showcaseCandidate: false,
        updatedAt: '2026-05-12T09:00:00.000Z',
      },
    ]);

    const published = await publishChapterRecord(store, {
      actorRole: 'organizer',
      actorUserId: 'organizer-1',
      recordId: 'chapter-record-pending',
      visibility: 'public',
      showcaseCandidate: true,
      now: '2026-05-13T09:00:00.000Z',
    });

    assert.equal(published.status, 'published');
    assert.equal(published.visibility, 'public');
    assert.equal(published.publishedAt, '2026-05-13T09:00:00.000Z');
    assert.equal(published.publishedByUserId, 'organizer-1');
    assert.equal(published.showcaseCandidate, true);
  });

  it('blocks non-operators from publishing records', async () => {
    const store = createInMemoryChapterRecordStore([
      {
        ...baseRecord,
        status: 'pending_review',
        publishedAt: undefined,
        publishedByUserId: undefined,
      },
    ]);

    await assert.rejects(
      publishChapterRecord(store, {
        actorRole: 'member',
        actorUserId: 'member-2',
        recordId: 'chapter-record-public',
        showcaseCandidate: false,
        now: '2026-05-13T09:00:00.000Z',
      }),
      /Only operators can publish chapter records/,
    );
  });

  it('only publishes pending records', async () => {
    const store = createInMemoryChapterRecordStore([
      {
        ...baseRecord,
        id: 'chapter-record-draft',
        status: 'draft',
        publishedAt: undefined,
        publishedByUserId: undefined,
      },
    ]);

    await assert.rejects(
      publishChapterRecord(store, {
        actorRole: 'admin',
        actorUserId: 'admin-1',
        recordId: 'chapter-record-draft',
        showcaseCandidate: true,
        now: '2026-05-13T09:00:00.000Z',
      }),
      /Only pending chapter records can be published/,
    );
  });
});

describe('member home chapter record visibility', () => {
  it('lists only published records allowed by public, member, and operator visibility', async () => {
    const store = createInMemoryChapterRecordStore([
      baseRecord,
      {
        ...baseRecord,
        id: 'chapter-record-member',
        title: 'Member Technical Note',
        kind: 'technical_note',
        visibility: 'member',
      },
      {
        ...baseRecord,
        id: 'chapter-record-operator',
        title: 'Operator Review Note',
        kind: 'review',
        visibility: 'operator',
      },
      {
        ...baseRecord,
        id: 'chapter-record-draft',
        title: 'Hidden Draft',
        status: 'draft',
      },
    ]);

    const visitorRecords = await listHomeChapterRecords(store, 'visitor');
    const memberRecords = await listHomeChapterRecords(store, 'member');
    const operatorRecords = await listHomeChapterRecords(store, 'team_member');

    assert.deepEqual(
      visitorRecords.map((record) => record.id),
      ['chapter-record-public'],
    );
    assert.deepEqual(
      memberRecords.map((record) => record.id),
      ['chapter-record-public', 'chapter-record-member'],
    );
    assert.deepEqual(
      operatorRecords.map((record) => record.id),
      [
        'chapter-record-public',
        'chapter-record-member',
        'chapter-record-operator',
      ],
    );
  });

  it('sorts published records by latest publishedAt or updatedAt first', async () => {
    const store = createInMemoryChapterRecordStore([
      {
        ...baseRecord,
        id: 'chapter-record-updated-only',
        publishedAt: undefined,
        updatedAt: '2026-05-14T09:00:00.000Z',
      },
      {
        ...baseRecord,
        id: 'chapter-record-old-published',
        publishedAt: '2026-05-13T09:00:00.000Z',
        updatedAt: '2026-05-15T09:00:00.000Z',
      },
      {
        ...baseRecord,
        id: 'chapter-record-new-published',
        publishedAt: '2026-05-16T09:00:00.000Z',
        updatedAt: '2026-05-12T09:00:00.000Z',
      },
    ]);

    const records = await listHomeChapterRecords(store, 'member');

    assert.deepEqual(
      records.map((record) => record.id),
      [
        'chapter-record-new-published',
        'chapter-record-updated-only',
        'chapter-record-old-published',
      ],
    );
  });
});
