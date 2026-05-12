import type { Notice } from '@/domain/notice';
import { formatKoreanDate } from '@/lib/format-korean-date-time';

const visibilityLabel: Record<Notice['visibility'], string> = {
  public: 'Public',
  member: 'Member',
  operator: 'Operator',
};

export function NoticeBoard({
  notices,
  emptyMessage = '등록된 공지사항이 없습니다.',
}: {
  notices: Notice[];
  emptyMessage?: string;
}) {
  if (notices.length === 0) {
    return <div className="empty">{emptyMessage}</div>;
  }

  return (
    <div className="notice-board" role="table" aria-label="공지사항 목록">
      <div className="notice-board-head" role="row">
        <span role="columnheader">상태</span>
        <span role="columnheader">제목</span>
        <span role="columnheader">범위</span>
        <span role="columnheader">수정일</span>
      </div>
      {notices.map((notice) => (
        <article
          className={notice.pinned ? 'notice-board-row notice-board-row-pinned' : 'notice-board-row'}
          key={notice.id}
          role="row"
        >
          <div className="notice-board-cell notice-board-status" role="cell">
            {notice.pinned ? (
              <span className="badge badge-green">Pinned</span>
            ) : (
              <span className="badge">Notice</span>
            )}
          </div>
          <div className="notice-board-cell notice-board-title" role="cell">
            <strong>{notice.title}</strong>
            <p>{notice.body}</p>
          </div>
          <div className="notice-board-cell" role="cell">
            <span className="badge">{visibilityLabel[notice.visibility]}</span>
          </div>
          <div className="notice-board-cell notice-board-date" role="cell">
            {formatDate(notice.updatedAt)}
          </div>
        </article>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return formatKoreanDate(value);
}
