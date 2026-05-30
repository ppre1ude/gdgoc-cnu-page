import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

  it('renders member branch navigation as WDS navigation links', () => {
    const source = readFileSync(
      new URL('../features/activities/member-category-page.tsx', import.meta.url),
      'utf8',
    );

    assert.equal(source.includes('member-flow-tabs'), false);
    assert.equal(source.includes('member-flow-tab'), false);
    assert.equal(source.includes('<SegmentedControl'), false);
    assert.equal(source.includes('<SegmentedControlItem'), false);
    assert.equal(source.includes('as="nav"'), true);
    assert.equal(source.includes('<TopNavigationButton'), true);
  });
});
