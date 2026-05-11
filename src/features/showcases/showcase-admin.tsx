'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';

import type { ActivityStatus, ActivityVisibility } from '@/domain/activity';
import type { Showcase, ShowcaseKind } from '@/domain/showcase';
import { createShowcase, listHomeShowcases } from '@/domain/showcase-service';
import { ShowcaseCard } from '@/components/showcase-card';
import { createBrowserShowcaseStore } from './browser-showcase-store';
import { seedShowcases } from './seed-showcases';

type ShowcaseDraft = {
  body: string;
  href: string;
  imageUrl: string;
  kind: ShowcaseKind;
  publishedAt: string;
  relatedActivityId: string;
  status: ActivityStatus;
  summary: string;
  tags: string;
  title: string;
  visibility: ActivityVisibility;
};

const initialDraft: ShowcaseDraft = {
  body:
    'Build with AI에서 만든 초기 프로토타입과 운영진이 다음 스프린트로 가져갈 학습 기록입니다.',
  href: '',
  imageUrl: '/showcases/build-with-ai-gallery.svg',
  kind: 'gallery',
  publishedAt: '',
  relatedActivityId: 'seed-bwai',
  status: 'published',
  summary: 'Build with AI 활동에서 나온 프로토타입과 기록을 모은 쇼케이스입니다.',
  tags: 'Build with AI, Gemini, Firebase',
  title: 'Build with AI Prototype Gallery',
  visibility: 'public',
};

export function ShowcaseAdmin() {
  const store = useMemo(() => createBrowserShowcaseStore(), []);
  const [draft, setDraft] = useState<ShowcaseDraft>(initialDraft);
  const [showcases, setShowcases] = useState<Showcase[]>(seedShowcases);
  const [message, setMessage] = useState(
    'Firebase 설정이 없으면 브라우저 localStorage bridge로 쇼케이스가 저장됩니다.',
  );

  useEffect(() => {
    void refreshShowcases();
  }, []);

  async function refreshShowcases() {
    setShowcases(await listHomeShowcases(store, 'team_member'));
  }

  async function saveShowcase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const showcase = await createShowcase(store, {
      actorRole: 'team_member',
      body: draft.body.trim() || undefined,
      href: draft.href.trim() || undefined,
      imageUrl: draft.imageUrl.trim() || undefined,
      kind: draft.kind,
      now,
      publishedAt:
        draft.publishedAt.trim() ||
        (draft.status === 'published' ? now : undefined),
      relatedActivityId: draft.relatedActivityId.trim() || undefined,
      status: draft.status,
      summary: draft.summary.trim(),
      tags: parseTags(draft.tags),
      title: draft.title.trim(),
      visibility: draft.visibility,
    });

    setMessage(
      `${showcase.title} 쇼케이스를 저장했습니다. 공개 범위에 따라 Public 또는 Member Home에서 확인할 수 있습니다.`,
    );
    await refreshShowcases();
  }

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Showcase Admin</h1>
        <p className="page-lead">
          활동 성과, 회고, 프로젝트 결과, 갤러리를 Activity와 분리된 아카이브로
          등록합니다.
        </p>

        <div className="dashboard-grid" style={{ marginTop: 28 }}>
          <section className="card">
            <form className="form" onSubmit={saveShowcase}>
              <div className="grid grid-2">
                <label className="field">
                  <span>종류</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        kind: event.target.value as ShowcaseKind,
                      }))
                    }
                    value={draft.kind}
                  >
                    <option value="achievement">성과</option>
                    <option value="retrospective">회고</option>
                    <option value="project_result">프로젝트 결과</option>
                    <option value="gallery">갤러리</option>
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

              <div className="grid grid-2">
                <label className="field">
                  <span>상태</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as ActivityStatus,
                      }))
                    }
                    value={draft.status}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>

                <label className="field">
                  <span>Published At</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        publishedAt: event.target.value,
                      }))
                    }
                    placeholder="비워두면 저장 시각 사용"
                    value={draft.publishedAt}
                  />
                </label>
              </div>

              <label className="field">
                <span>제목</span>
                <input
                  className="input"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                  value={draft.title}
                />
              </label>

              <label className="field">
                <span>요약</span>
                <textarea
                  className="textarea"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                  required
                  value={draft.summary}
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

              <label className="field">
                <span>이미지 URL</span>
                <input
                  className="input"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="/showcases/build-with-ai-gallery.svg"
                  value={draft.imageUrl}
                />
              </label>

              <label className="field">
                <span>링크 URL</span>
                <input
                  className="input"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, href: event.target.value }))
                  }
                  placeholder="https:// 또는 /local-path만 노출"
                  value={draft.href}
                />
              </label>

              <div className="grid grid-2">
                <label className="field">
                  <span>태그</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                    placeholder="Gemini, Firebase"
                    value={draft.tags}
                  />
                </label>

                <label className="field">
                  <span>Related Activity ID</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        relatedActivityId: event.target.value,
                      }))
                    }
                    placeholder="예: seed-bwai"
                    value={draft.relatedActivityId}
                  />
                </label>
              </div>

              <div className="toolbar">
                <button className="button button-primary" type="submit">
                  쇼케이스 저장
                </button>
              </div>
              <p className="helper-text">{message}</p>
            </form>
          </section>

          <aside className="stack">
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <h2>Saved Showcases</h2>
                <p>운영진 관점에서 볼 수 있는 최신 쇼케이스입니다.</p>
              </div>
            </div>
            {showcases.map((showcase) => (
              <ShowcaseCard key={showcase.id} showcase={showcase} />
            ))}
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
