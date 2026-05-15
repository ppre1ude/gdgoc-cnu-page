export type MemberDashboardDestinationId =
  | 'calendar'
  | 'notices'
  | 'studies'
  | 'projects'
  | 'records';

export type MemberDashboardDestination = {
  description: string;
  href: string;
  id: MemberDashboardDestinationId;
  label: string;
  title: string;
};

export const memberDashboardDestinations = [
  {
    description: '다가오는 이벤트, 스터디 모임, 프로젝트 마일스톤을 시간순으로 확인합니다.',
    href: '/calendar',
    id: 'calendar',
    label: 'Calendar',
    title: '다음 일정 확인',
  },
  {
    description: '고정 공지와 최근 공지를 한곳에서 읽고 중요한 변경사항을 놓치지 않습니다.',
    href: '/notices',
    id: 'notices',
    label: 'Notices',
    title: '중요 공지 확인',
  },
  {
    description: '현재 모집 중이거나 진행 중인 스터디를 살펴보고 참여할 항목을 고릅니다.',
    href: '/studies',
    id: 'studies',
    label: 'Studies',
    title: '스터디 탐색',
  },
  {
    description: '진행 중인 프로젝트와 새로 열릴 프로젝트 기회를 확인하고 신청합니다.',
    href: '/projects',
    id: 'projects',
    label: 'Projects',
    title: '프로젝트 탐색',
  },
  {
    description: '회고, 리뷰, 기술 노트처럼 오래 남길 챕터 기록을 찾아봅니다.',
    href: '/records',
    id: 'records',
    label: 'Records',
    title: '기록 살펴보기',
  },
] as const satisfies readonly MemberDashboardDestination[];

export function getMemberDashboardDestination(
  id: MemberDashboardDestinationId,
) {
  return memberDashboardDestinations.find((destination) => destination.id === id);
}
