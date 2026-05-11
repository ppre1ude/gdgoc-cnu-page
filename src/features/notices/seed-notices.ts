import type { Notice } from '@/domain/notice';

export const seedNotices: Notice[] = [
  {
    id: 'seed-notice-bwai',
    title: 'Build with AI 발표 데모 안내',
    body: '토요일 발표에서는 Activity CRUD, 참여 신청, 운영진 승인, Gemini 작성 보조 흐름을 보여줍니다.',
    visibility: 'member',
    status: 'published',
    pinned: true,
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: 'seed-notice-feedback',
    title: 'Sli.do 아이디어 조사 진행 중',
    body: '홈페이지에 들어가면 좋을 기능과 이스터에그 아이디어를 계속 받고 있습니다.',
    visibility: 'member',
    status: 'published',
    pinned: false,
    createdAt: '2026-05-11T08:00:00.000Z',
    updatedAt: '2026-05-11T08:00:00.000Z',
  },
];
