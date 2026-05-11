import type { ChapterUser } from '@/domain/chapter-user';

export const seedChapterUsers: ChapterUser[] = [
  {
    id: 'seed-user-guest-1',
    displayName: 'Minjun Kim',
    email: 'minjun.guest@example.com',
    role: 'guest',
    department: 'Computer Engineering',
    cohort: '3rd',
    studentId: '20241234',
    interests: 'Gemini API, Firebase, and campus productivity tools',
    motivation:
      'I want to prototype an AI assistant that helps students discover chapter activities.',
    profileSubmittedAt: '2026-05-10T09:20:00.000Z',
    createdAt: '2026-05-10T09:00:00.000Z',
    updatedAt: '2026-05-10T09:20:00.000Z',
  },
  {
    id: 'seed-user-guest-2',
    displayName: 'Seoyeon Lee',
    email: 'seoyeon.guest@example.com',
    role: 'guest',
    department: 'Media Communication',
    cohort: '2nd',
    studentId: '20252345',
    interests: 'Google Stitch, Nano Banana, and AI-assisted content design',
    motivation:
      'I want to build a demo page that turns event notes into shareable visual recaps.',
    profileSubmittedAt: '2026-05-11T02:45:00.000Z',
    createdAt: '2026-05-11T02:30:00.000Z',
    updatedAt: '2026-05-11T02:45:00.000Z',
  },
  {
    id: 'seed-user-member-1',
    displayName: 'Doyun Park',
    email: 'doyun.member@example.com',
    role: 'member',
    createdAt: '2026-05-01T03:00:00.000Z',
    updatedAt: '2026-05-02T03:00:00.000Z',
  },
];
