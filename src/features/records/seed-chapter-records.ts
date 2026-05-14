import type { ChapterRecord } from '@/domain/chapter-record';

export const seedChapterRecords: ChapterRecord[] = [
  {
    id: 'seed-record-bwai-retro',
    title: 'Build with AI 운영 회고',
    summary:
      'Firebase, Gemini, AI Studio를 실제 데모 흐름에 얹으며 배운 운영 관점의 기록입니다.',
    body:
      'Build with AI 발표 준비 과정에서 정적 페이지보다 실제 상태가 바뀌는 제품 슬라이스가 더 설득력 있다는 점을 확인했습니다. Activity CRUD, AI 작성 보조, 멤버 홈 반영 흐름이 이후 운영 플랫폼의 기준점이 되었습니다.',
    kind: 'retrospective',
    visibility: 'member',
    status: 'published',
    authorUserId: 'team-member-demo',
    showcaseCandidate: true,
    tags: ['Build with AI', 'Firebase', 'Gemini'],
    relatedActivityId: 'seed-bwai',
    submittedAt: '2026-05-12T09:00:00.000Z',
    publishedAt: '2026-05-13T09:00:00.000Z',
    publishedByUserId: 'admin-demo',
    reviewedAt: '2026-05-13T09:00:00.000Z',
    reviewedByUserId: 'admin-demo',
    createdAt: '2026-05-12T09:00:00.000Z',
    updatedAt: '2026-05-13T09:00:00.000Z',
  },
  {
    id: 'seed-record-gemini-note',
    title: 'Gemini API Study 기술 노트',
    summary:
      'Gemini API를 스터디에서 다룰 때 먼저 확인해야 할 프롬프트, 응답 구조, 실패 처리 메모입니다.',
    body:
      '스터디에서는 API 호출 성공보다 구조화된 응답을 어떻게 검증하고 사용자가 수정할 수 있게 만들지에 집중합니다. 운영진 작성 보조 기능은 AI 결과가 공식 문구를 자동으로 덮어쓰지 않도록 side panel에서 제안만 보여주는 흐름이 적합했습니다.',
    kind: 'technical_note',
    visibility: 'public',
    status: 'published',
    authorUserId: 'member-demo',
    showcaseCandidate: false,
    tags: ['Gemini', 'AI Studio'],
    relatedActivityId: 'seed-study',
    submittedAt: '2026-05-12T11:00:00.000Z',
    publishedAt: '2026-05-14T09:00:00.000Z',
    publishedByUserId: 'team-member-demo',
    reviewedAt: '2026-05-14T09:00:00.000Z',
    reviewedByUserId: 'team-member-demo',
    createdAt: '2026-05-12T11:00:00.000Z',
    updatedAt: '2026-05-14T09:00:00.000Z',
  },
];

