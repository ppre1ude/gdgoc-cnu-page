import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getAdminNavigationItems,
  getPrimaryNavigationItems,
} from './navigation.ts';

describe('primary navigation', () => {
  it('does not expose individual admin tools in the top navigation', () => {
    const hrefs = getPrimaryNavigationItems('team_member').map((item) => item.href);

    assert.equal(hrefs.includes('/admin'), true);
    assert.equal(hrefs.includes('/admin/activities'), false);
    assert.equal(hrefs.includes('/admin/notices'), false);
    assert.equal(hrefs.includes('/admin/showcases'), false);
    assert.equal(hrefs.includes('/admin/roles'), false);
  });

  it('keeps admin entry out of visitor and member navigation', () => {
    assert.equal(
      getPrimaryNavigationItems('visitor').some((item) => item.href === '/admin'),
      false,
    );
    assert.equal(
      getPrimaryNavigationItems('member').some((item) => item.href === '/admin'),
      false,
    );
  });
});

describe('admin navigation', () => {
  it('groups operator tools under the admin dashboard', () => {
    const adminItems = getAdminNavigationItems();

    assert.deepEqual(
      adminItems.map((item) => ({ href: item.href, label: item.label })),
      [
        {
          href: '/admin/activities',
          label: 'Activity Admin',
        },
        {
          href: '/admin/notices',
          label: 'Notice Admin',
        },
        {
          href: '/admin/showcases',
          label: 'Showcase Admin',
        },
        {
          href: '/admin/roles',
          label: 'Role Admin',
        },
      ],
    );
    assert.equal(
      adminItems.every((item) => item.description.length > 0),
      true,
    );
  });
});
