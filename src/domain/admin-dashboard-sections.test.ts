import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  adminDashboardSections,
  getAdminDashboardSectionHref,
  resolveAdminDashboardSectionId,
} from './admin-dashboard-sections.ts';

describe('admin dashboard sections', () => {
  it('keeps operator workspace sections in dashboard order', () => {
    assert.deepEqual(
      adminDashboardSections.map((section) => ({
        href: getAdminDashboardSectionHref(section.id),
        id: section.id,
        label: section.label,
      })),
      [
        { href: '/admin', id: 'overview', label: 'Overview' },
        {
          href: '/admin?section=environment',
          id: 'environment',
          label: 'Environment',
        },
        { href: '/admin?section=seed', id: 'seed', label: 'Seed Data' },
        {
          href: '/admin?section=analytics',
          id: 'analytics',
          label: 'Analytics',
        },
        {
          href: '/admin?section=approvals',
          id: 'approvals',
          label: 'Approvals',
        },
      ],
    );
  });

  it('resolves invalid or missing admin sections to overview', () => {
    assert.equal(resolveAdminDashboardSectionId(), 'overview');
    assert.equal(resolveAdminDashboardSectionId(''), 'overview');
    assert.equal(resolveAdminDashboardSectionId('unknown'), 'overview');
    assert.equal(resolveAdminDashboardSectionId('analytics'), 'analytics');
    assert.equal(resolveAdminDashboardSectionId('approvals'), 'approvals');
  });
});
