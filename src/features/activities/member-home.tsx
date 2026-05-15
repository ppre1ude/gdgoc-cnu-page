'use client';

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
import { describeMemberHomeAccess } from '@/domain/member-access';
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
  const [guestProfileMessage, setGuestProfileMessage] = useState(
    '승인에 필요한 정보를 제출하면 운영진 승인 큐에서 바로 확인할 수 있습니다.',
  );

  const [proposal, setProposal] = useState<MemberProposalFormState>(
    defaultMemberProposal,
  );
  const [proposalMessage, setProposalMessage] = useState(
    '스터디는 바로 멤버 홈에 공개되고, 프로젝트는 운영진 검토 후 공개됩니다.',
  );
  const [recordDraft, setRecordDraft] =
    useState<MemberRecordFormState>(defaultMemberRecord);
  const [recordMessage, setRecordMessage] = useState(
    '회고와 기술 노트는 운영진 검토 후 멤버 홈에 게시됩니다.',
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
    const confirmed = window.confirm(
      '이 활동에 참여 신청하시겠습니까? 운영진 승인 후 참여가 확정됩니다.',
    );

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
    const confirmed = window.confirm(
      '정말 취소하시겠습니까? 승인된 신청을 취소하면 다시 신청 시 운영진 승인을 다시 받아야 합니다.',
    );

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

    setGuestProfileMessage(
      '승인 요청 정보가 저장되었습니다. 운영진 승인 화면에서 바로 확인할 수 있습니다.',
    );
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
        ? '프로젝트 제안이 운영진 검토 대기열에 저장되었습니다.'
        : '스터디 제안이 저장되어 멤버 홈에 바로 반영되었습니다.',
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
    setRecordMessage('긴 글 기록이 운영진 검토 대기열에 저장되었습니다.');
    await refreshMemberHome(role, userId);
  }

  const currentSnapshot = isMemberHomeSnapshotCurrent(snapshot, { role, userId })
    ? snapshot
    : null;
  const activities = currentSnapshot?.activities ?? [];
  const applicationStates = currentSnapshot?.applicationStates ?? {};
  const notices = currentSnapshot?.notices ?? [];
  const showcases = currentSnapshot?.showcases ?? [];
  const records = currentSnapshot?.records ?? [];
  const upcoming = currentSnapshot?.sections.upcomingActivities ?? [];
  const studiesAndProjects = currentSnapshot?.sections.studiesAndProjects ?? [];
  const challenges = currentSnapshot?.sections.challengesAndSocialActivities ?? [];
  const activeApplicationCount = currentSnapshot?.activeApplicationCount ?? 0;
  const memberApplicationSummaries =
    currentSnapshot?.memberApplicationSummaries ?? [];
  const access = describeMemberHomeAccess(role);
  const canApplyToActivities =
    currentSnapshot?.canApplyToActivities ?? access.canApplyToActivities;
  const canProposeActivities =
    currentSnapshot?.canProposeActivities ?? canApplyToActivities;

  return (
    <main className="page">
      <div className="container">
        <WdsPageHeader
          description="공지, 이벤트, 스터디, 프로젝트를 한 화면에서 확인하는 멤버용 홈입니다. 현재 데모는 activity 데이터를 Firebase 또는 localStorage bridge에서 읽습니다."
          eyebrow="Member Home"
          title="지금 우리 챕터에서 진행 중인 활동"
        />

        <section className="section section-compact">
          <div className="access-panel">
            <div>
              <WdsBadgeGroup>
                <WdsBadge tone="blue">
                  {isFirebaseConfigured ? '현재 역할' : 'Demo Role'}
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
                    Google 로그인
                  </WdsLinkButton>
                </div>
              ) : null}
              {role === 'guest' ? (
                <div className="access-panel-actions">
                  <WdsLinkButton href={getPublicOnboardingHref()} tone="primary">
                    가입 정보 제출
                  </WdsLinkButton>
                </div>
              ) : null}
              <WdsField
                className="demo-role-field"
                label={isFirebaseConfigured ? '현재 역할' : 'Demo 역할'}
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

        <section className="section section-compact">
          <WdsSectionHeader
            description="운영진이 고정한 중요한 공지를 먼저 보여줍니다."
            title="공지사항"
          />
          <NoticeBoard notices={notices.slice(0, 6)} />
        </section>

        <ShowcasePreviewSection showcases={showcases.slice(0, 3)} />

        <ChapterRecordSection records={records.slice(0, 3)} />

        <WdsResponsiveGrid columns={3} offset="lg">
          <WdsSurfaceCard>
            <WdsBadge tone="green">Participation</WdsBadge>
            <h3>
              {canApplyToActivities
                ? `${activeApplicationCount}개 활동 참여 중`
                : '활동 신청 제한'}
            </h3>
            <p>
              {canApplyToActivities
                ? '참여 신청을 누르면 이 숫자와 카드 상태가 바로 바뀝니다.'
                : access?.message ?? '역할 정보를 확인한 뒤 신청 가능 여부를 표시합니다.'}
            </p>
          </WdsSurfaceCard>
          <WdsSurfaceCard>
            <WdsBadge tone="blue">Next Action</WdsBadge>
            <h3>{activities.length}개 활동 열람 가능</h3>
            <p>Firebase 설정 전에는 localStorage bridge로 같은 흐름을 검증합니다.</p>
          </WdsSurfaceCard>
        </WdsResponsiveGrid>

        {canApplyToActivities ? (
          <MemberApplicationsSection summaries={memberApplicationSummaries} />
        ) : null}

        <ActivitySection
          activities={upcoming}
          applicationStates={applicationStates}
          description="오프라인 이벤트와 일정이 있는 활동을 우선 표시합니다."
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="다가오는 활동"
        />
        <ActivitySection
          activities={studiesAndProjects}
          applicationStates={applicationStates}
          description="장기적으로 이어지는 학습과 제작 활동입니다."
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="스터디 / 프로젝트"
        />
        <ActivitySection
          activities={challenges}
          applicationStates={applicationStates}
          description="챕터 참여를 높이기 위한 챌린지와 친목 활동입니다."
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="챌린지 / 친목"
        />
      </div>
    </main>
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
          <h2>스터디 / 프로젝트 제안</h2>
          <p>
            멤버가 직접 스터디를 열거나 프로젝트 아이디어를 제안할 수 있습니다. 프로젝트는
            운영진 승인 후 멤버 홈에 공개됩니다.
          </p>
        </div>

        <WdsResponsiveGrid columns={2}>
          <WdsField label="활동 유형">
            <WdsSelect
              onValueChange={(nextValue) => updateField('type', nextValue)}
              options={activityProposalTypeOptions}
              value={value.type}
            />
          </WdsField>
          <WdsField label="일정">
            <WdsInput
              onChange={(event) => updateField('startsAt', event.target.value)}
              type="datetime-local"
              value={value.startsAt}
            />
          </WdsField>
        </WdsResponsiveGrid>

        <WdsField label="제목">
          <WdsInput
            onChange={(event) => updateField('title', event.target.value)}
            required
            value={value.title}
          />
        </WdsField>

        <WdsField label="요약">
          <WdsTextArea
            onChange={(event) => updateField('summary', event.target.value)}
            required
            value={value.summary}
          />
        </WdsField>

        <WdsFormActions
          actions={
            <WdsButton tone="primary" type="submit">
              제안 제출
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
          <h2>회고 / 리뷰 / 기술 노트 작성</h2>
          <p>
            Discord에 묻히기 쉬운 긴 글을 홈페이지 기록으로 남깁니다. 제출된 글은 운영진
            검토 후 멤버 홈에 게시됩니다.
          </p>
        </div>

        <WdsResponsiveGrid columns={2}>
          <WdsField label="기록 유형">
            <WdsSelect
              onValueChange={(nextValue) => updateField('kind', nextValue)}
              options={chapterRecordKindOptions}
              value={value.kind}
            />
          </WdsField>
          <WdsField label="태그">
            <WdsInput
              onChange={(event) => updateField('tags', event.target.value)}
              placeholder="Gemini, Firebase"
              value={value.tags}
            />
          </WdsField>
        </WdsResponsiveGrid>

        <WdsField label="제목">
          <WdsInput
            onChange={(event) => updateField('title', event.target.value)}
            required
            value={value.title}
          />
        </WdsField>

        <WdsField label="요약">
          <WdsTextArea
            onChange={(event) => updateField('summary', event.target.value)}
            required
            value={value.summary}
          />
        </WdsField>

        <WdsField label="본문">
          <WdsTextArea
            onChange={(event) => updateField('body', event.target.value)}
            required
            value={value.body}
          />
        </WdsField>

        <WdsFormActions
          actions={
            <WdsButton tone="primary" type="submit">
              기록 제출
            </WdsButton>
          }
          helper={message}
        />
      </MemberFormSurface>
    </section>
  );
}

function ShowcasePreviewSection({ showcases }: { showcases: Showcase[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="최근 활동 성과, 회고, 프로젝트 결과를 activity와 분리된 아카이브로 모아 보여줍니다."
        title="쇼케이스"
      />
      {showcases.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {showcases.map((showcase) => (
            <ShowcaseCard key={showcase.id} showcase={showcase} />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>아직 표시할 쇼케이스가 없습니다.</WdsEmptyState>
      )}
    </section>
  );
}

function ChapterRecordSection({ records }: { records: ChapterRecord[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="회고, 리뷰, 기술 노트처럼 Discord보다 오래 남겨야 하는 글을 모아 보여줍니다."
        title="긴 글 기록"
      />
      {records.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {records.map((record) => (
            <ChapterRecordCard key={record.id} record={record} />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>아직 게시된 긴 글 기록이 없습니다.</WdsEmptyState>
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
        description="내가 신청한 활동의 승인 상태와 다음 일정을 별도 목록으로 확인합니다."
        title="내 신청 현황"
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
                    : '일정 미정'}
                </p>
              </div>
              <WdsTextLinkButton
                href={`/activities/${encodeURIComponent(activity.id)}`}
              >
                자세히
              </WdsTextLinkButton>
            </WdsQueueRow>
          ))}
        </WdsQueue>
      ) : (
        <WdsEmptyState>아직 신청 중인 활동이 없습니다.</WdsEmptyState>
      )}
    </section>
  );
}

function ActivitySection({
  activities,
  applicationStates,
  description,
  onApply,
  onCancel,
  title,
}: {
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  description: string;
  onApply?: (activity: Activity) => void;
  onCancel?: (activity: Activity) => void;
  title: string;
}) {
  return (
    <section className="section">
      <WdsSectionHeader description={description} title={title} />
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
        <WdsEmptyState>아직 표시할 활동이 없습니다.</WdsEmptyState>
      )}
    </section>
  );
}

function getAccessPanelTitle(status?: string) {
  switch (status) {
    case 'login_required':
      return '로그인이 필요합니다';
    case 'pending_approval':
      return '운영진 승인 대기 중';
    case 'alumni':
      return 'Alumni 보기 모드';
    case 'active_member':
      return '멤버 홈 이용 가능';
    default:
      return '역할 확인 중';
  }
}

function getApplicationStateLabel(state: ActivityApplicationState) {
  switch (state) {
    case 'applied':
      return '운영진 승인 대기 중';
    case 'approved':
      return '승인됨';
  }
}

function parseCsvTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
