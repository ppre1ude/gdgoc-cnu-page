export type OnboardingValueBadge = {
  accent: 'blue' | 'red' | 'yellow' | 'green';
  description: string;
  symbol: string;
  label: string;
  targetId: string;
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

export type OnboardingDetailSection = {
  accent: 'blue' | 'red' | 'yellow' | 'green';
  bullets: string[];
  description: string;
  kicker: string;
  order: string;
  targetId: string;
  title: string;
  tools: string[];
};

export const onboardingValueBadges: OnboardingValueBadge[] = [
  {
    accent: 'red',
    description: '학생에게 임팩트를 만들고, 학생이 기술로 커뮤니티에 임팩트를 만들도록 돕습니다.',
    label: 'Impact',
    symbol: 'IM',
    targetId: 'goal',
  },
  {
    accent: 'blue',
    description: 'Google Developers 생태계와 전남대학교 학생을 연결합니다.',
    label: 'Connect',
    symbol: '{}',
    targetId: 'connect',
  },
  {
    accent: 'yellow',
    description: '워크숍과 커뮤니티 학습으로 기술을 함께 익힙니다.',
    label: 'Learn',
    symbol: 'AI',
    targetId: 'learn',
  },
  {
    accent: 'green',
    description: '프로젝트 경험으로 전문성과 네트워크를 키웁니다.',
    label: 'Grow',
    symbol: '↗',
    targetId: 'grow',
  },
];

export const onboardingPosterPipeline = [
  'Impact',
  'Connect',
  'Learn',
  'Grow',
] as const;

export const onboardingValueProcess: OnboardingValueProcessStep[] = [
  {
    accent: 'blue',
    detail:
      'Google Developers 생태계, 전남대학교 학생, 멘토, 동료와 연결되어 신뢰할 수 있는 개발자 네트워크를 만듭니다.',
    kicker: 'Community',
    label: 'Connect',
    title: 'Google Developers 생태계와 연결됩니다.',
  },
  {
    accent: 'yellow',
    detail:
      '워크숍과 핸즈온에서 Google 기술과 AI를 직접 다루고 서로 설명하며 배움을 공유합니다.',
    kicker: 'Workshop',
    label: 'Learn',
    title: '커뮤니티 학습으로 기술을 익힙니다.',
  },
  {
    accent: 'green',
    detail:
      '프로젝트를 만들고 결과를 설명하며 professional growth, network growth, community learning을 경험합니다.',
    kicker: 'Project',
    label: 'Grow',
    title: '프로젝트와 커뮤니티 학습으로 성장합니다.',
  },
];

export const onboardingBrandPoints: OnboardingBrandPoint[] = [
  {
    detail:
      '학생들에게 임팩트를 만들고, 학생들이 기술로 커뮤니티에 임팩트를 만들도록 돕습니다.',
    label: 'Impact',
    value: 'Impact & Empower',
  },
  {
    detail:
      '워크숍을 열고 프로젝트를 만들며 배움을 실행 가능한 경험으로 바꿉니다.',
    label: 'Roles',
    value: 'Workshops & Projects',
  },
  {
    detail:
      '전문성, 네트워크, 커뮤니티 학습 경험을 함께 키웁니다.',
    label: 'Benefits',
    value: 'Growth & Learning',
  },
];

export const onboardingDetailSections: OnboardingDetailSection[] = [
  {
    accent: 'red',
    bullets: [
      '전남대학교 학생이 기술로 자신과 주변 커뮤니티에 만들 수 있는 임팩트를 먼저 이해합니다.',
      'GDGoC CNU 활동은 학생을 성장시키고, 그 성장이 다시 커뮤니티로 이어지도록 설계됩니다.',
      '온보딩은 단순 소개가 아니라 다음 워크숍과 프로젝트 참여로 이어지는 목표를 제시합니다.',
    ],
    description:
      'Impact는 GDGoC CNU가 왜 존재하는지 설명합니다. 학생에게 임팩트를 만들고, 학생이 기술로 커뮤니티에 임팩트를 만들도록 돕습니다.',
    kicker: 'Impact & Empower',
    order: '01.',
    targetId: 'goal',
    title: 'Impact',
    tools: ['Impact', 'Empower', 'Technology', 'Community'],
  },
  {
    accent: 'blue',
    bullets: [
      '전남대학교 학생이 Google Developers 생태계를 신뢰할 수 있는 방식으로 만납니다.',
      '운영진, 멘토, 동료와 연결되어 더 넓은 개발자 네트워크를 만듭니다.',
      '처음 온 학생도 질문하고 참여할 수 있는 커뮤니티 입구를 제공합니다.',
    ],
    description:
      'GDGoC CNU는 전남대학교 학생 개발자가 Google Developers 생태계와 연결되는 커뮤니티입니다.',
    kicker: 'Community',
    order: '02.',
    targetId: 'connect',
    title: 'Connect',
    tools: ['Google Developers', 'GDGoC CNU', 'Mentor', 'Network'],
  },
  {
    accent: 'yellow',
    bullets: [
      '워크숍과 핸즈온으로 최신 개발 흐름과 Google 기술을 함께 익힙니다.',
      '서로 설명하고 질문하며 혼자 공부할 때보다 빠르게 이해합니다.',
      'Build with AI 같은 캠페인은 학습을 시작하는 계절성 활동 예시입니다.',
    ],
    description:
      '학습은 혼자 끝나는 것이 아니라 커뮤니티 안에서 공유되고 다음 활동으로 이어집니다.',
    kicker: 'Workshop',
    order: '03.',
    targetId: 'learn',
    title: 'Learn',
    tools: ['Workshop', 'Hands-on', 'Community Learning'],
  },
  {
    accent: 'green',
    bullets: [
      '배운 내용을 프로젝트로 만들며 기술을 실제 경험으로 바꿉니다.',
      '프로젝트와 발표 경험을 통해 professional growth를 쌓습니다.',
      '함께 만든 결과와 회고를 커뮤니티 학습 자산으로 남깁니다.',
    ],
    description:
      '성장은 개인의 실력 향상에서 멈추지 않고 커뮤니티에 다시 영향을 주는 방향으로 이어집니다.',
    kicker: 'Project',
    order: '04.',
    targetId: 'grow',
    title: 'Grow',
    tools: ['Projects', 'Professional Growth', 'Network Growth'],
  },
];
