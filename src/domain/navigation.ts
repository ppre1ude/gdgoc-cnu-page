import type { UserRole } from './activity.ts';

export type NavigationAudience = UserRole | 'visitor';

export type NavigationItem = {
  href: string;
  label: string;
};

export type AdminNavigationItem = NavigationItem & {
  description: string;
};

const operatorRoles = new Set<NavigationAudience>([
  'team_member',
  'organizer',
  'admin',
]);

export function getPrimaryNavigationItems(
  audience: NavigationAudience,
): NavigationItem[] {
  const items: NavigationItem[] = [
    { href: '/', label: 'Public' },
    { href: '/member', label: 'Member Home' },
  ];

  if (operatorRoles.has(audience)) {
    items.push({ href: '/admin', label: 'Admin' });
  }

  return items;
}

export function getAdminNavigationItems(): AdminNavigationItem[] {
  return [
    {
      description:
        '활동을 등록하고 Gemini 작성 보조, 신청 승인, 출석 흐름을 확인합니다.',
      href: '/admin/activities',
      label: 'Activity Admin',
    },
    {
      description:
        '공지사항을 등록하고 핀 고정, 공개 범위, 멤버 홈 노출을 관리합니다.',
      href: '/admin/notices',
      label: 'Notice Admin',
    },
  ];
}
