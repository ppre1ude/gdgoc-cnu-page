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
    detail: '동료, 멘토, 파트너와 만나 성장의 방향을 넓힙니다.',
    kicker: 'Network',
    label: 'Connect',
    title: '사람과 기회를 연결합니다.',
  },
  {
    accent: 'yellow',
    detail: '최신 기술을 실습하고 서로 설명하며 배움을 공유합니다.',
    kicker: 'Workshop',
    label: 'Learn',
    title: '워크숍으로 함께 배웁니다.',
  },
  {
    accent: 'red',
    detail: '아이디어를 실제 결과물로 만들며 전문성과 네트워크 성장을 키웁니다.',
    kicker: 'Project',
    label: 'Grow',
    title: '프로젝트로 성장합니다.',
  },
  {
    accent: 'green',
    detail: '성장의 경험을 학교와 지역 커뮤니티에 다시 나눕니다.',
    kicker: 'Community',
    label: 'Impact',
    title: '커뮤니티로 확장합니다.',
  },
];

export const onboardingBrandPoints: OnboardingBrandPoint[] = [
  {
    detail:
      '학생들이 기술을 통해 성장하고, 다시 자신의 커뮤니티에 영향을 만들 수 있도록 돕습니다.',
    label: 'Goal',
    value: 'Impact & Empower',
  },
  {
    detail:
      '워크숍을 열고 프로젝트를 만들며, 배운 내용을 실제 결과물로 연결합니다.',
    label: 'Roles',
    value: 'Workshops & Projects',
  },
  {
    detail:
      '전문성, 네트워크, 커뮤니티 학습을 함께 키우는 성장 환경을 제공합니다.',
    label: 'Benefits',
    value: 'Growth & Community',
  },
];
