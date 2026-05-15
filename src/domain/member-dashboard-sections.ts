export type MemberDashboardSectionId =
  | 'overview'
  | 'calendar'
  | 'notices'
  | 'applications'
  | 'studies'
  | 'projects'
  | 'community'
  | 'showcase'
  | 'records'
  | 'propose'
  | 'write-record';

type MemberDashboardSectionCapability = 'read' | 'apply' | 'write';

export type MemberDashboardSection = {
  capability: MemberDashboardSectionCapability;
  description: string;
  id: MemberDashboardSectionId;
  label: string;
  title: string;
};

export type MemberDashboardSectionVisibility = {
  canApplyToActivities: boolean;
  canProposeActivities: boolean;
};

export const memberDashboardSections = [
  {
    capability: 'read',
    description: '오늘 확인할 역할, 일정, 공지, 참여 상태를 한 번에 봅니다.',
    id: 'overview',
    label: 'Overview',
    title: 'Dashboard Overview',
  },
  {
    capability: 'read',
    description: '가까운 이벤트, 스터디, 프로젝트 일정을 시간순으로 봅니다.',
    id: 'calendar',
    label: 'Calendar',
    title: '이번 일정',
  },
  {
    capability: 'read',
    description: '고정 공지와 최근 공지를 놓치지 않게 확인합니다.',
    id: 'notices',
    label: 'Notices',
    title: '중요 공지',
  },
  {
    capability: 'apply',
    description: '내가 신청했거나 승인된 활동과 다음 행동을 봅니다.',
    id: 'applications',
    label: 'My Applications',
    title: '내 신청 현황',
  },
  {
    capability: 'read',
    description: '모집 중이거나 진행 중인 스터디를 탐색합니다.',
    id: 'studies',
    label: 'Studies',
    title: '스터디 현황',
  },
  {
    capability: 'read',
    description: '진행 중인 프로젝트와 새로 열린 프로젝트 기회를 봅니다.',
    id: 'projects',
    label: 'Projects',
    title: '프로젝트 현황',
  },
  {
    capability: 'read',
    description: '챌린지와 친목 활동처럼 커뮤니티 참여 흐름을 봅니다.',
    id: 'community',
    label: 'Community',
    title: '챌린지 / 친목',
  },
  {
    capability: 'read',
    description: '최근 활동 성과, 회고, 프로젝트 결과를 둘러봅니다.',
    id: 'showcase',
    label: 'Showcase',
    title: '쇼케이스',
  },
  {
    capability: 'read',
    description: '오래 남길 회고, 리뷰, 기술 노트를 모아 봅니다.',
    id: 'records',
    label: 'Records',
    title: '긴 글 기록',
  },
  {
    capability: 'write',
    description: '직접 열고 싶은 스터디나 프로젝트를 제안합니다.',
    id: 'propose',
    label: 'Propose',
    title: '스터디 / 프로젝트 제안',
  },
  {
    capability: 'write',
    description: '회고, 리뷰, 기술 노트를 멤버 기록으로 제출합니다.',
    id: 'write-record',
    label: 'Write Record',
    title: '기록 제출',
  },
] as const satisfies readonly MemberDashboardSection[];

const sectionIds = new Set<MemberDashboardSectionId>(
  memberDashboardSections.map((section) => section.id),
);

export function getMemberDashboardSectionHref(
  sectionId: MemberDashboardSectionId,
) {
  return sectionId === 'overview' ? '/member' : `/member?section=${sectionId}`;
}

export function resolveMemberDashboardSectionId(
  sectionId?: string | null,
): MemberDashboardSectionId {
  return sectionIds.has(sectionId as MemberDashboardSectionId)
    ? (sectionId as MemberDashboardSectionId)
    : 'overview';
}

export function getVisibleMemberDashboardSections({
  canApplyToActivities,
  canProposeActivities,
}: MemberDashboardSectionVisibility) {
  return memberDashboardSections.filter((section) => {
    if (section.capability === 'apply') {
      return canApplyToActivities;
    }

    if (section.capability === 'write') {
      return canProposeActivities;
    }

    return true;
  });
}
