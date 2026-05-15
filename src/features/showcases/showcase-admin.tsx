'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';

import type { ActivityStatus, ActivityVisibility } from '@/domain/activity';
import type { Showcase, ShowcaseKind } from '@/domain/showcase';
import { createShowcase, listHomeShowcases } from '@/domain/showcase-service';
import { ShowcaseCard } from '@/components/showcase-card';
import {
  WdsButton,
  WdsField,
  WdsInput,
  WdsSelect,
  WdsTextArea,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsDashboardLayout,
  WdsPageHeader,
  WdsResponsiveGrid,
  WdsSectionHeader,
  WdsStack,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { useAuthSession } from '@/features/auth/auth-session-provider';
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

const showcaseKindOptions = [
  { value: 'achievement', label: '성과' },
  { value: 'retrospective', label: '회고' },
  { value: 'project_result', label: '프로젝트 결과' },
  { value: 'gallery', label: '갤러리' },
] satisfies readonly WdsSelectOption<ShowcaseKind>[];

const showcaseVisibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'member', label: 'Member' },
  { value: 'operator', label: 'Operator' },
] satisfies readonly WdsSelectOption<ActivityVisibility>[];

const showcaseStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] satisfies readonly WdsSelectOption<ActivityStatus>[];

export function ShowcaseAdmin() {
  const { role } = useAuthSession();
  const store = useMemo(() => createBrowserShowcaseStore(), []);
  const [draft, setDraft] = useState<ShowcaseDraft>(initialDraft);
  const [showcases, setShowcases] = useState<Showcase[]>(seedShowcases);
  const [message, setMessage] = useState(
    'Firebase 설정이 없으면 브라우저 localStorage bridge로 쇼케이스가 저장됩니다.',
  );

  useEffect(() => {
    void refreshShowcases();
  }, [role]);

  async function refreshShowcases() {
    setShowcases(await listHomeShowcases(store, role));
  }

  async function saveShowcase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const showcase = await createShowcase(store, {
      actorRole: role,
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
        <WdsPageHeader
          description="활동 성과, 회고, 프로젝트 결과, 갤러리를 Activity와 분리된 아카이브로 등록합니다."
          eyebrow="Operator Dashboard"
          title="Showcase Admin"
        />

        <WdsDashboardLayout offset="lg">
          <WdsSurfaceCard as="section">
            <form className="form" onSubmit={saveShowcase}>
              <WdsResponsiveGrid columns={2}>
                <WdsField label="종류">
                  <WdsSelect
                    onValueChange={(kind) =>
                      setDraft((current) => ({
                        ...current,
                        kind,
                      }))
                    }
                    options={showcaseKindOptions}
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
                    options={showcaseVisibilityOptions}
                    value={draft.visibility}
                  />
                </WdsField>
              </WdsResponsiveGrid>

              <WdsResponsiveGrid columns={2}>
                <WdsField label="상태">
                  <WdsSelect
                    onValueChange={(status) =>
                      setDraft((current) => ({
                        ...current,
                        status,
                      }))
                    }
                    options={showcaseStatusOptions}
                    value={draft.status}
                  />
                </WdsField>

                <WdsField label="Published At">
                  <WdsInput
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        publishedAt: event.target.value,
                      }))
                    }
                    placeholder="비워두면 저장 시각 사용"
                    value={draft.publishedAt}
                  />
                </WdsField>
              </WdsResponsiveGrid>

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
                  value={draft.body}
                />
              </WdsField>

              <WdsField label="이미지 URL">
                <WdsInput
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="/showcases/build-with-ai-gallery.svg"
                  value={draft.imageUrl}
                />
              </WdsField>

              <WdsField label="링크 URL">
                <WdsInput
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, href: event.target.value }))
                  }
                  placeholder="https:// 또는 /local-path만 노출"
                  value={draft.href}
                />
              </WdsField>

              <WdsResponsiveGrid columns={2}>
                <WdsField label="태그">
                  <WdsInput
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                    placeholder="Gemini, Firebase"
                    value={draft.tags}
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
                    placeholder="예: seed-bwai"
                    value={draft.relatedActivityId}
                  />
                </WdsField>
              </WdsResponsiveGrid>

              <WdsActionRow>
                <WdsButton tone="primary" type="submit">
                  쇼케이스 저장
                </WdsButton>
              </WdsActionRow>
              <p className="helper-text">{message}</p>
            </form>
          </WdsSurfaceCard>

          <WdsStack as="aside">
            <WdsSectionHeader
              description="운영진 관점에서 볼 수 있는 최신 쇼케이스입니다."
              flush
              title="Saved Showcases"
            />
            {showcases.map((showcase) => (
              <ShowcaseCard key={showcase.id} showcase={showcase} />
            ))}
          </WdsStack>
        </WdsDashboardLayout>
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
