import type { ActivityVisibility, UserRole } from './activity.ts';
import { canReadPublishedResource } from './role-access-policy.ts';

export type ChapterRecordKind = 'retrospective' | 'review' | 'technical_note';
export type ChapterRecordStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'archived';

export type ChapterRecord = {
  id: string;
  title: string;
  summary: string;
  body: string;
  kind: ChapterRecordKind;
  visibility: ActivityVisibility;
  status: ChapterRecordStatus;
  authorUserId: string;
  showcaseCandidate: boolean;
  tags: string[];
  relatedActivityId?: string;
  submittedAt?: string;
  publishedAt?: string;
  publishedByUserId?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  createdAt: string;
  updatedAt: string;
};

export function listVisibleChapterRecords(
  records: ChapterRecord[],
  role: UserRole,
): ChapterRecord[] {
  return records.filter((record) => canReadPublishedResource(role, record));
}
