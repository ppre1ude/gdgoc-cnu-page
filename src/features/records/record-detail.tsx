'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { UserRole } from '@/domain/activity';
import type { ChapterRecord } from '@/domain/chapter-record';
import { getVisibleChapterRecordById } from '@/domain/chapter-record-service';
import { getRecordKindLabel } from '@/components/chapter-record-card';
import {
  demoRoleOptions,
  useAuthSession,
} from '@/features/auth/auth-session-provider';
import { formatKoreanDate } from '@/lib/format-korean-date-time';
import { createBrowserChapterRecordStore } from './browser-chapter-record-store';

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
        <div className="toolbar" style={{ marginBottom: 20 }}>
          <Link className="button button-secondary button-small" href="/member">
            Member Home
          </Link>
          <Link className="button button-ghost button-small" href="/admin/records">
            Record Admin
          </Link>
        </div>

        <section className="section section-compact">
          <div className="access-panel">
            <div>
              <div className="badge-row">
                <span className="badge badge-blue">Record Detail</span>
                <span className="badge">{status}</span>
              </div>
              <h2>{record ? record.title : '챕터 기록 상세'}</h2>
              <p>{message}</p>
            </div>
            <label className="field demo-role-field">
              <span>현재 역할</span>
              <select
                className="select"
                disabled={isFirebaseConfigured}
                onChange={(event) => void changeDemoRole(event.target.value as UserRole)}
                value={role}
              >
                {demoRoleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {!isLoaded ? (
          <div className="empty">기록을 불러오는 중입니다.</div>
        ) : record ? (
          <article className="activity-detail">
            <div className="activity-detail-main">
              <div className="badge-row">
                <span className="badge badge-blue">
                  {getRecordKindLabel(record.kind)}
                </span>
                <span className="badge">{record.visibility}</span>
                {record.showcaseCandidate ? (
                  <span className="badge badge-green">Showcase Candidate</span>
                ) : null}
              </div>

              <h1>{record.title}</h1>
              <p>{record.summary}</p>
              <div className="record-body">{record.body}</div>
            </div>

            <aside className="activity-detail-side">
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
            </aside>
          </article>
        ) : (
          <div className="empty">
            현재 역할로 열람할 수 없는 기록입니다. 멤버 전용 기록은 승인된 멤버에게만
            표시됩니다.
          </div>
        )}
      </div>
    </main>
  );
}

