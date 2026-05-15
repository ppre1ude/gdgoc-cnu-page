export type OnboardingValueBadge = {
  accent: 'blue' | 'red' | 'yellow' | 'green';
  label: string;
};

export type OnboardingBrandPoint = {
  detail: string;
  label: string;
  value: string;
};

export type OnboardingValueProcessStep = {
  accent: 'blue' | 'red' | 'yellow' | 'green';
  detail: string;
  kicker: string;
  label: string;
  title: string;
};

export const onboardingValueBadges: OnboardingValueBadge[] = [
  { accent: 'blue', label: 'Connect' },
  { accent: 'yellow', label: 'Learn' },
  { accent: 'green', label: 'Grow' },
];

export const onboardingPosterPipeline = [
  'Connect',
  'Learn',
  'Grow',
  'Impact',
] as const;

export const onboardingValueProcess: OnboardingValueProcessStep[] = [
  {
    accent: 'blue',
    detail:
      '학교 안팎의 동료, 멘토, 파트너와 연결되어 더 넓은 개발자 네트워크를 만듭니다.',
    kicker: 'Network',
    label: 'Connect',
    title: '함께할 사람을 만납니다.',
  },
  {
    accent: 'yellow',
    detail:
      '워크숍과 핸즈온에서 Google 기술과 AI를 직접 다루고 서로 설명하며 배움을 공유합니다.',
    kicker: 'Workshop',
    label: 'Learn',
    title: '실습으로 기술을 익힙니다.',
  },
  {
    accent: 'red',
    detail:
      '아이디어를 작은 프로젝트로 구현하며 협업과 문제 해결 경험을 쌓습니다.',
    kicker: 'Project',
    label: 'Grow',
    title: '프로젝트로 경험을 쌓습니다.',
  },
  {
    accent: 'green',
    detail:
      '프로젝트와 기록을 공유해 배움이 다음 커뮤니티 활동의 출발점이 되게 합니다.',
    kicker: 'Community',
    label: 'Impact',
    title: '배운 것을 커뮤니티에 나눕니다.',
  },
];

export const onboardingBrandPoints: OnboardingBrandPoint[] = [
  {
    detail:
      '학생들이 기술로 성장하고, 그 성장이 학교와 지역 커뮤니티의 변화로 이어지도록 돕습니다.',
    label: 'Goal',
    value: 'Impact & Empower',
  },
  {
    detail:
      '워크숍, 테크톡, 핸즈온, 프로젝트를 통해 배움을 실행 가능한 경험으로 바꿉니다.',
    label: 'Roles',
    value: 'Workshops & Projects',
  },
  {
    detail:
      '전문성, 협업 경험, 네트워크를 함께 키우며 서로 배우는 문화를 만듭니다.',
    label: 'Benefits',
    value: 'Growth & Network',
  },
];
