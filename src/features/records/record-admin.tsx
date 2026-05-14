'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';

import type { ActivityVisibility } from '@/domain/activity';
import type {
  ChapterRecord,
  ChapterRecordKind,
  ChapterRecordStatus,
} from '@/domain/chapter-record';
import {
  listHomeChapterRecords,
  listPendingChapterRecords,
  publishChapterRecord,
  submitChapterRecord,
} from '@/domain/chapter-record-service';
import { ChapterRecordCard } from '@/components/chapter-record-card';
import {
  WdsButton,
  WdsField,
  WdsInput,
  WdsSelect,
  WdsTextArea,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { createBrowserChapterRecordStore } from './browser-chapter-record-store';
import { seedChapterRecords } from './seed-chapter-records';

type RecordDraft = {
  body: string;
  kind: ChapterRecordKind;
  relatedActivityId: string;
  status: Extract<ChapterRecordStatus, 'draft' | 'pending_review'>;
  summary: string;
  tags: string;
  title: string;
  visibility: ActivityVisibility;
};

const initialDraft: RecordDraft = {
  body:
    'Build with AI 준비 과정에서 얻은 운영/개발 관찰을 긴 글로 정리합니다. 기록은 검토 후 멤버 홈에 게시되고, 좋은 글은 쇼케이스 후보로 분류할 수 있습니다.',
  kind: 'retrospective',
  relatedActivityId: 'seed-bwai',
  status: 'pending_review',
  summary: 'Build with AI 준비 과정에서 얻은 운영/개발 관찰을 정리한 기록입니다.',
  tags: 'Build with AI, Firebase, Gemini',
  title: 'Build with AI 운영 기록',
  visibility: 'member',
};

const recordKindOptions = [
  { value: 'retrospective', label: 'Retrospective' },
  { value: 'review', label: 'Review' },
  { value: 'technical_note', label: 'Technical Note' },
] satisfies readonly WdsSelectOption<ChapterRecordKind>[];

const recordVisibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'member', label: 'Member' },
  { value: 'operator', label: 'Operator' },
] satisfies readonly WdsSelectOption<ActivityVisibility>[];

const recordStatusOptions = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'draft', label: 'Draft' },
] satisfies readonly WdsSelectOption<RecordDraft['status']>[];

export function RecordAdmin() {
  const { role, userId } = useAuthSession();
  const store = useMemo(() => createBrowserChapterRecordStore(), []);
  const [draft, setDraft] = useState<RecordDraft>(initialDraft);
  const [pendingRecords, setPendingRecords] = useState<ChapterRecord[]>([]);
  const [publishedRecords, setPublishedRecords] =
    useState<ChapterRecord[]>(seedChapterRecords);
  const [message, setMessage] = useState(
    '멤버가 제출한 긴 글을 검토하고, 게시된 기록을 멤버 홈에 노출합니다.',
  );

  useEffect(() => {
    void refreshRecords();
  }, [role]);

  async function refreshRecords() {
    const [nextPendingRecords, nextPublishedRecords] = await Promise.all([
      listPendingChapterRecords(store, role),
      listHomeChapterRecords(store, role),
    ]);

    setPendingRecords(nextPendingRecords);
    setPublishedRecords(nextPublishedRecords);
  }

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const record = await submitChapterRecord(store, {
      actorRole: role,
      actorUserId: userId,
      body: draft.body.trim(),
      kind: draft.kind,
      now: new Date().toISOString(),
      relatedActivityId: draft.relatedActivityId.trim() || undefined,
      status: draft.status,
      summary: draft.summary.trim(),
      tags: parseTags(draft.tags),
      title: draft.title.trim(),
      visibility: draft.visibility,
    });

    setMessage(`${record.title} 기록을 ${record.status} 상태로 저장했습니다.`);
    await refreshRecords();
  }

  async function publishRecord(record: ChapterRecord, showcaseCandidate: boolean) {
    const published = await publishChapterRecord(store, {
      actorRole: role,
      actorUserId: userId,
      now: new Date().toISOString(),
      recordId: record.id,
      showcaseCandidate,
      visibility: record.visibility,
    });

    setMessage(`${published.title} 기록을 게시했습니다.`);
    await refreshRecords();
  }

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Record Admin</h1>
        <p className="page-lead">
          회고, 리뷰, 기술 노트처럼 긴 글로 남겨야 하는 챕터 기록을 검토하고 게시합니다.
        </p>

        <div className="dashboard-grid" style={{ marginTop: 28 }}>
          <section className="card">
            <form className="form" onSubmit={submitRecord}>
              <div className="grid grid-2">
                <WdsField label="기록 유형">
                  <WdsSelect
                    onValueChange={(kind) =>
                      setDraft((current) => ({
                        ...current,
                        kind,
                      }))
                    }
                    options={recordKindOptions}
                    value={draft.kind}
                  />
                </WdsField>

                <WdsField label="공개 범위">
                  <WdsSelect
                    onValueChange={(visibility) =>
                      setDraft((current) => ({
                        ...current,
                        visibility,
                      }))
                    }
                    options={recordVisibilityOptions}
                    value={draft.visibility}
                  />
                </WdsField>
              </div>

              <div className="grid grid-2">
                <WdsField label="저장 상태">
                  <WdsSelect
                    onValueChange={(status) =>
                      setDraft((current) => ({
                        ...current,
                        status,
                      }))
                    }
                    options={recordStatusOptions}
                    value={draft.status}
                  />
                </WdsField>

                <WdsField label="Related Activity ID">
                  <WdsInput
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        relatedActivityId: event.target.value,
                      }))
                    }
                    value={draft.relatedActivityId}
                  />
                </WdsField>
              </div>

              <WdsField label="제목">
                <WdsInput
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                  value={draft.title}
                />
              </WdsField>

              <WdsField label="요약">
                <WdsTextArea
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                  required
                  value={draft.summary}
                />
              </WdsField>

              <WdsField label="본문">
                <WdsTextArea
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  required
                  value={draft.body}
                />
              </WdsField>

              <WdsField label="태그">
                <WdsInput
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, tags: event.target.value }))
                  }
                  value={draft.tags}
                />
              </WdsField>

              <div className="toolbar">
                <WdsButton tone="primary" type="submit">
                  기록 저장
                </WdsButton>
              </div>
              <p className="helper-text">{message}</p>
            </form>
          </section>

          <aside className="stack">
            <section className="stack">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div>
                  <h2>Pending Review</h2>
                  <p>멤버가 제출한 기록을 검토하고 게시합니다.</p>
                </div>
              </div>
              {pendingRecords.length > 0 ? (
                <div className="application-queue">
                  {pendingRecords.map((record) => (
                    <div className="application-row" key={record.id}>
                      <div>
                        <strong>{record.title}</strong>
                        <p className="helper-text">{record.summary}</p>
                      </div>
                      <div className="toolbar">
                        <WdsButton
                          onClick={() => publishRecord(record, false)}
                          size="small"
                          tone="secondary"
                          type="button"
                        >
                          게시
                        </WdsButton>
                        <WdsButton
                          onClick={() => publishRecord(record, true)}
                          size="small"
                          tone="primary"
                          type="button"
                        >
                          쇼케이스 후보
                        </WdsButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="application-queue application-queue-empty">
                  검토 대기 중인 기록이 없습니다.
                </div>
              )}
            </section>

            <section className="stack">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div>
                  <h2>Published Records</h2>
                  <p>현재 멤버 홈에 노출되는 최신 기록입니다.</p>
                </div>
              </div>
              {publishedRecords.map((record) => (
                <ChapterRecordCard key={record.id} record={record} />
              ))}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
