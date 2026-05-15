'use client';

import Link from 'next/link';
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Activity, UserRole } from '@/domain/activity';
import {
  type ActivityProposalType,
  proposeMemberActivity,
} from '@/domain/activity-service';
import { getPublicOnboardingHref } from '@/domain/auth-flow';
import type { ActivityApplicationState } from '@/domain/activity-application';
import { submitGuestProfile } from '@/domain/chapter-user-service';
import type { ChapterRecord, ChapterRecordKind } from '@/domain/chapter-record';
import type { Notice } from '@/domain/notice';
import {
  submitChapterRecord,
} from '@/domain/chapter-record-service';
import type { Showcase } from '@/domain/showcase';
import {
  applyForActivity,
  cancelApplicationForActivity,
  type MemberApplicationSummary,
} from '@/domain/activity-participation-service';
import {
  buildMemberHomeSnapshot,
  isMemberHomeSnapshotCurrent,
  type MemberHomeSnapshot,
} from '@/domain/member-home-snapshot';
import { memberDashboardDestinations } from '@/domain/member-dashboard-destinations';
import { describeMemberHomeAccess } from '@/domain/member-access';
import { koreanCopy } from '@/domain/korean-copy';
import { formatKoreanDateTime } from '@/lib/format-korean-date-time';
import { ActivityCard } from '@/components/activity-card';
import { ChapterRecordCard } from '@/components/chapter-record-card';
import { NoticeBoard } from '@/components/notice-board';
import { ShowcaseCard } from '@/components/showcase-card';
import {
  WdsBadgeGroup,
  WdsFormActions,
  WdsPageHeader,
  WdsQueue,
  WdsQueueRow,
  WdsResponsiveGrid,
  WdsSectionHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import {
  WdsBadge,
  WdsButton,
  WdsEmptyState,
  WdsField,
  WdsInput,
  WdsLinkButton,
  WdsSelect,
  WdsTextArea,
  WdsTextLinkButton,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import {
  defaultGuestProfile,
  GuestProfileForm,
  type GuestProfileFormState,
  toGuestProfileForm,
} from '@/features/users/guest-profile-form';
import {
  demoRoleOptions,
  useAuthSession,
} from '@/features/auth/auth-session-provider';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivityStore } from './browser-activity-store';
import { createBrowserNoticeStore } from '../notices/browser-notice-store';
import { createBrowserShowcaseStore } from '../showcases/browser-showcase-store';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { createBrowserChapterRecordStore } from '../records/browser-chapter-record-store';

type MemberProposalFormState = {
  title: string;
  summary: string;
  type: ActivityProposalType;
  startsAt: string;
};

type MemberRecordFormState = {
  title: string;
  summary: string;
  body: string;
  kind: ChapterRecordKind;
  tags: string;
};

const memberFormSurfaceSx = {
  display: 'grid',
  gap: '18px',
  '& h2': {
    color: 'var(--text-strong)',
    fontSize: '22px',
    letterSpacing: 0,
    lineHeight: 1.3,
    margin: '12px 0 8px',
  },
  '& > div > p': {
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0,
  },
};

const defaultMemberProposal: MemberProposalFormState = {
  title: '',
  summary: '',
  type: 'study',
  startsAt: '',
};

const defaultMemberRecord: MemberRecordFormState = {
  title: '',
  summary: '',
  body: '',
  kind: 'retrospective',
  tags: '',
};

const demoRoleSelectOptions: readonly WdsSelectOption<UserRole>[] =
  demoRoleOptions.map((role) => ({
    label: role,
    value: role,
  }));

const activityProposalTypeOptions = [
  { label: 'Study', value: 'study' },
  { label: 'Project', value: 'project' },
] satisfies readonly WdsSelectOption<ActivityProposalType>[];

const chapterRecordKindOptions = [
  { label: 'Retrospective', value: 'retrospective' },
  { label: 'Review', value: 'review' },
  { label: 'Technical Note', value: 'technical_note' },
] satisfies readonly WdsSelectOption<ChapterRecordKind>[];

const memberHomeCopy = koreanCopy.memberHome;

export function MemberHome() {
  const {
    isFirebaseConfigured,
    role,
    setDemoRole,
    status: authStatus,
    userId,
  } = useAuthSession();
  const store = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const noticeStore = useMemo(() => createBrowserNoticeStore(), []);
  const showcaseStore = useMemo(() => createBrowserShowcaseStore(), []);
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const recordStore = useMemo(() => createBrowserChapterRecordStore(), []);
  const [snapshot, setSnapshot] = useState<MemberHomeSnapshot | null>(null);
  const [guestProfile, setGuestProfile] =
    useState<GuestProfileFormState>(defaultGuestProfile);
  const [guestProfileMessage, setGuestProfileMessage] = useState<string>(
    memberHomeCopy.guestProfile.initialMessage,
  );

  const [proposal, setProposal] = useState<MemberProposalFormState>(
    defaultMemberProposal,
  );
  const [proposalMessage, setProposalMessage] = useState<string>(
    memberHomeCopy.proposal.initialMessage,
  );
  const [recordDraft, setRecordDraft] =
    useState<MemberRecordFormState>(defaultMemberRecord);
  const [recordMessage, setRecordMessage] = useState<string>(
    memberHomeCopy.recordForm.initialMessage,
  );

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    void refreshMemberHome(role, userId);
    if (role === 'guest') {
      void loadGuestProfile(userId);
    }
  }, [authStatus, role, userId]);

  async function refreshMemberHome(currentRole: UserRole, currentUserId: string) {
    setSnapshot(
      await buildMemberHomeSnapshot({
        activityStore: store,
        applicationStore,
        noticeStore,
        recordStore,
        role: currentRole,
        showcaseStore,
        userId: currentUserId,
      }),
    );
  }

  function changeDemoRole(nextRole: UserRole) {
    setDemoRole(nextRole);
  }

  async function loadGuestProfile(currentUserId: string) {
    const savedGuest = await userStore.findUser(currentUserId);

    if (!savedGuest) {
      setGuestProfile(defaultGuestProfile);
      return;
    }

    setGuestProfile(toGuestProfileForm(savedGuest));
  }

  async function handleApply(activity: Activity) {
    const confirmed = window.confirm(memberHomeCopy.confirmations.apply);

    if (!confirmed) {
      return;
    }

    await applyForActivity(applicationStore, {
      activityId: activity.id,
      now: new Date().toISOString(),
      userId,
    });
    await refreshMemberHome(role, userId);
  }

  async function handleCancel(activity: Activity) {
    const confirmed = window.confirm(memberHomeCopy.confirmations.cancel);

    if (!confirmed) {
      return;
    }

    await cancelApplicationForActivity(applicationStore, {
      activityId: activity.id,
      cancellationAllowed: true,
      now: new Date().toISOString(),
      userId,
    });
    await refreshMemberHome(role, userId);
  }

  async function handleGuestProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await submitGuestProfile(userStore, {
      id: userId,
      displayName: guestProfile.displayName.trim() || defaultGuestProfile.displayName,
      email: guestProfile.email.trim() || defaultGuestProfile.email,
      now: new Date().toISOString(),
      profile: {
        cohort: guestProfile.cohort.trim(),
        department: guestProfile.department.trim(),
        interests: guestProfile.interests.trim(),
        motivation: guestProfile.motivation.trim(),
        studentId: guestProfile.studentId.trim(),
      },
    });

    setGuestProfileMessage(memberHomeCopy.guestProfile.savedMessage);
    await loadGuestProfile(userId);
  }

  async function handleProposalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const created = await proposeMemberActivity(store, {
      actorRole: role,
      actorUserId: userId,
      title: proposal.title.trim(),
      summary: proposal.summary.trim(),
      type: proposal.type,
      startsAt: proposal.startsAt
        ? new Date(proposal.startsAt).toISOString()
        : undefined,
      now: new Date().toISOString(),
    });

    setProposal(defaultMemberProposal);
    setProposalMessage(
      created.proposalStatus === 'pending_review'
        ? memberHomeCopy.proposal.projectSavedMessage
        : memberHomeCopy.proposal.studySavedMessage,
    );
    await refreshMemberHome(role, userId);
  }

  async function handleRecordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await submitChapterRecord(recordStore, {
      actorRole: role,
      actorUserId: userId,
      title: recordDraft.title.trim(),
      summary: recordDraft.summary.trim(),
      body: recordDraft.body.trim(),
      kind: recordDraft.kind,
      visibility: 'member',
      status: 'pending_review',
      tags: parseCsvTags(recordDraft.tags),
      now: new Date().toISOString(),
    });

    setRecordDraft(defaultMemberRecord);
    setRecordMessage(memberHomeCopy.recordForm.savedMessage);
    await refreshMemberHome(role, userId);
  }

  const currentSnapshot = isMemberHomeSnapshotCurrent(snapshot, { role, userId })
    ? snapshot
    : null;
  const applicationStates = currentSnapshot?.applicationStates ?? {};
  const notices = currentSnapshot?.notices ?? [];
  const showcases = currentSnapshot?.showcases ?? [];
  const records = currentSnapshot?.records ?? [];
  const upcoming = currentSnapshot?.sections.upcomingActivities ?? [];
  const studiesAndProjects = currentSnapshot?.sections.studiesAndProjects ?? [];
  const challenges = currentSnapshot?.sections.challengesAndSocialActivities ?? [];
  const memberApplicationSummaries =
    currentSnapshot?.memberApplicationSummaries ?? [];
  const dashboardCalendarActivities =
    currentSnapshot?.dashboard.calendarActivities ?? upcoming;
  const dashboardImportantNotices =
    currentSnapshot?.dashboard.importantNotices ?? notices;
  const dashboardMyNextCommitments =
    currentSnapshot?.dashboard.myNextCommitments ?? memberApplicationSummaries;
  const dashboardOpenStudyProjects =
    currentSnapshot?.dashboard.openStudyProjects ?? studiesAndProjects;
  const dashboardOpenStudies = dashboardOpenStudyProjects.filter(
    (activity) => activity.type === 'study',
  );
  const dashboardOpenProjects = dashboardOpenStudyProjects.filter(
    (activity) => activity.type === 'project',
  );
  const access = describeMemberHomeAccess(role);
  const canApplyToActivities =
    currentSnapshot?.canApplyToActivities ?? access.canApplyToActivities;
  const canProposeActivities =
    currentSnapshot?.canProposeActivities ?? canApplyToActivities;

  return (
    <main className="page">
      <div className="container">
        <WdsPageHeader
          description={memberHomeCopy.header.description}
          eyebrow={memberHomeCopy.header.eyebrow}
          title={memberHomeCopy.header.title}
        />

        <section className="section section-compact">
          <div className="access-panel">
            <div>
              <WdsBadgeGroup>
                <WdsBadge tone="blue">
                  {isFirebaseConfigured
                    ? memberHomeCopy.access.currentRoleLabel
                    : 'Demo Role'}
                </WdsBadge>
                <WdsBadge>{access.status}</WdsBadge>
              </WdsBadgeGroup>
              <h2>{getAccessPanelTitle(access?.status)}</h2>
              <p>{access.message}</p>
            </div>
            <div className="access-panel-side">
              {role === 'visitor' ? (
                <div className="access-panel-actions">
                  <WdsLinkButton href={getPublicOnboardingHref()} tone="primary">
                    {memberHomeCopy.access.googleLoginLabel}
                  </WdsLinkButton>
                </div>
              ) : null}
              {role === 'guest' ? (
                <div className="access-panel-actions">
                  <WdsLinkButton href={getPublicOnboardingHref()} tone="primary">
                    {memberHomeCopy.access.guestSubmitLabel}
                  </WdsLinkButton>
                </div>
              ) : null}
              <WdsField
                className="demo-role-field"
                label={
                  isFirebaseConfigured
                    ? memberHomeCopy.access.currentRoleLabel
                    : memberHomeCopy.access.demoRoleLabel
                }
              >
                <WdsSelect
                  disabled={authStatus !== 'demo'}
                  onValueChange={changeDemoRole}
                  options={demoRoleSelectOptions}
                  value={role}
                />
              </WdsField>
            </div>
          </div>
        </section>

        {role === 'guest' ? (
          <section className="section section-compact">
            <GuestProfileForm
              message={guestProfileMessage}
              onChange={setGuestProfile}
              onSubmit={handleGuestProfileSubmit}
              value={guestProfile}
            />
          </section>
        ) : null}

        <MemberDashboardRouteGrid
          calendarCount={dashboardCalendarActivities.length}
          noticesCount={dashboardImportantNotices.length}
          projectsCount={dashboardOpenProjects.length}
          recordsCount={records.length}
          studiesCount={dashboardOpenStudies.length}
        />

        <MemberCalendarSection
          activities={dashboardCalendarActivities}
          applicationStates={applicationStates}
        />

        <ImportantNoticeSection notices={dashboardImportantNotices.slice(0, 6)} />

        {canApplyToActivities ? (
          <MemberApplicationsSection summaries={dashboardMyNextCommitments} />
        ) : null}

        <ActivitySection
          activities={dashboardOpenStudies}
          applicationStates={applicationStates}
          description="모집 중이거나 진행 중인 스터디를 먼저 확인하고, 더 많은 스터디는 전용 목록에서 살펴봅니다."
          moreHref="/studies"
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="스터디 현황"
        />
        <ActivitySection
          activities={dashboardOpenProjects}
          applicationStates={applicationStates}
          description="진행 중인 프로젝트와 새로 열릴 프로젝트 기회를 확인하고 신청합니다."
          moreHref="/projects"
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="프로젝트 현황"
        />
        <ActivitySection
          activities={challenges}
          applicationStates={applicationStates}
          description={memberHomeCopy.activitySections.challenges.description}
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title={memberHomeCopy.activitySections.challenges.title}
        />

        <ShowcasePreviewSection showcases={showcases.slice(0, 3)} />

        <ChapterRecordSection records={records.slice(0, 3)} />

        <WdsResponsiveGrid columns={3} offset="lg">
          <WdsSurfaceCard>
            <WdsBadge tone="blue">Calendar</WdsBadge>
            <h3>
              {memberHomeCopy.dashboard.summaryCards.schedule.title(
                dashboardCalendarActivities.length,
              )}
            </h3>
            <p>{memberHomeCopy.dashboard.summaryCards.schedule.description}</p>
          </WdsSurfaceCard>
          <WdsSurfaceCard>
            <WdsBadge tone="green">My Status</WdsBadge>
            <h3>
              {canApplyToActivities
                ? memberHomeCopy.dashboard.summaryCards.commitments.title(
                  dashboardMyNextCommitments.length,
                )
                : memberHomeCopy.summaryCards.participation.applyLimitedTitle}
            </h3>
            <p>
              {canApplyToActivities
                ? memberHomeCopy.dashboard.summaryCards.commitments.description
                : access?.message ??
                  memberHomeCopy.summaryCards.participation.fallbackMessage}
            </p>
          </WdsSurfaceCard>
          <WdsSurfaceCard>
            <WdsBadge tone="blue">Board</WdsBadge>
            <h3>
              {memberHomeCopy.dashboard.summaryCards.studyProjects.title(
                dashboardOpenStudies.length + dashboardOpenProjects.length,
              )}
            </h3>
            <p>
              {memberHomeCopy.dashboard.summaryCards.studyProjects.description}
            </p>
          </WdsSurfaceCard>
        </WdsResponsiveGrid>

        {canProposeActivities ? (
          <MemberProposalForm
            message={proposalMessage}
            onChange={setProposal}
            onSubmit={handleProposalSubmit}
            value={proposal}
          />
        ) : null}

        {canProposeActivities ? (
          <MemberRecordForm
            message={recordMessage}
            onChange={setRecordDraft}
            onSubmit={handleRecordSubmit}
            value={recordDraft}
          />
        ) : null}
      </div>
    </main>
  );
}

function MemberDashboardRouteGrid({
  calendarCount,
  noticesCount,
  projectsCount,
  recordsCount,
  studiesCount,
}: {
  calendarCount: number;
  noticesCount: number;
  projectsCount: number;
  recordsCount: number;
  studiesCount: number;
}) {
  const counts = {
    calendar: `${calendarCount}개 일정`,
    notices: `${noticesCount}개 공지`,
    projects: `${projectsCount}개 프로젝트`,
    records: `${recordsCount}개 기록`,
    studies: `${studiesCount}개 스터디`,
  };

  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="Dashboard에서 오늘 확인할 항목을 한 번에 훑고, 필요한 카테고리로 바로 이동합니다."
        title="Dashboard 흐름"
      />
      <WdsResponsiveGrid columns={3} dense>
        {memberDashboardDestinations.map((destination) => (
          <WdsSurfaceCard
            as={Link}
            className="member-route-card"
            href={destination.href}
            key={destination.id}
          >
            <WdsBadge tone="blue">{destination.label}</WdsBadge>
            <h3>{destination.title}</h3>
            <p>{destination.description}</p>
            <span className="member-route-count">
              {counts[destination.id]}
            </span>
          </WdsSurfaceCard>
        ))}
      </WdsResponsiveGrid>
    </section>
  );
}

function MemberFormSurface({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <WdsSurfaceCard
      as="form"
      onSubmit={onSubmit}
      sx={memberFormSurfaceSx}
    >
      {children}
    </WdsSurfaceCard>
  );
}

function MemberProposalForm({
  message,
  onChange,
  onSubmit,
  value,
}: {
  message: string;
  onChange: (value: MemberProposalFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  value: MemberProposalFormState;
}) {
  function updateField(
    field: keyof MemberProposalFormState,
    nextValue: string,
  ) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <section className="section section-compact">
      <MemberFormSurface onSubmit={onSubmit}>
        <div>
          <WdsBadge tone="blue">Member Proposal</WdsBadge>
          <h2>{memberHomeCopy.proposal.title}</h2>
          <p>{memberHomeCopy.proposal.intro}</p>
        </div>

        <WdsResponsiveGrid columns={2}>
          <WdsField label={memberHomeCopy.proposal.fieldLabels.type}>
            <WdsSelect
              onValueChange={(nextValue) => updateField('type', nextValue)}
              options={activityProposalTypeOptions}
              value={value.type}
            />
          </WdsField>
          <WdsField label={memberHomeCopy.proposal.fieldLabels.startsAt}>
            <WdsInput
              onChange={(event) => updateField('startsAt', event.target.value)}
              type="datetime-local"
              value={value.startsAt}
            />
          </WdsField>
        </WdsResponsiveGrid>

        <WdsField label={memberHomeCopy.proposal.fieldLabels.title}>
          <WdsInput
            onChange={(event) => updateField('title', event.target.value)}
            required
            value={value.title}
          />
        </WdsField>

        <WdsField label={memberHomeCopy.proposal.fieldLabels.summary}>
          <WdsTextArea
            onChange={(event) => updateField('summary', event.target.value)}
            required
            value={value.summary}
          />
        </WdsField>

        <WdsFormActions
          actions={
            <WdsButton tone="primary" type="submit">
              {memberHomeCopy.proposal.submitLabel}
            </WdsButton>
          }
          helper={message}
        />
      </MemberFormSurface>
    </section>
  );
}

function MemberRecordForm({
  message,
  onChange,
  onSubmit,
  value,
}: {
  message: string;
  onChange: (value: MemberRecordFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  value: MemberRecordFormState;
}) {
  function updateField(field: keyof MemberRecordFormState, nextValue: string) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <section className="section section-compact">
      <MemberFormSurface onSubmit={onSubmit}>
        <div>
          <WdsBadge tone="green">Chapter Record</WdsBadge>
          <h2>{memberHomeCopy.recordForm.title}</h2>
          <p>{memberHomeCopy.recordForm.intro}</p>
        </div>

        <WdsResponsiveGrid columns={2}>
          <WdsField label={memberHomeCopy.recordForm.fieldLabels.kind}>
            <WdsSelect
              onValueChange={(nextValue) => updateField('kind', nextValue)}
              options={chapterRecordKindOptions}
              value={value.kind}
            />
          </WdsField>
          <WdsField label={memberHomeCopy.recordForm.fieldLabels.tags}>
            <WdsInput
              onChange={(event) => updateField('tags', event.target.value)}
              placeholder="Gemini, Firebase"
              value={value.tags}
            />
          </WdsField>
        </WdsResponsiveGrid>

        <WdsField label={memberHomeCopy.recordForm.fieldLabels.title}>
          <WdsInput
            onChange={(event) => updateField('title', event.target.value)}
            required
            value={value.title}
          />
        </WdsField>

        <WdsField label={memberHomeCopy.recordForm.fieldLabels.summary}>
          <WdsTextArea
            onChange={(event) => updateField('summary', event.target.value)}
            required
            value={value.summary}
          />
        </WdsField>

        <WdsField label={memberHomeCopy.recordForm.fieldLabels.body}>
          <WdsTextArea
            onChange={(event) => updateField('body', event.target.value)}
            required
            value={value.body}
          />
        </WdsField>

        <WdsFormActions
          actions={
            <WdsButton tone="primary" type="submit">
              {memberHomeCopy.recordForm.submitLabel}
            </WdsButton>
          }
          helper={message}
        />
      </MemberFormSurface>
    </section>
  );
}

function MemberCalendarSection({
  activities,
  applicationStates,
}: {
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
}) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description={memberHomeCopy.dashboard.calendar.description}
        title={memberHomeCopy.dashboard.calendar.title}
        trailingContent={
          <WdsTextLinkButton href="/calendar">전체 일정</WdsTextLinkButton>
        }
      />
      {activities.length > 0 ? (
        <WdsQueue as="div">
          {activities.map((activity) => {
            const applicationState = applicationStates[activity.id];

            return (
              <WdsQueueRow
                actions={
                  <WdsTextLinkButton
                    href={`/activities/${encodeURIComponent(activity.id)}`}
                  >
                    {memberHomeCopy.applications.detailLabel}
                  </WdsTextLinkButton>
                }
                as="article"
                key={activity.id}
              >
                <div>
                  <WdsBadgeGroup>
                    <WdsBadge tone="blue">{activity.type}</WdsBadge>
                    {applicationState ? (
                      <WdsBadge tone="green">
                        {getApplicationStateLabel(applicationState)}
                      </WdsBadge>
                    ) : null}
                  </WdsBadgeGroup>
                  <strong>{activity.title}</strong>
                  <p className="helper-text">
                    {activity.startsAt
                      ? formatKoreanDateTime(activity.startsAt)
                      : memberHomeCopy.applications.unscheduled}
                  </p>
                </div>
              </WdsQueueRow>
            );
          })}
        </WdsQueue>
      ) : (
        <WdsEmptyState>{memberHomeCopy.dashboard.calendar.empty}</WdsEmptyState>
      )}
    </section>
  );
}

function ImportantNoticeSection({ notices }: { notices: Notice[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description={memberHomeCopy.dashboard.notices.description}
        title={memberHomeCopy.dashboard.notices.title}
        trailingContent={
          <WdsTextLinkButton href="/notices">전체 공지</WdsTextLinkButton>
        }
      />
      <NoticeBoard notices={notices} />
    </section>
  );
}

function ShowcasePreviewSection({ showcases }: { showcases: Showcase[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description={memberHomeCopy.showcase.description}
        title={memberHomeCopy.showcase.title}
      />
      {showcases.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {showcases.map((showcase) => (
            <ShowcaseCard key={showcase.id} showcase={showcase} />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>{memberHomeCopy.showcase.empty}</WdsEmptyState>
      )}
    </section>
  );
}

function ChapterRecordSection({ records }: { records: ChapterRecord[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description={memberHomeCopy.records.description}
        title={memberHomeCopy.records.title}
        trailingContent={
          <WdsTextLinkButton href="/records">전체 기록</WdsTextLinkButton>
        }
      />
      {records.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {records.map((record) => (
            <ChapterRecordCard key={record.id} record={record} />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>{memberHomeCopy.records.empty}</WdsEmptyState>
      )}
    </section>
  );
}

function MemberApplicationsSection({
  summaries,
}: {
  summaries: MemberApplicationSummary[];
}) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description={memberHomeCopy.applications.description}
        title={memberHomeCopy.applications.title}
      />
      {summaries.length > 0 ? (
        <WdsQueue>
          {summaries.map(({ activity, state }) => (
            <WdsQueueRow as="article" key={activity.id}>
              <div>
                <WdsBadgeGroup>
                  <WdsBadge tone={state === 'approved' ? 'green' : 'blue'}>
                    {getApplicationStateLabel(state)}
                  </WdsBadge>
                  <WdsBadge>{activity.type}</WdsBadge>
                </WdsBadgeGroup>
                <strong>{activity.title}</strong>
                <p className="helper-text">
                  {activity.startsAt
                    ? formatKoreanDateTime(activity.startsAt)
                    : memberHomeCopy.applications.unscheduled}
                </p>
              </div>
              <WdsTextLinkButton
                href={`/activities/${encodeURIComponent(activity.id)}`}
              >
                {memberHomeCopy.applications.detailLabel}
              </WdsTextLinkButton>
            </WdsQueueRow>
          ))}
        </WdsQueue>
      ) : (
        <WdsEmptyState>{memberHomeCopy.applications.empty}</WdsEmptyState>
      )}
    </section>
  );
}

function ActivitySection({
  activities,
  applicationStates,
  description,
  moreHref,
  onApply,
  onCancel,
  title,
}: {
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  description: string;
  moreHref?: string;
  onApply?: (activity: Activity) => void;
  onCancel?: (activity: Activity) => void;
  title: string;
}) {
  return (
    <section className="section">
      <WdsSectionHeader
        description={description}
        title={title}
        trailingContent={
          moreHref ? (
            <WdsTextLinkButton href={moreHref}>전체 보기</WdsTextLinkButton>
          ) : null
        }
      />
      {activities.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {activities.map((activity) => (
            <ActivityCard
              activity={activity}
              applicationState={applicationStates[activity.id]}
              key={activity.id}
              onApply={onApply}
              onCancel={onCancel}
            />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>{memberHomeCopy.activitySections.empty}</WdsEmptyState>
      )}
    </section>
  );
}

function getAccessPanelTitle(status?: string) {
  switch (status) {
    case 'login_required':
      return memberHomeCopy.statusLabels.access.login_required;
    case 'pending_approval':
      return memberHomeCopy.statusLabels.access.pending_approval;
    case 'alumni':
      return memberHomeCopy.statusLabels.access.alumni;
    case 'active_member':
      return memberHomeCopy.statusLabels.access.active_member;
    default:
      return memberHomeCopy.statusLabels.access.unknown;
  }
}

function getApplicationStateLabel(state: ActivityApplicationState) {
  switch (state) {
    case 'applied':
      return memberHomeCopy.statusLabels.application.applied;
    case 'approved':
      return memberHomeCopy.statusLabels.application.approved;
  }
}

function parseCsvTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
