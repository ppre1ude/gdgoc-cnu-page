export type AdminDashboardSectionId =
  | 'overview'
  | 'environment'
  | 'seed'
  | 'analytics'
  | 'approvals';

export type AdminDashboardSection = {
  description: string;
  id: AdminDashboardSectionId;
  label: string;
  title: string;
};

export const adminDashboardSections = [
  {
    description: '세부 운영 도구와 데모 모드 안내를 한 번에 확인합니다.',
    id: 'overview',
    label: 'Overview',
    title: '운영 도구',
  },
  {
    description: 'Firebase, Gemini, localStorage bridge 준비 상태를 점검합니다.',
    id: 'environment',
    label: 'Environment',
    title: '데모 환경',
  },
  {
    description: '발표와 QA에 필요한 샘플 데이터를 한 번에 채웁니다.',
    id: 'seed',
    label: 'Seed Data',
    title: '데모 데이터',
  },
  {
    description: '멤버, 신청, 출석 흐름의 핵심 운영 지표를 확인합니다.',
    id: 'analytics',
    label: 'Analytics',
    title: '운영 지표',
  },
  {
    description: '가입 대기 멤버를 검토하고 승인 흐름을 확인합니다.',
    id: 'approvals',
    label: 'Approvals',
    title: '멤버 승인',
  },
] as const satisfies readonly AdminDashboardSection[];

const sectionIds = new Set<AdminDashboardSectionId>(
  adminDashboardSections.map((section) => section.id),
);

export function getAdminDashboardSectionHref(
  sectionId: AdminDashboardSectionId,
) {
  return sectionId === 'overview' ? '/admin' : `/admin?section=${sectionId}`;
}

export function resolveAdminDashboardSectionId(
  sectionId?: string | null,
): AdminDashboardSectionId {
  return sectionIds.has(sectionId as AdminDashboardSectionId)
    ? (sectionId as AdminDashboardSectionId)
    : 'overview';
}
