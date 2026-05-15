import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toOptionalActivityStartIso } from './activity-admin-model.ts';

describe('activity admin model', () => {
  it('omits blank activity start values', () => {
    assert.equal(toOptionalActivityStartIso(''), undefined);
    assert.equal(toOptionalActivityStartIso('   '), undefined);
  });

  it('normalizes valid activity start values to ISO strings', () => {
    assert.equal(
      toOptionalActivityStartIso('2026-05-16T04:00:00.000Z'),
      '2026-05-16T04:00:00.000Z',
    );
  });

  it('rejects invalid activity start values before saving', () => {
    assert.throws(
      () => toOptionalActivityStartIso('not-a-date'),
      /Activity start date is invalid/,
    );
  });
});
