import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatKoreanDate,
  formatKoreanDateTime,
} from './format-korean-date-time.ts';

describe('formatKoreanDateTime', () => {
  it('formats KST date text without relying on runtime locale day periods', () => {
    assert.equal(
      formatKoreanDateTime('2026-05-16T04:00:00.000Z'),
      '2026. 5. 16. 오후 1:00',
    );
  });

  it('formats midnight and morning times consistently', () => {
    assert.equal(
      formatKoreanDateTime('2026-05-15T15:00:00.000Z'),
      '2026. 5. 16. 오전 12:00',
    );
    assert.equal(
      formatKoreanDateTime('2026-05-16T00:05:00.000Z'),
      '2026. 5. 16. 오전 9:05',
    );
  });
});

describe('formatKoreanDate', () => {
  it('formats KST date text without relying on runtime locale output', () => {
    assert.equal(formatKoreanDate('2026-05-10T15:00:00.000Z'), '2026. 5. 11.');
  });
});
