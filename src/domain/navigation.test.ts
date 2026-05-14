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
    assert.equal(hrefs.includes('/admin/records'), false);
    assert.equal(hrefs.includes('/admin/showcases'), false);
    assert.equal(hrefs.includes('/admin/roles'), false);
  });

  it('keeps admin entry out of visitor and member navigation', () => {
    for (const audience of ['visitor', 'guest', 'member', 'alumni'] as const) {
      assert.equal(
        getPrimaryNavigationItems(audience).some((item) => item.href === '/admin'),
        false,
      );
    }
  });

  it('exposes the admin dashboard only to operator roles', () => {
    for (const audience of ['team_member', 'organizer', 'admin'] as const) {
      assert.equal(
        getPrimaryNavigationItems(audience).some((item) => item.href === '/admin'),
        true,
      );
    }
  });

  it('keeps all individual admin tools out of the top navigation', () => {
    const adminToolHrefs = getAdminNavigationItems().map((item) => item.href);

    for (const audience of [
      'visitor',
      'guest',
      'member',
      'alumni',
      'team_member',
      'organizer',
      'admin',
    ] as const) {
      const primaryHrefs = getPrimaryNavigationItems(audience).map(
        (item) => item.href,
      );

      assert.equal(
        adminToolHrefs.some((href) => primaryHrefs.includes(href)),
        false,
      );
    }
  });

  it('returns no primary navigation item below a primary route', () => {
    for (const audience of ['team_member', 'organizer', 'admin'] as const) {
      assert.deepEqual(
        getPrimaryNavigationItems(audience).map((item) => item.href),
        ['/', '/member', '/admin'],
      );
    }
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
          href: '/admin/records',
          label: 'Record Admin',
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
  });

  it('filters shared admin tools for operator roles', () => {
    const sharedToolHrefs = [
      '/admin/activities',
      '/admin/notices',
      '/admin/records',
      '/admin/showcases',
    ];

    for (const role of ['team_member', 'organizer'] as const) {
      assert.deepEqual(
        getAdminNavigationItems(role).map((item) => item.href),
        sharedToolHrefs,
      );
    }
  });

  it('exposes role administration only to admins', () => {
    assert.deepEqual(
      getAdminNavigationItems('admin').map((item) => item.href),
      [
        '/admin/activities',
        '/admin/notices',
        '/admin/records',
        '/admin/showcases',
        '/admin/roles',
      ],
    );

    for (const role of ['team_member', 'organizer'] as const) {
      assert.equal(
        getAdminNavigationItems(role).some((item) => item.href === '/admin/roles'),
        false,
      );
    }
  });

  it('does not expose admin tools to non-operator roles', () => {
    for (const role of ['visitor', 'guest', 'member', 'alumni'] as const) {
      assert.deepEqual(getAdminNavigationItems(role), []);
    }
  });

  it('includes descriptions for every admin navigation item', () => {
    const adminItems = getAdminNavigationItems();

    assert.equal(
      adminItems.every((item) => item.description.length > 0),
      true,
    );
  });
});
