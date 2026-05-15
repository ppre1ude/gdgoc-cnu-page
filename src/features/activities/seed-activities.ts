import type { Activity } from '@/domain/activity';

export const officialBuildWithAiEventUrl =
  'https://gdg.community.dev/events/details/google-gdg-on-campus-chonnam-national-university-gwangju-south-korea-presents-build-with-ai-prompt-to-product/';

export const seedActivities: Activity[] = [
  {
    id: 'seed-bwai',
    title: 'Build with AI Prototype Sprint',
    summary:
      'Firebase, Gemini, AI Studio를 사용해 초기 프로토타입을 만드는 챕터 데모.',
    type: 'event',
    visibility: 'public',
    status: 'published',
    startsAt: '2026-05-16T04:00:00.000Z',
    registrationMode: 'hybrid',
    externalRegistrationUrl: officialBuildWithAiEventUrl,
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'seed-study',
    title: 'Gemini API Study',
    summary:
      'Google AI Studio와 Gemini API를 실습하며 서비스 아이디어를 시작하는 스터디.',
    type: 'study',
    visibility: 'member',
    status: 'published',
    startsAt: '2026-05-21T10:00:00.000Z',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'seed-project',
    title: 'Chapter Activity Hub',
    summary:
      'GDGoC CNU 활동, 공지, 참여 현황을 한눈에 보여주는 홈페이지 프로젝트.',
    type: 'project',
    visibility: 'member',
    status: 'published',
    startsAt: '2026-05-18T10:00:00.000Z',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'seed-challenge',
    title: 'GitHub Grass Challenge',
    summary:
      '계정 연동 자동화 전까지 운영진이 수동으로 안내하는 개발 습관 챌린지.',
    type: 'challenge',
    visibility: 'member',
    status: 'published',
    startsAt: '2026-05-25T00:00:00.000Z',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
];
