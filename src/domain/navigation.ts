import type { UserRole } from './activity.ts';

export type NavigationAudience = UserRole | 'visitor';

export type NavigationItem = {
  href: string;
  label: string;
};

export type AdminNavigationItem = NavigationItem & {
  description: string;
};

type AdminNavigationItemDefinition = AdminNavigationItem & {
  allowedRoles: ReadonlySet<UserRole>;
};

const sharedAdminToolRoles = new Set<UserRole>([
  'team_member',
  'organizer',
  'admin',
]);

const adminOnlyRoles = new Set<UserRole>(['admin']);
const operatorRoles = sharedAdminToolRoles;

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

const adminNavigationItems: AdminNavigationItemDefinition[] = [
  {
    description:
      '활동을 등록하고 Gemini 작성 보조, 신청 승인, 출석 흐름을 확인합니다.',
    href: '/admin/activities',
    allowedRoles: sharedAdminToolRoles,
    label: 'Activity Admin',
  },
  {
    description:
      '공지사항을 등록하고 핀 고정, 공개 범위, 멤버 홈 노출을 관리합니다.',
    href: '/admin/notices',
    allowedRoles: sharedAdminToolRoles,
    label: 'Notice Admin',
  },
  {
    description:
      '회고, 리뷰, 기술 노트처럼 오래 남길 챕터 기록을 검토하고 게시합니다.',
    href: '/admin/records',
    allowedRoles: sharedAdminToolRoles,
    label: 'Record Admin',
  },
  {
    description:
      '성과, 회고, 갤러리, 프로젝트 결과를 등록하고 공개 범위를 관리합니다.',
    href: '/admin/showcases',
    allowedRoles: sharedAdminToolRoles,
    label: 'Showcase Admin',
  },
  {
    description:
      '가입한 사용자의 역할을 조정하고 변경 이력을 확인합니다.',
    href: '/admin/roles',
    allowedRoles: adminOnlyRoles,
    label: 'Role Admin',
  },
];

export function getAdminNavigationItems(
  audience?: NavigationAudience,
): AdminNavigationItem[] {
  const items = audience
    ? adminNavigationItems.filter((item) => item.allowedRoles.has(audience))
    : adminNavigationItems;

  return items.map(toAdminNavigationItem);
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
