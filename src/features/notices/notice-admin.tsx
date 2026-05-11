'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { Notice, NoticeStatus, NoticeVisibility } from '@/domain/notice';
import { createNotice, listHomeNotices } from '@/domain/notice-service';
import { NoticeBoard } from '@/components/notice-board';
import { createBrowserNoticeStore } from './browser-notice-store';
import { seedNotices } from './seed-notices';

const initialDraft = {
  title: 'Build with AI 발표 전 확인사항',
  body: '토요일 발표 전까지 Firebase 로그인, Activity 등록, 참여 신청, 승인 흐름을 한 번씩 확인해주세요.',
  visibility: 'member' as NoticeVisibility,
  status: 'published' as NoticeStatus,
  pinned: true,
};

export function NoticeAdmin() {
  const store = useMemo(() => createBrowserNoticeStore(), []);
  const [draft, setDraft] = useState(initialDraft);
  const [notices, setNotices] = useState<Notice[]>(seedNotices);
  const [message, setMessage] = useState('Firebase 설정 전에는 localStorage에 공지가 저장됩니다.');

  useEffect(() => {
    void refreshNotices();
  }, []);

  async function refreshNotices() {
    setNotices(await listHomeNotices(store, 'team_member'));
  }

  async function saveNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createNotice(store, {
      actorRole: 'team_member',
      body: draft.body,
      now: new Date().toISOString(),
      pinned: draft.pinned,
      status: draft.status,
      title: draft.title,
      visibility: draft.visibility,
    });
    setMessage('공지사항이 저장되었습니다. Member Home 상단에서 확인할 수 있습니다.');
    await refreshNotices();
  }

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Notice Admin</h1>
        <p className="page-lead">
          운영진이 공지사항을 등록하고 pinned 상태로 멤버 홈 상단에 노출합니다.
        </p>

        <div className="dashboard-grid" style={{ marginTop: 28 }}>
          <section className="card">
            <form className="form" onSubmit={saveNotice}>
              <label className="field">
                <span>제목</span>
                <input
                  className="input"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  value={draft.title}
                />
              </label>

              <label className="field">
                <span>본문</span>
                <textarea
                  className="textarea"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  value={draft.body}
                />
              </label>

              <div className="grid grid-2">
                <label className="field">
                  <span>공개 범위</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        visibility: event.target.value as NoticeVisibility,
                      }))
                    }
                    value={draft.visibility}
                  >
                    <option value="public">Public</option>
                    <option value="member">Member</option>
                    <option value="operator">Operator</option>
                  </select>
                </label>

                <label className="field">
                  <span>상태</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as NoticeStatus,
                      }))
                    }
                    value={draft.status}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
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
                <button className="button button-primary" type="submit">
                  공지 저장
                </button>
              </div>
              <p className="helper-text">{message}</p>
            </form>
          </section>

          <aside className="stack">
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <h2>Saved Notices</h2>
                <p>멤버 홈에 노출되는 순서대로 표시됩니다.</p>
              </div>
            </div>
            <NoticeBoard notices={notices} />
          </aside>
        </div>
      </div>
    </main>
  );
}
