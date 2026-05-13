import type { ChapterRecord } from '@/domain/chapter-record';
import { formatKoreanDate } from '@/lib/format-korean-date-time';

export function ChapterRecordCard({ record }: { record: ChapterRecord }) {
  return (
    <article className="card">
      <div className="badge-row">
        <span className="badge badge-blue">{getRecordKindLabel(record.kind)}</span>
        <span className="badge">{record.visibility}</span>
        {record.showcaseCandidate ? (
          <span className="badge badge-green">Showcase Candidate</span>
        ) : null}
      </div>
      <h3>{record.title}</h3>
      <p>{record.summary}</p>
      <div className="badge-row" style={{ marginTop: 14 }}>
        {record.tags.map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <p className="helper-text" style={{ marginTop: 14 }}>
        {record.authorUserId}
        {record.publishedAt ? ` · ${formatKoreanDate(record.publishedAt)}` : ''}
      </p>
    </article>
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

