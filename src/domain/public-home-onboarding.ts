export type OnboardingToolBadge = {
  accent: 'blue' | 'red' | 'yellow' | 'green';
  label: string;
};

export type OnboardingProofPoint = {
  detail: string;
  label: string;
  value: string;
};

export const onboardingToolBadges: OnboardingToolBadge[] = [
  { accent: 'blue', label: 'Gemini' },
  { accent: 'yellow', label: 'Firebase' },
  { accent: 'green', label: 'Stitch' },
  { accent: 'red', label: 'AI Studio' },
];

export const onboardingPosterPipeline = [
  '아이디어',
  'Gemini 초안',
  'Firebase 저장',
  '멤버 홈 반영',
] as const;

export const onboardingProofPoints: OnboardingProofPoint[] = [
  {
    detail: '운영진이 활동을 만들고 수정하면 Firestore에 저장됩니다.',
    label: 'Real CRUD',
    value: 'Firestore',
  },
  {
    detail: '거친 메모를 카드 요약, 멤버 공지, 공개 문구로 정리합니다.',
    label: 'AI-assisted copy',
    value: 'Gemini',
  },
  {
    detail: '저장된 활동은 멤버 홈의 현재 활동 흐름에 바로 반영됩니다.',
    label: 'Member reflection',
    value: 'Live hub',
  },
];
