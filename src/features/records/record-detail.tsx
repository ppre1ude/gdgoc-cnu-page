'use client';

import { useEffect, useMemo, useState } from 'react';

import type { UserRole } from '@/domain/activity';
import type { ChapterRecord } from '@/domain/chapter-record';
import { getVisibleChapterRecordById } from '@/domain/chapter-record-service';
import { getRecordKindLabel } from '@/components/chapter-record-card';
import {
  WdsBadge,
  WdsEmptyState,
  WdsField,
  WdsLinkButton,
  WdsSelect,
  WdsTextLinkButton,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsDashboardLayout,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import {
  demoRoleOptions,
  useAuthSession,
} from '@/features/auth/auth-session-provider';
import { formatKoreanDate } from '@/lib/format-korean-date-time';
import { createBrowserChapterRecordStore } from './browser-chapter-record-store';

const demoRoleSelectOptions = demoRoleOptions.map((role) => ({
  label: role,
  value: role,
})) satisfies WdsSelectOption<UserRole>[];

export function RecordDetail({ recordId }: { recordId: string }) {
  const store = useMemo(() => createBrowserChapterRecordStore(), []);
  const {
    isFirebaseConfigured,
    role,
    setDemoRole,
    status,
  } = useAuthSession();
  const [record, setRecord] = useState<ChapterRecord | null>(null);
  const [message, setMessage] = useState('기록을 불러오는 중입니다.');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void refreshDetail(role);
  }, [recordId, role]);

  async function refreshDetail(currentRole: UserRole = role) {
    const nextRecord = await getVisibleChapterRecordById(
      store,
      recordId,
      currentRole,
    );

    setRecord(nextRecord);
    setIsLoaded(true);
    setMessage(
      nextRecord
        ? '챕터 기록을 확인할 수 있습니다.'
        : '현재 역할로 열람할 수 없거나 게시되지 않은 기록입니다.',
    );
  }

  async function changeDemoRole(nextRole: UserRole) {
    if (isFirebaseConfigured) {
      return;
    }

    setDemoRole(nextRole);
    await refreshDetail(nextRole);
  }

  return (
    <main className="page">
      <div className="container">
        <WdsActionRow reserveBottom>
          <WdsLinkButton href="/member" size="small" tone="secondary">
            Member Home
          </WdsLinkButton>
          <WdsTextLinkButton href="/admin/records">
            Record Admin
          </WdsTextLinkButton>
        </WdsActionRow>

        <section className="section section-compact">
          <div className="access-panel">
            <div>
              <WdsBadgeGroup>
                <WdsBadge tone="blue">Record Detail</WdsBadge>
                <WdsBadge>{status}</WdsBadge>
              </WdsBadgeGroup>
              <h2>{record ? record.title : '챕터 기록 상세'}</h2>
              <p>{message}</p>
            </div>
            <WdsField className="demo-role-field" label="현재 역할">
              <WdsSelect
                disabled={isFirebaseConfigured}
                onValueChange={(nextRole) => void changeDemoRole(nextRole)}
                options={demoRoleSelectOptions}
                value={role}
              />
            </WdsField>
          </div>
        </section>

        {!isLoaded ? (
          <WdsEmptyState>기록을 불러오는 중입니다.</WdsEmptyState>
        ) : record ? (
          <WdsDashboardLayout as="article" sidebarWidth="320px">
            <WdsSurfaceCard
              className="activity-detail-main"
              sx={{
                padding: '24px',
                '@media (max-width: 560px)': {
                  padding: '18px',
                },
              }}
            >
              <WdsBadgeGroup>
                <WdsBadge tone="blue">
                  {getRecordKindLabel(record.kind)}
                </WdsBadge>
                <WdsBadge>{record.visibility}</WdsBadge>
                {record.showcaseCandidate ? (
                  <WdsBadge tone="green">Showcase Candidate</WdsBadge>
                ) : null}
              </WdsBadgeGroup>

              <h1>{record.title}</h1>
              <p>{record.summary}</p>
              <div className="record-body">{record.body}</div>
            </WdsSurfaceCard>

            <WdsSurfaceCard
              as="aside"
              className="activity-detail-side"
              sx={{
                padding: '24px',
                '@media (max-width: 560px)': {
                  padding: '18px',
                },
              }}
            >
              <h2>기록 정보</h2>
              <dl className="activity-meta-list">
                <div>
                  <dt>작성자</dt>
                  <dd>{record.authorUserId}</dd>
                </div>
                <div>
                  <dt>게시일</dt>
                  <dd>
                    {record.publishedAt
                      ? formatKoreanDate(record.publishedAt)
                      : '게시일 없음'}
                  </dd>
                </div>
                <div>
                  <dt>태그</dt>
                  <dd>{record.tags.length > 0 ? record.tags.join(', ') : '없음'}</dd>
                </div>
                {record.relatedActivityId ? (
                  <div>
                    <dt>연결 활동</dt>
                    <dd>{record.relatedActivityId}</dd>
                  </div>
                ) : null}
              </dl>
            </WdsSurfaceCard>
          </WdsDashboardLayout>
        ) : (
          <WdsEmptyState>
            현재 역할로 열람할 수 없는 기록입니다. 멤버 전용 기록은 승인된 멤버에게만
            표시됩니다.
          </WdsEmptyState>
        )}
      </div>
    </main>
  );
}
