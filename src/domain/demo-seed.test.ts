import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { seedMissingDocuments } from './demo-seed.ts';

describe('demo seed helpers', () => {
  it('writes only missing seed documents and reports skipped ids', async () => {
    const writtenIds: string[] = [];

    const result = await seedMissingDocuments({
      collection: 'activities',
      seeds: [
        { id: 'seed-bwai', title: 'Build with AI' },
        { id: 'seed-study', title: 'Gemini Study' },
      ],
      listExisting: async () => [{ id: 'seed-bwai', title: 'Edited title' }],
      writeSeed: async (seed) => {
        writtenIds.push(seed.id);
        return seed;
      },
    });

    assert.deepEqual(writtenIds, ['seed-study']);
    assert.deepEqual(result, {
      collection: 'activities',
      createdIds: ['seed-study'],
      skippedIds: ['seed-bwai'],
      totalSeedCount: 2,
    });
  });

  it('treats duplicate seed ids as one write target', async () => {
    const writtenIds: string[] = [];

    const result = await seedMissingDocuments({
      collection: 'notices',
      seeds: [
        { id: 'seed-notice-bwai', title: 'First' },
        { id: 'seed-notice-bwai', title: 'Duplicate' },
      ],
      listExisting: async () => [],
      writeSeed: async (seed) => {
        writtenIds.push(seed.id);
        return seed;
      },
    });

    assert.deepEqual(writtenIds, ['seed-notice-bwai']);
    assert.deepEqual(result.createdIds, ['seed-notice-bwai']);
    assert.deepEqual(result.skippedIds, []);
    assert.equal(result.totalSeedCount, 1);
  });
});
