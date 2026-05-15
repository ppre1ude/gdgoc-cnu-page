import { WdsBadge, WdsTextLinkButton } from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsOffset,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import type { ChapterRecord } from '@/domain/chapter-record';
import { formatKoreanDate } from '@/lib/format-korean-date-time';

export function ChapterRecordCard({ record }: { record: ChapterRecord }) {
  return (
    <WdsSurfaceCard as="article">
      <WdsBadgeGroup>
        <WdsBadge tone="blue">{getRecordKindLabel(record.kind)}</WdsBadge>
        <WdsBadge>{record.visibility}</WdsBadge>
        {record.showcaseCandidate ? (
          <WdsBadge tone="green">Showcase Candidate</WdsBadge>
        ) : null}
      </WdsBadgeGroup>
      <h3>{record.title}</h3>
      <p>{record.summary}</p>
      <WdsBadgeGroup offset="sm">
        {record.tags.map((tag) => (
          <WdsBadge key={tag}>
            {tag}
          </WdsBadge>
        ))}
      </WdsBadgeGroup>
      <WdsOffset offset="sm">
        <p className="helper-text">
          {record.authorUserId}
          {record.publishedAt ? ` / ${formatKoreanDate(record.publishedAt)}` : ''}
        </p>
      </WdsOffset>
      <WdsActionRow offset="sm">
        <WdsTextLinkButton
          href={`/records/${encodeURIComponent(record.id)}`}
        >
          자세히
        </WdsTextLinkButton>
      </WdsActionRow>
    </WdsSurfaceCard>
  );
}

export function getRecordKindLabel(kind: ChapterRecord['kind']) {
  switch (kind) {
    case 'retrospective':
      return 'Retrospective';
    case 'review':
      return 'Review';
    case 'technical_note':
      return 'Technical Note';
  }
}
