'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';

import type { Notice, NoticeStatus, NoticeVisibility } from '@/domain/notice';
import {
  archiveNotice,
  createNotice,
  listHomeNotices,
  updateNotice,
} from '@/domain/notice-service';
import { NoticeBoard } from '@/components/notice-board';
import {
  WdsButton,
  WdsField,
  WdsInput,
  WdsSelect,
  WdsTextArea,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { createBrowserNoticeStore } from './browser-notice-store';
import { seedNotices } from './seed-notices';

type NoticeDraftFormState = {
  body: string;
  pinned: boolean;
  status: NoticeStatus;
  title: string;
  visibility: NoticeVisibility;
};

const initialDraft: NoticeDraftFormState = {
  title: 'Build with AI 발표 전 확인사항',
  body: '토요일 발표 전까지 Firebase 로그인, Activity 등록, 참여 신청, 승인 흐름을 한 번씩 점검해 주세요.',
  visibility: 'member',
  status: 'published',
  pinned: true,
};

const noticeVisibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'member', label: 'Member' },
  { value: 'operator', label: 'Operator' },
] satisfies readonly WdsSelectOption<NoticeVisibility>[];

const noticeStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] satisfies readonly WdsSelectOption<NoticeStatus>[];

export function NoticeAdmin() {
  const { role } = useAuthSession();
  const store = useMemo(() => createBrowserNoticeStore(), []);
  const [draft, setDraft] = useState<NoticeDraftFormState>(initialDraft);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>(seedNotices);
  const [message, setMessage] = useState(
    'Firebase 설정 전에는 localStorage에 공지가 저장됩니다.',
  );

  useEffect(() => {
    void refreshNotices();
  }, [role]);

  async function refreshNotices() {
    setNotices(await listHomeNotices(store, role));
  }

  async function saveNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const noticeFields = {
      actorRole: role,
      body: draft.body.trim(),
      now,
      pinned: draft.pinned,
      status: draft.status,
      title: draft.title.trim(),
      visibility: draft.visibility,
    };

    if (editingNoticeId) {
      await updateNotice(store, {
        ...noticeFields,
        noticeId: editingNoticeId,
      });
    } else {
      await createNotice(store, noticeFields);
    }

    setMessage(
      editingNoticeId
        ? '공지사항이 수정되었습니다. Member Home 상단에서 바로 확인할 수 있습니다.'
        : '공지사항이 저장되었습니다. Member Home 상단에서 확인할 수 있습니다.',
    );
    setDraft(initialDraft);
    setEditingNoticeId(null);
    await refreshNotices();
  }

  function startEditing(notice: Notice) {
    setEditingNoticeId(notice.id);
    setDraft({
      body: notice.body,
      pinned: notice.pinned,
      status: notice.status,
      title: notice.title,
      visibility: notice.visibility,
    });
    setMessage(`${notice.title} 수정 모드입니다. 내용을 고친 뒤 저장하세요.`);
  }

  function cancelEditing() {
    setEditingNoticeId(null);
    setDraft(initialDraft);
    setMessage('새 공지 작성 모드입니다.');
  }

  async function archiveSavedNotice(notice: Notice) {
    const confirmed = window.confirm(
      `${notice.title} 공지를 아카이브하시겠습니까? 아카이브된 공지는 Member Home에서 숨겨집니다.`,
    );

    if (!confirmed) {
      return;
    }

    await archiveNotice(store, {
      actorRole: role,
      noticeId: notice.id,
      now: new Date().toISOString(),
    });

    if (editingNoticeId === notice.id) {
      setEditingNoticeId(null);
      setDraft(initialDraft);
    }

    setMessage(`${notice.title} 공지가 아카이브되었습니다.`);
    await refreshNotices();
  }

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Notice Admin</h1>
        <p className="page-lead">
          운영진이 공지사항을 등록하고, pinned 상태와 공개 범위를 관리해 멤버 홈 상단에
          노출합니다.
        </p>

        <div className="dashboard-grid" style={{ marginTop: 28 }}>
          <section className="card">
            <form className="form" onSubmit={saveNotice}>
              <div className="badge-row">
                <span className="badge badge-blue">
                  {editingNoticeId ? '공지 수정' : '공지 생성'}
                </span>
                {editingNoticeId ? (
                  <span className="badge">{editingNoticeId}</span>
                ) : null}
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

              <WdsField label="본문">
                <WdsTextArea
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  required
                  value={draft.body}
                />
              </WdsField>

              <div className="grid grid-2">
                <WdsField label="공개 범위">
                  <WdsSelect
                    onValueChange={(visibility) =>
                      setDraft((current) => ({
                        ...current,
                        visibility,
                      }))
                    }
                    options={noticeVisibilityOptions}
                    value={draft.visibility}
                  />
                </WdsField>

                <WdsField label="상태">
                  <WdsSelect
                    onValueChange={(status) =>
                      setDraft((current) => ({
                        ...current,
                        status,
                      }))
                    }
                    options={noticeStatusOptions}
                    value={draft.status}
                  />
                </WdsField>
              </div>

              <label className="checkbox-field">
                <input
                  checked={draft.pinned}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, pinned: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span>상단 고정</span>
              </label>

              <div className="toolbar">
                <WdsButton tone="primary" type="submit">
                  {editingNoticeId ? '공지 수정' : '공지 저장'}
                </WdsButton>
                {editingNoticeId ? (
                  <WdsButton
                    onClick={cancelEditing}
                    tone="secondary"
                    type="button"
                  >
                    수정 취소
                  </WdsButton>
                ) : null}
              </div>
              <p className="helper-text">{message}</p>
            </form>
          </section>

          <aside className="stack">
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <h2>Saved Notices</h2>
                <p>멤버 홈에 노출되는 순서대로 표시합니다.</p>
              </div>
            </div>
            <NoticeBoard
              notices={notices}
              renderActions={(notice) => (
                <div className="toolbar">
                  <WdsButton
                    disabled={editingNoticeId === notice.id}
                    onClick={() => startEditing(notice)}
                    size="small"
                    tone="secondary"
                    type="button"
                  >
                    {editingNoticeId === notice.id ? '수정 중' : '수정'}
                  </WdsButton>
                  <WdsButton
                    onClick={() => void archiveSavedNotice(notice)}
                    size="small"
                    tone="ghost"
                    type="button"
                  >
                    아카이브
                  </WdsButton>
                </div>
              )}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
