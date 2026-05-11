'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  applyActivityDraftSuggestion,
  type ActivityDraftSuggestion,
  type OperatorActivityDraft,
} from '@/domain/ai-draft';
import type {
  Activity,
  ActivityStatus,
  ActivityType,
  ActivityVisibility,
} from '@/domain/activity';
import { createActivity, listHomeActivities } from '@/domain/activity-service';
import { listVisibleActivities } from '@/domain/activity';
import { ActivityCard } from '@/components/activity-card';
import { createBrowserActivityStore } from './browser-activity-store';
import { seedActivities } from './seed-activities';

type AiResponse = {
  provider: 'gemini' | 'local-fallback';
  suggestion: ActivityDraftSuggestion;
  warning?: string;
};

const initialDraft = {
  title: 'Build with AI Prototype Sprint',
  body: 'Firebase Auth, Firestore Activity CRUD, Gemini 작성 보조를 연결해서 실제 작동하는 챕터 홈페이지 데모를 만든다.',
  type: 'event' as ActivityType,
  visibility: 'member' as ActivityVisibility,
  status: 'published' as ActivityStatus,
  startsAt: '2026-05-16T04:00',
};

export function ActivityAdmin() {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const [draft, setDraft] = useState(initialDraft);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, 'team_member'),
  );
  const [suggestion, setSuggestion] = useState<ActivityDraftSuggestion | null>(null);
  const [message, setMessage] = useState('Firebase 설정이 없으면 브라우저 localStorage로 데모가 동작합니다.');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    void refreshActivities();
  }, []);

  async function refreshActivities() {
    setActivities(await listHomeActivities(store, 'team_member'));
  }

  async function requestSuggestion() {
    setIsSuggesting(true);
    setMessage('AI가 활동 문구를 정리하는 중입니다.');

    const response = await fetch('/api/ai/activity-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title,
        body: draft.body,
        type: draft.type,
        visibility: draft.visibility,
      } satisfies OperatorActivityDraft),
    });
    const payload = (await response.json()) as AiResponse;

    setSuggestion(payload.suggestion);
    setMessage(
      payload.provider === 'gemini'
        ? 'Gemini 제안을 불러왔습니다.'
        : 'Gemini 키가 없어 로컬 fallback 제안을 사용했습니다.',
    );
    setIsSuggesting(false);
  }

  function applySuggestion() {
    if (!suggestion) {
      return;
    }

    const updated = applyActivityDraftSuggestion(
      {
        title: draft.title,
        body: draft.body,
        type: draft.type,
        visibility: draft.visibility,
        cardSummary: draft.body,
        memberCopy: draft.body,
        publicCopy: draft.body,
      },
      suggestion,
      {
        cardSummary: true,
        memberCopy: true,
        publicCopy: true,
        suggestedTags: true,
      },
    );

    setDraft((current) => ({
      ...current,
      body: updated.memberCopy ?? current.body,
    }));
    setMessage('AI 제안을 본문에 적용했습니다. 저장 전 직접 수정할 수 있습니다.');
  }

  async function saveActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createActivity(store, {
      actorRole: 'team_member',
      title: draft.title,
      summary: draft.body,
      type: draft.type,
      visibility: draft.visibility,
      status: draft.status,
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : undefined,
      now: new Date().toISOString(),
    });
    setMessage('Activity가 저장되었습니다. Member Home에서 바로 확인할 수 있습니다.');
    setSuggestion(null);
    await refreshActivities();
  }

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Activity Admin</h1>
        <p className="page-lead">
          운영진이 활동 초안을 쓰고, Gemini 보조를 확인한 뒤 Firebase 또는 demo bridge에 저장합니다.
        </p>

        <div className="dashboard-grid" style={{ marginTop: 28 }}>
          <section className="card">
            <form className="form" onSubmit={saveActivity}>
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

              <div className="grid grid-2">
                <label className="field">
                  <span>유형</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        type: event.target.value as ActivityType,
                      }))
                    }
                    value={draft.type}
                  >
                    <option value="event">Event</option>
                    <option value="study">Study</option>
                    <option value="project">Project</option>
                    <option value="challenge">Challenge</option>
                    <option value="social">Social</option>
                  </select>
                </label>

                <label className="field">
                  <span>공개 범위</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        visibility: event.target.value as ActivityVisibility,
                      }))
                    }
                    value={draft.visibility}
                  >
                    <option value="public">Public</option>
                    <option value="member">Member</option>
                    <option value="operator">Operator</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>일정</span>
                <input
                  className="input"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, startsAt: event.target.value }))
                  }
                  type="datetime-local"
                  value={draft.startsAt}
                />
              </label>

              <label className="field">
                <span>운영진 메모 / 본문</span>
                <textarea
                  className="textarea"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  value={draft.body}
                />
              </label>

              <div className="toolbar">
                <button
                  className="button button-secondary"
                  disabled={isSuggesting}
                  onClick={requestSuggestion}
                  type="button"
                >
                  {isSuggesting ? 'AI 작성 중' : 'AI로 문구 정리'}
                </button>
                <button className="button button-primary" type="submit">
                  Activity 저장
                </button>
              </div>
              <p className="helper-text">{message}</p>
            </form>
          </section>

          <aside className="stack">
            <section className="card">
              <div className="badge-row">
                <span className="badge badge-blue">AI Draft</span>
              </div>
              {suggestion ? (
                <div className="stack" style={{ marginTop: 14 }}>
                  <p className="helper-text">카드 요약</p>
                  <p>{suggestion.cardSummary}</p>
                  <p className="helper-text">멤버용 문구</p>
                  <p>{suggestion.memberCopy}</p>
                  <p className="helper-text">공개용 문구</p>
                  <p>{suggestion.publicCopy}</p>
                  <div className="badge-row">
                    {suggestion.suggestedTags.map((tag) => (
                      <span className="badge" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {suggestion.missingInfo.length > 0 ? (
                    <p className="helper-text">
                      보완 필요: {suggestion.missingInfo.join(', ')}
                    </p>
                  ) : null}
                  <button className="button button-ghost" onClick={applySuggestion} type="button">
                    제안 적용
                  </button>
                </div>
              ) : (
                <p className="helper-text" style={{ marginTop: 14 }}>
                  초안을 입력한 뒤 AI 보조를 실행하면 요약과 문구 제안이 여기에 표시됩니다.
                </p>
              )}
            </section>

            <section className="stack">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div>
                  <h2>Saved</h2>
                  <p>운영진 관점에서 볼 수 있는 activity입니다.</p>
                </div>
              </div>
              {activities.map((activity) => (
                <ActivityCard activity={activity} key={activity.id} />
              ))}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
