export type OnboardingValueBadge = {
  accent: 'blue' | 'red' | 'yellow' | 'green';
  label: string;
};

export type OnboardingBrandPoint = {
  detail: string;
  label: string;
  value: string;
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
