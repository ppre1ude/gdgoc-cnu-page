import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { memberDashboardDestinations } from './member-dashboard-destinations.ts';

describe('member dashboard destinations', () => {
  it('keeps the dashboard branch destinations in the documented member flow order', () => {
    assert.deepEqual(
      memberDashboardDestinations.map((destination) => ({
        href: destination.href,
        id: destination.id,
        label: destination.label,
      })),
      [
        { href: '/calendar', id: 'calendar', label: 'Calendar' },
        { href: '/notices', id: 'notices', label: 'Notices' },
        { href: '/studies', id: 'studies', label: 'Studies' },
        { href: '/projects', id: 'projects', label: 'Projects' },
        { href: '/records', id: 'records', label: 'Records' },
      ],
    );
  });

  it('describes each branch as a member action instead of an operator task', () => {
    assert.equal(
      memberDashboardDestinations.every(
        (destination) =>
          destination.title.length > 0 &&
          destination.description.length > 0 &&
          !/admin|operator/i.test(destination.description),
      ),
      true,
    );
  });
});
