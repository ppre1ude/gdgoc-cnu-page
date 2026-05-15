import type { UserRole } from './activity.ts';
import { koreanCopy } from './korean-copy.ts';
import {
  isAdminRole,
  isOperatorRole,
} from './role-access-policy.ts';

export type NavigationAudience = UserRole | 'visitor';

export type NavigationItem = {
  href: string;
  label: string;
};

export type AdminNavigationItem = NavigationItem & {
  description: string;
};

type AdminNavigationItemDefinition = AdminNavigationItem & {
  requiredAccess: 'admin' | 'operator';
};

export function getPrimaryNavigationItems(
  audience: NavigationAudience,
): NavigationItem[] {
  const items: NavigationItem[] = [
    { href: '/member', label: 'Dashboard' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/notices', label: 'Notices' },
    { href: '/studies', label: 'Studies' },
    { href: '/projects', label: 'Projects' },
    { href: '/records', label: 'Records' },
  ];

  if (isOperatorRole(audience)) {
    items.push({ href: '/admin', label: 'Admin' });
  }

  return items;
}

const adminNavigationItems: AdminNavigationItemDefinition[] = [
  {
    description: koreanCopy.navigation.admin.activities.description,
    href: '/admin/activities',
    requiredAccess: 'operator',
    label: 'Activity Admin',
  },
  {
    description: koreanCopy.navigation.admin.notices.description,
    href: '/admin/notices',
    requiredAccess: 'operator',
    label: 'Notice Admin',
  },
  {
    description: koreanCopy.navigation.admin.records.description,
    href: '/admin/records',
    requiredAccess: 'operator',
    label: 'Record Admin',
  },
  {
    description: koreanCopy.navigation.admin.showcases.description,
    href: '/admin/showcases',
    requiredAccess: 'operator',
    label: 'Showcase Admin',
  },
  {
    description: koreanCopy.navigation.admin.roles.description,
    href: '/admin/roles',
    requiredAccess: 'admin',
    label: 'Role Admin',
  },
];

export function getAdminNavigationItems(
  audience?: NavigationAudience,
): AdminNavigationItem[] {
  const items = audience
    ? adminNavigationItems.filter((item) =>
        canAccessAdminNavigationItem(audience, item),
      )
    : adminNavigationItems;

  return items.map(toAdminNavigationItem);
}

function canAccessAdminNavigationItem(
  audience: NavigationAudience,
  item: AdminNavigationItemDefinition,
) {
  return item.requiredAccess === 'admin'
    ? isAdminRole(audience)
    : isOperatorRole(audience);
}

function toAdminNavigationItem({
  description,
  href,
  label,
}: AdminNavigationItemDefinition): AdminNavigationItem {
  return {
    description,
    href,
    label,
  };
}
