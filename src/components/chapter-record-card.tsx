import { WdsBadge, WdsTextLinkButton } from '@/components/wds-form-controls';
import { WdsSurfaceCard } from '@/components/wds-layout-primitives';
import type { ChapterRecord } from '@/domain/chapter-record';
import { formatKoreanDate } from '@/lib/format-korean-date-time';

export function ChapterRecordCard({ record }: { record: ChapterRecord }) {
  return (
    <WdsSurfaceCard as="article">
      <div className="badge-row">
        <WdsBadge tone="blue">{getRecordKindLabel(record.kind)}</WdsBadge>
        <WdsBadge>{record.visibility}</WdsBadge>
        {record.showcaseCandidate ? (
          <WdsBadge tone="green">Showcase Candidate</WdsBadge>
        ) : null}
      </div>
      <h3>{record.title}</h3>
      <p>{record.summary}</p>
      <div className="badge-row section-offset-sm">
        {record.tags.map((tag) => (
          <WdsBadge key={tag}>
            {tag}
          </WdsBadge>
        ))}
      </div>
      <p className="helper-text section-offset-sm">
        {record.authorUserId}
        {record.publishedAt ? ` / ${formatKoreanDate(record.publishedAt)}` : ''}
      </p>
      <div className="card-actions">
        <WdsTextLinkButton
          href={`/records/${encodeURIComponent(record.id)}`}
        >
          자세히
        </WdsTextLinkButton>
      </div>
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
