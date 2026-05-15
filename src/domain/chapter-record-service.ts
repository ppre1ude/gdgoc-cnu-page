import type {
  ActivityVisibility,
  UserRole,
} from './activity.ts';
import {
  type ChapterRecord,
  type ChapterRecordKind,
  type ChapterRecordStatus,
  listVisibleChapterRecords,
} from './chapter-record.ts';
import {
  isActiveMemberRole,
  isOperatorRole,
} from './role-access-policy.ts';

export type ChapterRecordStore = {
  create(record: ChapterRecord): Promise<ChapterRecord>;
  save(record: ChapterRecord): Promise<ChapterRecord>;
  list(role?: UserRole): Promise<ChapterRecord[]>;
};

export type SubmitChapterRecordInput = {
  actorRole: UserRole;
  actorUserId: string;
  title: string;
  summary: string;
  body: string;
  kind: ChapterRecordKind;
  visibility: ActivityVisibility;
  status: Extract<ChapterRecordStatus, 'draft' | 'pending_review'>;
  showcaseCandidate?: boolean;
  tags?: string[];
  relatedActivityId?: string;
  now: string;
};

export type PublishChapterRecordInput = {
  actorRole: UserRole;
  actorUserId: string;
  recordId: string;
  visibility?: ActivityVisibility;
  showcaseCandidate: boolean;
  now: string;
};

export function createInMemoryChapterRecordStore(
  initialRecords: ChapterRecord[] = [],
): ChapterRecordStore {
  const records = [...initialRecords];

  return {
    async create(record) {
      records.push(record);
      return record;
    },
    async save(record) {
      const index = records.findIndex((current) => current.id === record.id);

      if (index === -1) {
        records.push(record);
        return record;
      }

      records[index] = record;
      return record;
    },
    async list() {
      return [...records];
    },
  };
}

export async function submitChapterRecord(
  store: ChapterRecordStore,
  input: SubmitChapterRecordInput,
): Promise<ChapterRecord> {
  if (!isActiveMemberRole(input.actorRole)) {
    throw new Error('Only active members can submit chapter records.');
  }

  return store.create({
    id: `record-${crypto.randomUUID()}`,
    title: input.title,
    summary: input.summary,
    body: input.body,
    kind: input.kind,
    visibility: input.visibility,
    status: input.status,
    authorUserId: input.actorUserId,
    showcaseCandidate: input.showcaseCandidate ?? false,
    tags: normalizeTags(input.tags ?? []),
    relatedActivityId: input.relatedActivityId,
    submittedAt: input.status === 'pending_review' ? input.now : undefined,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

export async function listPendingChapterRecords(
  store: ChapterRecordStore,
  actorRole: UserRole,
): Promise<ChapterRecord[]> {
  if (!isOperatorRole(actorRole)) {
    throw new Error('Only operators can list pending chapter records.');
  }

  const records = await store.list(actorRole);

  return records
    .filter((record) => record.status === 'pending_review')
    .sort((a, b) => {
      const submittedA = a.submittedAt ?? a.updatedAt;
      const submittedB = b.submittedAt ?? b.updatedAt;

      return submittedA === submittedB
        ? a.title.localeCompare(b.title)
        : submittedA.localeCompare(submittedB);
    });
}

export async function publishChapterRecord(
  store: ChapterRecordStore,
  input: PublishChapterRecordInput,
): Promise<ChapterRecord> {
  if (!isOperatorRole(input.actorRole)) {
    throw new Error('Only operators can publish chapter records.');
  }

  const records = await store.list(input.actorRole);
  const record = records.find((current) => current.id === input.recordId);

  if (!record) {
    throw new Error('Chapter record was not found.');
  }

  if (record.status !== 'pending_review') {
    throw new Error('Only pending chapter records can be published.');
  }

  return store.save({
    ...record,
    status: 'published',
    visibility: input.visibility ?? record.visibility,
    showcaseCandidate: input.showcaseCandidate,
    publishedAt: input.now,
    publishedByUserId: input.actorUserId,
    reviewedAt: input.now,
    reviewedByUserId: input.actorUserId,
    updatedAt: input.now,
  });
}

export async function listHomeChapterRecords(
  store: ChapterRecordStore,
  role: UserRole,
): Promise<ChapterRecord[]> {
  const records = await store.list(role);

  return listVisibleChapterRecords(records, role).sort((a, b) => {
    const bTimestamp = b.publishedAt ?? b.updatedAt;
    const aTimestamp = a.publishedAt ?? a.updatedAt;

    return bTimestamp.localeCompare(aTimestamp);
  });
}

export async function getVisibleChapterRecordById(
  store: ChapterRecordStore,
  recordId: string,
  role: UserRole,
): Promise<ChapterRecord | null> {
  const records = await store.list(role);

  return (
    listVisibleChapterRecords(records, role).find(
      (record) => record.id === recordId,
    ) ?? null
  );
}

function normalizeTags(tags: string[]) {
  return tags.map((tag) => tag.trim()).filter(Boolean);
}
