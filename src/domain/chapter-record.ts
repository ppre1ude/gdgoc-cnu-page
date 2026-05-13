import type { ActivityVisibility, UserRole } from './activity.ts';

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

const roleVisibilityRank: Record<UserRole, number> = {
  visitor: 0,
  guest: 0,
  member: 1,
  alumni: 1,
  team_member: 2,
  organizer: 2,
  admin: 2,
};

const recordVisibilityRank: Record<ActivityVisibility, number> = {
  public: 0,
  member: 1,
  operator: 2,
};

export function listVisibleChapterRecords(
  records: ChapterRecord[],
  role: UserRole,
): ChapterRecord[] {
  const allowedRank = roleVisibilityRank[role];

  return records.filter((record) => {
    if (record.status !== 'published') {
      return false;
    }

    return recordVisibilityRank[record.visibility] <= allowedRank;
  });
}
