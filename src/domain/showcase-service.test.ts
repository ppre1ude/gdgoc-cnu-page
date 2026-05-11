import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createInMemoryShowcaseStore,
  createShowcase,
  listHomeShowcases,
} from './showcase-service.ts';
import {
  getSafeShowcaseHref,
  normalizeShowcases,
  type Showcase,
} from './showcase.ts';

const baseShowcase: Showcase = {
  id: 'showcase-public',
  title: 'Build with AI Gallery',
  summary: 'Prototype results from the CNU Build with AI sprint.',
  kind: 'gallery',
  visibility: 'public',
  status: 'published',
  tags: ['build-with-ai'],
  createdAt: '2026-05-11T09:00:00.000Z',
  updatedAt: '2026-05-11T09:00:00.000Z',
};

describe('showcase authoring flow', () => {
  it('lets an operator create a showcase with optional content fields', async () => {
    const store = createInMemoryShowcaseStore();

    const showcase = await createShowcase(store, {
      actorRole: 'team_member',
      title: 'Gemini Prototype Results',
      summary: 'Student prototypes from a Build with AI sprint.',
      body: 'Teams explored Gemini and Firebase with early demos.',
      kind: 'project_result',
      imageUrl: 'https://example.com/showcase.png',
      href: 'https://example.com/demo',
      tags: ['gemini', 'firebase'],
      relatedActivityId: 'activity-build-with-ai',
      visibility: 'public',
      status: 'published',
      publishedAt: '2026-05-16T04:00:00.000Z',
      now: '2026-05-11T09:00:00.000Z',
    });

    const visibleShowcases = await listHomeShowcases(store, 'visitor');

    assert.equal(visibleShowcases.length, 1);
    assert.equal(visibleShowcases[0]?.id, showcase.id);
    assert.equal(visibleShowcases[0]?.kind, 'project_result');
    assert.deepEqual(visibleShowcases[0]?.tags, ['gemini', 'firebase']);
    assert.equal(
      visibleShowcases[0]?.relatedActivityId,
      'activity-build-with-ai',
    );
  });

  it('rejects showcase creation by non-operators', async () => {
    const store = createInMemoryShowcaseStore();

    await assert.rejects(
      createShowcase(store, {
        actorRole: 'member',
        title: 'Member Draft',
        summary: 'Members cannot publish official showcases.',
        kind: 'retrospective',
        tags: [],
        visibility: 'member',
        status: 'draft',
        now: '2026-05-11T09:00:00.000Z',
      }),
      /Only operators can create showcases/,
    );
  });

  it('drops unsafe showcase links before storage', async () => {
    const store = createInMemoryShowcaseStore();

    const showcase = await createShowcase(store, {
      actorRole: 'team_member',
      title: 'Unsafe Link',
      summary: 'Unsafe links should not be exposed on public cards.',
      kind: 'gallery',
      href: 'javascript:alert(1)',
      tags: ['security'],
      visibility: 'public',
      status: 'published',
      now: '2026-05-11T09:00:00.000Z',
    });

    assert.equal(showcase.href, undefined);
  });
});

describe('home showcase visibility', () => {
  it('shows public showcases to visitors and member showcases to members', async () => {
    const store = createInMemoryShowcaseStore([
      baseShowcase,
      {
        ...baseShowcase,
        id: 'showcase-member',
        title: 'Member Retrospective',
        kind: 'retrospective',
        visibility: 'member',
      },
      {
        ...baseShowcase,
        id: 'showcase-operator',
        title: 'Operator Achievement',
        kind: 'achievement',
        visibility: 'operator',
      },
    ]);

    const visitorShowcases = await listHomeShowcases(store, 'visitor');
    const memberShowcases = await listHomeShowcases(store, 'member');
    const teamMemberShowcases = await listHomeShowcases(store, 'team_member');

    assert.deepEqual(
      visitorShowcases.map((showcase) => showcase.id),
      ['showcase-public'],
    );
    assert.deepEqual(
      memberShowcases.map((showcase) => showcase.id),
      ['showcase-public', 'showcase-member'],
    );
    assert.deepEqual(
      teamMemberShowcases.map((showcase) => showcase.id),
      ['showcase-public', 'showcase-member', 'showcase-operator'],
    );
  });

  it('only exposes published showcases', async () => {
    const store = createInMemoryShowcaseStore([
      baseShowcase,
      {
        ...baseShowcase,
        id: 'showcase-draft',
        status: 'draft',
      },
      {
        ...baseShowcase,
        id: 'showcase-archived',
        status: 'archived',
      },
    ]);

    const visibleShowcases = await listHomeShowcases(store, 'team_member');

    assert.deepEqual(
      visibleShowcases.map((showcase) => showcase.id),
      ['showcase-public'],
    );
  });

  it('sorts by latest publishedAt or updatedAt first', async () => {
    const store = createInMemoryShowcaseStore([
      {
        ...baseShowcase,
        id: 'showcase-updated-only',
        updatedAt: '2026-05-13T09:00:00.000Z',
      },
      {
        ...baseShowcase,
        id: 'showcase-old-published',
        publishedAt: '2026-05-12T09:00:00.000Z',
        updatedAt: '2026-05-14T09:00:00.000Z',
      },
      {
        ...baseShowcase,
        id: 'showcase-new-published',
        publishedAt: '2026-05-15T09:00:00.000Z',
        updatedAt: '2026-05-10T09:00:00.000Z',
      },
    ]);

    const visibleShowcases = await listHomeShowcases(store, 'visitor');

    assert.deepEqual(
      visibleShowcases.map((showcase) => showcase.id),
      [
        'showcase-new-published',
        'showcase-updated-only',
        'showcase-old-published',
      ],
    );
  });
});

describe('showcase normalization', () => {
  it('allows http links and local paths but rejects unsafe href protocols', () => {
    assert.equal(
      getSafeShowcaseHref('https://example.com/demo'),
      'https://example.com/demo',
    );
    assert.equal(getSafeShowcaseHref('/showcase/demo'), '/showcase/demo');
    assert.equal(getSafeShowcaseHref('//evil.example.com'), undefined);
    assert.equal(getSafeShowcaseHref('javascript:alert(1)'), undefined);
  });

  it('normalizes old stored showcase data without tags', () => {
    const [showcase] = normalizeShowcases([
      {
        id: 'legacy-showcase',
        title: 'Legacy Showcase',
        summary: 'Old localStorage data without tags.',
        kind: 'gallery',
        visibility: 'public',
        status: 'published',
        href: 'javascript:alert(1)',
        createdAt: '2026-05-11T09:00:00.000Z',
        updatedAt: '2026-05-11T09:00:00.000Z',
      },
    ]);

    assert.deepEqual(showcase?.tags, []);
    assert.equal(showcase?.href, undefined);
  });

  it('ignores invalid stored showcase records', () => {
    assert.deepEqual(
      normalizeShowcases([
        null,
        {
          id: 'missing-required-fields',
          kind: 'gallery',
        },
      ]),
      [],
    );
  });
});
