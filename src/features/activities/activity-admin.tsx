'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  applyActivityDraftSuggestion,
  type ActivityDraftSuggestion,
  describeActivityDraftAssistantError,
  describeActivityDraftAssistantResult,
  type OperatorActivityDraft,
} from '@/domain/ai-draft';
import type {
  Activity,
  ActivityRegistrationMode,
  ActivityStatus,
  ActivityType,
  ActivityVisibility,
} from '@/domain/activity';
import type { ActivityApplication } from '@/domain/activity-application';
import {
  approveApplicationForActivity,
  listApplicationsForActivity,
} from '@/domain/activity-participation-service';
import {
  type ActivitySession,
  type SessionAttendance,
  loadOrSyncDefaultActivitySession,
  markAttendanceForSession,
  summarizeSessionAttendance,
} from '@/domain/activity-session';
import {
  acceptActivityProposal,
  archiveActivity,
  createActivity,
  listHomeActivities,
  listPendingActivityProposals,
  updateActivity,
} from '@/domain/activity-service';
import { listVisibleActivities } from '@/domain/activity';
import { ActivityCard } from '@/components/activity-card';
import {
  WdsBadge,
  WdsButton,
  WdsEmptyState,
  WdsField,
  WdsInput,
  WdsSelect,
  WdsTextArea,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import {
  WdsSectionHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivitySessionStore } from './browser-activity-session-store';
import { createBrowserActivityStore } from './browser-activity-store';
import { createBrowserSessionAttendanceStore } from './browser-session-attendance-store';
import { seedActivities } from './seed-activities';

type AiResponse = {
  provider: 'gemini' | 'local-fallback';
  suggestion: ActivityDraftSuggestion;
  warning?: string;
};

type ActivityDraftFormState = {
  body: string;
  externalRegistrationUrl: string;
  registrationMode: ActivityRegistrationMode;
  startsAt: string;
  status: ActivityStatus;
  title: string;
  type: ActivityType;
  visibility: ActivityVisibility;
};

const initialDraft: ActivityDraftFormState = {
  title: 'Build with AI Prototype Sprint',
  body:
    'Firebase Auth, Firestore Activity CRUD, Gemini 작성 보조를 연결해서 실제 작동하는 챕터 홈페이지 데모를 만듭니다.',
  type: 'event' as ActivityType,
  visibility: 'member' as ActivityVisibility,
  status: 'published' as ActivityStatus,
  startsAt: '2026-05-16T04:00',
  registrationMode: 'hybrid' as ActivityRegistrationMode,
  externalRegistrationUrl: 'https://gdg.community.dev/',
};

const operatorRoles = new Set(['team_member', 'organizer', 'admin']);

const activityTypeOptions: WdsSelectOption<ActivityType>[] = [
  { label: 'Event', value: 'event' },
  { label: 'Study', value: 'study' },
  { label: 'Project', value: 'project' },
  { label: 'Challenge', value: 'challenge' },
  { label: 'Social', value: 'social' },
];

const activityVisibilityOptions: WdsSelectOption<ActivityVisibility>[] = [
  { label: 'Public', value: 'public' },
  { label: 'Member', value: 'member' },
  { label: 'Operator', value: 'operator' },
];

const registrationModeOptions: WdsSelectOption<ActivityRegistrationMode>[] = [
  { label: '내부 신청', value: 'internal' },
  { label: '외부 등록', value: 'external' },
  { label: '내부 신청 + 외부 등록', value: 'hybrid' },
  { label: '정보 안내만', value: 'none' },
];

export function ActivityAdmin() {
  const { role, userId } = useAuthSession();
  const store = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const sessionStore = useMemo(() => createBrowserActivitySessionStore(), []);
  const attendanceStore = useMemo(() => createBrowserSessionAttendanceStore(), []);
  const [draft, setDraft] = useState(initialDraft);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, role),
  );
  const [pendingProposals, setPendingProposals] = useState<Activity[]>([]);
  const [applicationsByActivity, setApplicationsByActivity] = useState<
    Record<string, ActivityApplication[]>
  >({});
  const [sessionsByActivity, setSessionsByActivity] = useState<
    Record<string, ActivitySession | null>
  >({});
  const [attendancesBySession, setAttendancesBySession] = useState<
    Record<string, SessionAttendance[]>
  >({});
  const [suggestion, setSuggestion] = useState<ActivityDraftSuggestion | null>(null);
  const [message, setMessage] = useState(
    'Firebase 설정이 없으면 브라우저 localStorage bridge로 데모가 동작합니다.',
  );
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    void refreshDashboard();
  }, [role]);

  async function refreshDashboard() {
    const nextActivities = await listHomeActivities(store, role);
    const nextSessionsByActivity = Object.fromEntries(
      await Promise.all(
        nextActivities.map(async (activity) => [
          activity.id,
          await loadDefaultSessionForActivity(activity),
        ]),
      ),
    );
    const nextApplicationsByActivity = Object.fromEntries(
      await Promise.all(
        nextActivities.map(async (activity) => [
          activity.id,
          await listApplicationsForActivity(applicationStore, activity.id),
        ]),
      ),
    );
    const nextAttendancesBySession = Object.fromEntries(
      await Promise.all(
        Object.values(nextSessionsByActivity)
          .filter((session): session is ActivitySession => Boolean(session))
          .map(async (session) => [
            session.id,
            await attendanceStore.listBySession(session.id),
          ]),
      ),
    );

    const nextPendingProposals = operatorRoles.has(role)
      ? await listPendingActivityProposals(store, role)
      : [];

    setActivities(nextActivities);
    setSessionsByActivity(nextSessionsByActivity);
    setPendingProposals(nextPendingProposals);
    setApplicationsByActivity(nextApplicationsByActivity);
    setAttendancesBySession(nextAttendancesBySession);
  }

  async function loadDefaultSessionForActivity(activity: Activity) {
    return loadOrSyncDefaultActivitySession(sessionStore, activity);
  }

  async function requestSuggestion() {
    setIsSuggesting(true);
    setMessage('AI가 활동 문구를 정리하는 중입니다.');

    try {
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

      if (!response.ok) {
        throw new Error(`AI assistant request failed with ${response.status}.`);
      }

      const payload = (await response.json()) as AiResponse;

      setSuggestion(payload.suggestion);
      setMessage(describeActivityDraftAssistantResult(payload));
    } catch (error) {
      setSuggestion(null);
      setMessage(describeActivityDraftAssistantError(error));
    } finally {
      setIsSuggesting(false);
    }
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
    setMessage('AI 제안을 본문에 적용했습니다. 저장 전에 직접 수정할 수 있습니다.');
  }

  async function saveActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const activityFields = {
      actorRole: role,
      title: draft.title,
      summary: draft.body,
      type: draft.type,
      visibility: draft.visibility,
      status: draft.status,
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : undefined,
      registrationMode: draft.registrationMode,
      externalRegistrationUrl: draft.externalRegistrationUrl.trim() || undefined,
      now,
    };

    const savedActivity = editingActivityId
      ? await updateActivity(store, {
        ...activityFields,
        activityId: editingActivityId,
      })
      : await createActivity(store, activityFields);
    await loadOrSyncDefaultActivitySession(sessionStore, savedActivity);
    setMessage(
      editingActivityId
        ? 'Activity가 수정되었습니다. Member Home에서 바로 확인할 수 있습니다.'
        : 'Activity가 저장되었습니다. Member Home에서 바로 확인할 수 있습니다.',
    );
    setDraft(initialDraft);
    setEditingActivityId(null);
    setSuggestion(null);
    await refreshDashboard();
  }

  function startEditing(activity: Activity) {
    setEditingActivityId(activity.id);
    setDraft({
      body: activity.summary,
      externalRegistrationUrl: activity.externalRegistrationUrl ?? '',
      registrationMode: activity.registrationMode ?? 'internal',
      startsAt: toDateTimeLocalValue(activity.startsAt),
      status: activity.status,
      title: activity.title,
      type: activity.type,
      visibility: activity.visibility,
    });
    setSuggestion(null);
    setMessage(`${activity.title} 수정 모드입니다. 내용을 고친 뒤 저장하세요.`);
  }

  function cancelEditing() {
    setEditingActivityId(null);
    setDraft(initialDraft);
    setSuggestion(null);
    setMessage('새 Activity 작성 모드입니다.');
  }

  async function archiveSavedActivity(activity: Activity) {
    const confirmed = window.confirm(
      `${activity.title} activity를 아카이브하시겠습니까? 아카이브된 activity는 Member Home과 상세 화면에서 숨겨집니다.`,
    );

    if (!confirmed) {
      return;
    }

    await archiveActivity(store, {
      actorRole: role,
      activityId: activity.id,
      now: new Date().toISOString(),
    });

    if (editingActivityId === activity.id) {
      setEditingActivityId(null);
      setDraft(initialDraft);
      setSuggestion(null);
    }

    setMessage(`${activity.title} activity가 아카이브되었습니다.`);
    await refreshDashboard();
  }

  async function approveApplication(application: ActivityApplication) {
    await approveApplicationForActivity(applicationStore, {
      activityId: application.activityId,
      now: new Date().toISOString(),
      userId: application.userId,
    });
    setMessage(`${application.userId} 신청을 승인했습니다.`);
    await refreshDashboard();
  }

  async function markAttended(
    activity: Activity,
    application: ActivityApplication,
  ) {
    const session =
      sessionsByActivity[activity.id] ?? (await loadDefaultSessionForActivity(activity));

    if (!session) {
      setMessage('일정이 있는 activity만 출석 처리할 수 있습니다.');
      return;
    }

    await markAttendanceForSession(attendanceStore, {
      activityType: activity.type,
      application,
      now: new Date().toISOString(),
      roleSnapshot: 'member',
      session,
    });
    setMessage(`${application.userId} 출석을 기록했습니다.`);
    await refreshDashboard();
  }

  async function approveProposal(activity: Activity) {
    await acceptActivityProposal(store, {
      actorRole: role,
      actorUserId: userId,
      activityId: activity.id,
      now: new Date().toISOString(),
    });
    setMessage(`${activity.title} 제안을 승인해 멤버 홈에 공개했습니다.`);
    await refreshDashboard();
  }

  const usesExternalRegistration = isExternalRegistrationMode(
    draft.registrationMode,
  );

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Activity Admin</h1>
        <p className="page-lead">
          운영진이 활동 초안을 쓰고, Gemini 보조를 확인하고, Firebase 또는 demo
          bridge에 저장합니다.
        </p>

        <div className="dashboard-grid section-offset-lg">
          <WdsSurfaceCard as="section">
            <form className="form" onSubmit={saveActivity}>
              <div className="badge-row">
                <WdsBadge tone="blue">
                  {editingActivityId ? 'Activity 수정' : 'Activity 생성'}
                </WdsBadge>
                {editingActivityId ? (
                  <WdsBadge>{editingActivityId}</WdsBadge>
                ) : null}
              </div>
              <WdsField label="제목">
                <WdsInput
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  value={draft.title}
                />
              </WdsField>

              <div className="grid grid-2">
                <WdsField label="유형">
                  <WdsSelect
                    onValueChange={(type) =>
                      setDraft((current) => ({
                        ...current,
                        type,
                      }))
                    }
                    options={activityTypeOptions}
                    value={draft.type}
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
                    options={activityVisibilityOptions}
                    value={draft.visibility}
                  />
                </WdsField>
              </div>

              <WdsField label="일정">
                <WdsInput
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, startsAt: event.target.value }))
                  }
                  type="datetime-local"
                  value={draft.startsAt}
                />
              </WdsField>

              <div className="grid grid-2">
                <WdsField label="등록 방식">
                  <WdsSelect
                    onValueChange={(registrationMode) => {
                      setDraft((current) => ({
                        ...current,
                        registrationMode,
                        externalRegistrationUrl: isExternalRegistrationMode(
                          registrationMode,
                        )
                          ? current.externalRegistrationUrl
                          : '',
                      }));
                    }}
                    options={registrationModeOptions}
                    value={draft.registrationMode}
                  />
                </WdsField>
              </div>

              {usesExternalRegistration ? (
                <WdsField
                  label="외부 등록 URL"
                  message={
                    <>
                      GDG 공식 행사, Build with AI, 외부 신청 폼처럼 홈페이지 밖에서
                      신청해야 하는 활동에만 사용합니다. 카드 CTA는 "바로가기"로
                      고정됩니다.
                    </>
                  }
                >
                  <WdsInput
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        externalRegistrationUrl: event.target.value,
                      }))
                    }
                    placeholder="https://gdg.community.dev/..."
                    type="url"
                    value={draft.externalRegistrationUrl}
                  />
                </WdsField>
              ) : null}

              <WdsField label="운영진 메모 / 본문">
                <WdsTextArea
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  value={draft.body}
                />
              </WdsField>

              <div className="toolbar">
                <WdsButton
                  disabled={isSuggesting}
                  onClick={requestSuggestion}
                  tone="secondary"
                  type="button"
                >
                  {isSuggesting ? 'AI 작성 중' : 'AI로 문구 정리'}
                </WdsButton>
                <WdsButton tone="primary" type="submit">
                  {editingActivityId ? 'Activity 수정' : 'Activity 저장'}
                </WdsButton>
              </div>
              {editingActivityId ? (
                <div className="toolbar">
                  <WdsButton
                    onClick={cancelEditing}
                    tone="secondary"
                    type="button"
                  >
                    수정 취소
                  </WdsButton>
                </div>
              ) : null}
              <p className="helper-text">{message}</p>
            </form>
          </WdsSurfaceCard>

          <aside className="stack">
            <WdsSurfaceCard as="section">
              <div className="badge-row">
                <WdsBadge tone="blue">AI Draft</WdsBadge>
              </div>
              {suggestion ? (
                <div className="stack section-offset-sm">
                  <p className="helper-text">카드 요약</p>
                  <p>{suggestion.cardSummary}</p>
                  <p className="helper-text">멤버용 문구</p>
                  <p>{suggestion.memberCopy}</p>
                  <p className="helper-text">공개용 문구</p>
                  <p>{suggestion.publicCopy}</p>
                  <div className="badge-row">
                    {suggestion.suggestedTags.map((tag) => (
                      <WdsBadge key={tag}>
                        {tag}
                      </WdsBadge>
                    ))}
                  </div>
                  {suggestion.missingInfo.length > 0 ? (
                    <p className="helper-text">
                      보완 필요: {suggestion.missingInfo.join(', ')}
                    </p>
                  ) : null}
                  <WdsButton onClick={applySuggestion} tone="ghost" type="button">
                    제안 적용
                  </WdsButton>
                </div>
              ) : (
                <p className="helper-text section-offset-sm">
                  초안을 입력하고 AI 보조를 실행하면 요약과 문구 제안이 여기에
                  표시됩니다.
                </p>
              )}
            </WdsSurfaceCard>

            <ProposalReviewQueue
              onApprove={approveProposal}
              proposals={pendingProposals}
            />

            <section className="stack">
              <WdsSectionHeader
                description="운영진 관점에서 볼 수 있는 activity입니다."
                flush
                title="Saved"
              />
              {activities.map((activity) => {
                const session = sessionsByActivity[activity.id] ?? null;

                return (
                  <div className="stack" key={activity.id}>
                    <ActivityCard activity={activity} />
                    <div className="toolbar">
                      <WdsButton
                        disabled={editingActivityId === activity.id}
                        onClick={() => startEditing(activity)}
                        size="small"
                        tone="secondary"
                        type="button"
                      >
                        {editingActivityId === activity.id ? '수정 중' : '수정'}
                      </WdsButton>
                      <WdsButton
                        onClick={() => void archiveSavedActivity(activity)}
                        size="small"
                        tone="ghost"
                        type="button"
                      >
                        아카이브
                      </WdsButton>
                    </div>
                    <ApplicationQueue
                      activity={activity}
                      applications={applicationsByActivity[activity.id] ?? []}
                      attendances={
                        session ? attendancesBySession[session.id] ?? [] : []
                      }
                      onApprove={approveApplication}
                      onMarkAttended={markAttended}
                      session={session}
                    />
                  </div>
                );
              })}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProposalReviewQueue({
  onApprove,
  proposals,
}: {
  onApprove: (activity: Activity) => void;
  proposals: Activity[];
}) {
  return (
    <section className="stack">
      <WdsSectionHeader
        description="멤버가 제출한 프로젝트 제안을 검토하고 공개 여부를 확정합니다."
        flush
        title="Member Proposals"
      />

      {proposals.length > 0 ? (
        <div className="application-queue">
          {proposals.map((proposal) => (
            <div className="application-row" key={proposal.id}>
              <div>
                <strong>{proposal.title}</strong>
                <div className="helper-text">
                  {proposal.proposedByUserId ?? 'unknown member'} · {proposal.type}
                </div>
                <p className="helper-text">{proposal.summary}</p>
              </div>
              <WdsButton
                onClick={() => onApprove(proposal)}
                size="small"
                tone="primary"
                type="button"
              >
                승인
              </WdsButton>
            </div>
          ))}
        </div>
      ) : (
        <WdsEmptyState>검토 대기 중인 프로젝트 제안이 없습니다.</WdsEmptyState>
      )}
    </section>
  );
}

function ApplicationQueue({
  activity,
  applications,
  attendances,
  onApprove,
  onMarkAttended,
  session,
}: {
  activity: Activity;
  applications: ActivityApplication[];
  attendances: SessionAttendance[];
  onApprove: (application: ActivityApplication) => void;
  onMarkAttended: (
    activity: Activity,
    application: ActivityApplication,
  ) => void;
  session: ActivitySession | null;
}) {
  const summary = session
    ? summarizeSessionAttendance({
        applications,
        attendances,
        now: new Date().toISOString(),
        session,
      })
    : null;
  const attendedUserIds = new Set(attendances.map((attendance) => attendance.userId));

  if (applications.length === 0) {
    return (
      <WdsEmptyState>아직 신청자가 없습니다.</WdsEmptyState>
    );
  }

  return (
    <div className="application-queue">
      {summary ? <AttendanceSummary summary={summary} /> : null}
      {applications.map((application) => {
        const isAttended = attendedUserIds.has(application.userId);

        return (
          <div className="application-row" key={application.id}>
            <div>
              <strong>{application.userId}</strong>
              <div className="helper-text">
                {application.state === 'applied'
                  ? '운영진 승인 대기 중'
                  : isAttended
                    ? '출석 완료'
                    : '승인됨'}
              </div>
            </div>
            {application.state === 'applied' ? (
              <WdsButton
                onClick={() => onApprove(application)}
                size="small"
                tone="primary"
                type="button"
              >
                승인
              </WdsButton>
            ) : isAttended ? (
              <WdsBadge tone="green">출석 완료</WdsBadge>
            ) : (
              <WdsButton
                disabled={!session}
                onClick={() => onMarkAttended(activity, application)}
                size="small"
                tone="secondary"
                type="button"
              >
                출석 처리
              </WdsButton>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AttendanceSummary({
  summary,
}: {
  summary: ReturnType<typeof summarizeSessionAttendance>;
}) {
  return (
    <div className="attendance-summary">
      <WdsBadge>신청 {summary.appliedCount}</WdsBadge>
      <WdsBadge tone="blue">승인 {summary.approvedCount}</WdsBadge>
      <WdsBadge tone="green">참석 {summary.attendedCount}</WdsBadge>
      <WdsBadge>파생 미참석 {summary.derivedAbsentCount}</WdsBadge>
    </div>
  );
}

function toDateTimeLocalValue(value: string | undefined) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function isExternalRegistrationMode(mode: ActivityRegistrationMode) {
  return mode === 'external' || mode === 'hybrid';
}
