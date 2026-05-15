import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getMemberDashboardSectionHref,
  getVisibleMemberDashboardSections,
  memberDashboardSections,
  resolveMemberDashboardSectionId,
} from './member-dashboard-sections.ts';

describe('member dashboard sections', () => {
  it('keeps the member workspace sections in the sidebar order', () => {
    assert.deepEqual(
      memberDashboardSections.map((section) => ({
        href: getMemberDashboardSectionHref(section.id),
        id: section.id,
        label: section.label,
      })),
      [
        { href: '/member', id: 'overview', label: 'Overview' },
        { href: '/member?section=calendar', id: 'calendar', label: 'Calendar' },
        { href: '/member?section=notices', id: 'notices', label: 'Notices' },
        {
          href: '/member?section=applications',
          id: 'applications',
          label: 'My Applications',
        },
        { href: '/member?section=studies', id: 'studies', label: 'Studies' },
        { href: '/member?section=projects', id: 'projects', label: 'Projects' },
        { href: '/member?section=community', id: 'community', label: 'Community' },
        { href: '/member?section=showcase', id: 'showcase', label: 'Showcase' },
        { href: '/member?section=records', id: 'records', label: 'Records' },
        { href: '/member?section=propose', id: 'propose', label: 'Propose' },
        {
          href: '/member?section=write-record',
          id: 'write-record',
          label: 'Write Record',
        },
      ],
    );
  });

  it('resolves invalid or missing section parameters to overview', () => {
    assert.equal(resolveMemberDashboardSectionId(), 'overview');
    assert.equal(resolveMemberDashboardSectionId(''), 'overview');
    assert.equal(resolveMemberDashboardSectionId('unknown'), 'overview');
    assert.equal(resolveMemberDashboardSectionId('projects'), 'projects');
    assert.equal(resolveMemberDashboardSectionId('write-record'), 'write-record');
  });

  it('keeps read sections visible while hiding write-only actions from locked roles', () => {
    assert.deepEqual(
      getVisibleMemberDashboardSections({
        canApplyToActivities: false,
        canProposeActivities: false,
      }).map((section) => section.id),
      [
        'overview',
        'calendar',
        'notices',
        'studies',
        'projects',
        'community',
        'showcase',
        'records',
      ],
    );

    assert.deepEqual(
      getVisibleMemberDashboardSections({
        canApplyToActivities: true,
        canProposeActivities: true,
      }).map((section) => section.id),
      [
        'overview',
        'calendar',
        'notices',
        'applications',
        'studies',
        'projects',
        'community',
        'showcase',
        'records',
        'propose',
        'write-record',
      ],
    );
  });
});
