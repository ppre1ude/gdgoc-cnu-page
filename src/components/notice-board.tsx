import { Box, FlexBox, Typography } from '@wanteddev/wds';
import type { ElementType, ReactNode } from 'react';

import { WdsBadge, WdsEmptyState } from '@/components/wds-form-controls';
import type { Notice } from '@/domain/notice';
import { formatKoreanDate } from '@/lib/format-korean-date-time';

const PolymorphicBox = Box as unknown as ElementType;

const visibilityLabel: Record<Notice['visibility'], string> = {
  public: 'Public',
  member: 'Member',
  operator: 'Operator',
};

const noticeBoardSx = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
};

const noticeHeaderSx = {
  background: 'var(--surface-muted)',
  borderBottom: '1px solid var(--line)',
  color: 'var(--text-muted)',
  fontSize: '12px',
  fontWeight: 800,
  '@media (max-width: 560px)': {
    display: 'none',
  },
};

const noticeTitleSx = {
  color: 'var(--text-strong)',
  display: 'block',
  fontSize: '16px',
  letterSpacing: 0,
  lineHeight: 1.35,
  overflowWrap: 'anywhere' as const,
};

const noticeBodySx = {
  color: 'var(--text-muted)',
  fontSize: '14px',
  lineHeight: 1.55,
  margin: '6px 0 0',
  overflowWrap: 'anywhere' as const,
};

const noticeCellSx = {
  minWidth: 0,
};

const noticeStatusDateCellSx = {
  ...noticeCellSx,
  '@media (max-width: 560px)': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
};

const noticeDateSx = {
  color: 'var(--text-muted)',
  fontSize: '13px',
};

function getNoticeRowSx({
  columnTemplate,
  isHeader = false,
  isPinned = false,
}: {
  columnTemplate: string;
  isHeader?: boolean;
  isPinned?: boolean;
}) {
  return {
    alignItems: 'center',
    display: 'grid',
    gap: '14px',
    gridTemplateColumns: columnTemplate,
    padding: '14px 16px',
    ...(isHeader ? noticeHeaderSx : { borderBottom: '1px solid var(--line)' }),
    ...(isPinned
      ? { background: 'rgb(var(--semantic-status-cautionary-rgb) / 0.1)' }
      : {}),
    '&:last-child': {
      borderBottom: 0,
    },
    '@media (max-width: 560px)': {
      ...(isHeader ? { display: 'none' } : {}),
      alignItems: 'start',
      gap: '10px',
      gridTemplateColumns: '1fr',
    },
  };
}

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

  const columnTemplate = renderActions
    ? '92px minmax(0, 1fr) 92px 110px 150px'
    : '92px minmax(0, 1fr) 92px 110px';

  return (
    <Box aria-label="공지사항 목록" role="table" sx={noticeBoardSx}>
      <PolymorphicBox
        role="row"
        sx={getNoticeRowSx({ columnTemplate, isHeader: true })}
      >
        <span role="columnheader">상태</span>
        <span role="columnheader">제목</span>
        <span role="columnheader">범위</span>
        <span role="columnheader">수정일</span>
        {renderActions ? <span role="columnheader">관리</span> : null}
      </PolymorphicBox>
      {notices.map((notice) => (
        <PolymorphicBox
          as="article"
          key={notice.id}
          role="row"
          sx={getNoticeRowSx({
            columnTemplate,
            isPinned: notice.pinned,
          })}
        >
          <Box role="cell" sx={noticeStatusDateCellSx}>
            {notice.pinned ? (
              <WdsBadge tone="green">Pinned</WdsBadge>
            ) : (
              <WdsBadge>Notice</WdsBadge>
            )}
          </Box>
          <Box role="cell" sx={noticeCellSx}>
            <Typography as="strong" sx={noticeTitleSx}>
              {notice.title}
            </Typography>
            <Typography as="p" sx={noticeBodySx}>
              {notice.body}
            </Typography>
          </Box>
          <Box role="cell" sx={noticeCellSx}>
            <WdsBadge>{visibilityLabel[notice.visibility]}</WdsBadge>
          </Box>
          <Box role="cell" sx={noticeStatusDateCellSx}>
            <Typography as="span" sx={noticeDateSx}>
              {formatKoreanDate(notice.updatedAt)}
            </Typography>
          </Box>
          {renderActions ? (
            <FlexBox
              alignItems="center"
              flexWrap="wrap"
              gap="8px"
              role="cell"
              sx={noticeCellSx}
            >
              {renderActions(notice)}
            </FlexBox>
          ) : null}
        </PolymorphicBox>
      ))}
    </Box>
  );
}
