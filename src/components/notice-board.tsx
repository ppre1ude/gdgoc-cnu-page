import type { ReactNode } from 'react';

import { WdsBadge, WdsEmptyState } from '@/components/wds-form-controls';
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
  renderActions,
}: {
  notices: Notice[];
  emptyMessage?: string;
  renderActions?: (notice: Notice) => ReactNode;
}) {
  if (notices.length === 0) {
    return <WdsEmptyState>{emptyMessage}</WdsEmptyState>;
  }

  return (
    <div
      aria-label="공지사항 목록"
      className={
        renderActions ? 'notice-board notice-board-with-actions' : 'notice-board'
      }
      role="table"
    >
      <div className="notice-board-head" role="row">
        <span role="columnheader">상태</span>
        <span role="columnheader">제목</span>
        <span role="columnheader">범위</span>
        <span role="columnheader">수정일</span>
        {renderActions ? <span role="columnheader">관리</span> : null}
      </div>
      {notices.map((notice) => (
        <article
          className={
            notice.pinned
              ? 'notice-board-row notice-board-row-pinned'
              : 'notice-board-row'
          }
          key={notice.id}
          role="row"
        >
          <div className="notice-board-cell notice-board-status" role="cell">
            {notice.pinned ? (
              <WdsBadge tone="green">Pinned</WdsBadge>
            ) : (
              <WdsBadge>Notice</WdsBadge>
            )}
          </div>
          <div className="notice-board-cell notice-board-title" role="cell">
            <strong>{notice.title}</strong>
            <p>{notice.body}</p>
          </div>
          <div className="notice-board-cell" role="cell">
            <WdsBadge>{visibilityLabel[notice.visibility]}</WdsBadge>
          </div>
          <div className="notice-board-cell notice-board-date" role="cell">
            {formatKoreanDate(notice.updatedAt)}
          </div>
          {renderActions ? (
            <div className="notice-board-cell notice-board-actions" role="cell">
              {renderActions(notice)}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
