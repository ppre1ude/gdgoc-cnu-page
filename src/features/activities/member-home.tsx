'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';

import type { Activity, UserRole } from '@/domain/activity';
import { listHomeActivities } from '@/domain/activity-service';
import { listVisibleActivities } from '@/domain/activity';
import type { ActivityApplicationState } from '@/domain/activity-application';
import type { ChapterUser } from '@/domain/chapter-user';
import { submitGuestProfile } from '@/domain/chapter-user-service';
import { describeMemberHomeAccess } from '@/domain/member-access';
import type { Notice } from '@/domain/notice';
import { listVisibleNotices } from '@/domain/notice';
import { listHomeNotices } from '@/domain/notice-service';
import type { Showcase } from '@/domain/showcase';
import { listVisibleShowcases } from '@/domain/showcase';
import { listHomeShowcases } from '@/domain/showcase-service';
import {
  applyForActivity,
  cancelApplicationForActivity,
  getApplicationStateByActivity,
} from '@/domain/activity-participation-service';
import { ActivityCard } from '@/components/activity-card';
import { NoticeBoard } from '@/components/notice-board';
import { ShowcaseCard } from '@/components/showcase-card';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivityStore } from './browser-activity-store';
import { createBrowserNoticeStore } from '../notices/browser-notice-store';
import { createBrowserShowcaseStore } from '../showcases/browser-showcase-store';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { seedActivities } from './seed-activities';
import { seedNotices } from '../notices/seed-notices';
import { seedShowcases } from '../showcases/seed-showcases';

const demoMemberId = 'demo-member';
const demoGuestId = 'demo-guest';
const demoRoleStorageKey = 'gdgoc-cnu.demoRole';
const demoRoleOptions: UserRole[] = [
  'visitor',
  'guest',
  'member',
  'alumni',
  'team_member',
  'organizer',
  'admin',
];

type GuestProfileFormState = {
  displayName: string;
  email: string;
  department: string;
  cohort: string;
  studentId: string;
  interests: string;
  motivation: string;
};

const defaultGuestProfile: GuestProfileFormState = {
  displayName: 'Build with AI Guest',
  email: 'guest.demo@example.com',
  department: '',
  cohort: '',
  studentId: '',
  interests: '',
  motivation: '',
};

export function MemberHome() {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const noticeStore = useMemo(() => createBrowserNoticeStore(), []);
  const showcaseStore = useMemo(() => createBrowserShowcaseStore(), []);
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, 'visitor'),
  );
  const [notices, setNotices] = useState<Notice[]>(
    listVisibleNotices(seedNotices, 'visitor'),
  );
  const [showcases, setShowcases] = useState<Showcase[]>(
    listVisibleShowcases(seedShowcases, 'visitor'),
  );
  const [applicationStates, setApplicationStates] = useState<
    Record<string, ActivityApplicationState>
  >({});
  const [guestProfile, setGuestProfile] =
    useState<GuestProfileFormState>(defaultGuestProfile);
  const [guestProfileMessage, setGuestProfileMessage] = useState(
    '승인에 필요한 정보를 제출하면 운영진 승인 큐에서 바로 확인할 수 있습니다.',
  );

  useEffect(() => {
    const savedRole = window.localStorage.getItem(demoRoleStorageKey);
    const initialRole = isUserRole(savedRole) ? savedRole : 'member';
    setDemoRole(initialRole);
    void refreshMemberHome(initialRole);
    if (initialRole === 'guest') {
      void loadGuestProfile();
    }
  }, []);

  async function refreshMemberHome(role: UserRole = demoRole ?? 'visitor') {
    const access = describeMemberHomeAccess(role);
    const contentRole = getMemberHomeContentRole(role);
    const [
      nextActivities,
      nextApplicationStates,
      nextNotices,
      nextShowcases,
    ] = await Promise.all([
      listHomeActivities(store, contentRole),
      access.canApplyToActivities
        ? getApplicationStateByActivity(applicationStore, demoMemberId)
        : Promise.resolve({}),
      listHomeNotices(noticeStore, contentRole),
      listHomeShowcases(showcaseStore, contentRole),
    ]);

    setActivities(nextActivities);
    setApplicationStates(nextApplicationStates);
    setNotices(nextNotices);
    setShowcases(nextShowcases);
  }

  async function changeDemoRole(nextRole: UserRole) {
    setDemoRole(nextRole);
    window.localStorage.setItem(demoRoleStorageKey, nextRole);
    await refreshMemberHome(nextRole);
    if (nextRole === 'guest') {
      await loadGuestProfile();
    }
  }

  async function loadGuestProfile() {
    const savedGuest = await userStore.findUser(demoGuestId);

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
      userId: demoMemberId,
    });
    await refreshMemberHome();
  }

  async function handleCancel(activity: Activity) {
    const confirmed = window.confirm(
      '정말 취소하시겠습니까? 이 결정은 되돌릴 수 없습니다.',
    );

    if (!confirmed) {
      return;
    }

    await cancelApplicationForActivity(applicationStore, {
      activityId: activity.id,
      cancellationAllowed: true,
      now: new Date().toISOString(),
      userId: demoMemberId,
    });
    await refreshMemberHome();
  }

  async function handleGuestProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await submitGuestProfile(userStore, {
      id: demoGuestId,
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
    await loadGuestProfile();
  }

  const upcoming = activities.filter((activity) => activity.startsAt);
  const studiesAndProjects = activities.filter((activity) =>
    ['study', 'project'].includes(activity.type),
  );
  const challenges = activities.filter((activity) =>
    ['challenge', 'social'].includes(activity.type),
  );
  const activeApplicationCount = Object.values(applicationStates).filter(
    (state) => state === 'applied' || state === 'approved',
  ).length;
  const access = demoRole ? describeMemberHomeAccess(demoRole) : null;
  const canApplyToActivities = Boolean(access?.canApplyToActivities);

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Member Home</p>
        <h1 className="page-title">지금 우리 챕터에서 진행 중인 활동</h1>
        <p className="page-lead">
          공지, 이벤트, 스터디, 프로젝트를 한 화면에서 확인하는 멤버용 홈입니다.
          현재 데모는 activity 데이터를 Firebase 또는 localStorage bridge에서 읽습니다.
        </p>

        <section className="section section-compact">
          <div className="access-panel">
            <div>
              <div className="badge-row">
                <span className="badge badge-blue">Demo Role</span>
                {access ? <span className="badge">{access.status}</span> : null}
              </div>
              <h2>{getAccessPanelTitle(access?.status)}</h2>
              <p>{access?.message ?? '역할 정보를 확인하는 중입니다.'}</p>
            </div>
            <label className="field demo-role-field">
              <span>현재 역할</span>
              <select
                className="select"
                disabled={!demoRole}
                onChange={(event) => void changeDemoRole(event.target.value as UserRole)}
                value={demoRole ?? 'visitor'}
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

        {demoRole === 'guest' ? (
          <GuestProfileForm
            message={guestProfileMessage}
            onChange={setGuestProfile}
            onSubmit={handleGuestProfileSubmit}
            value={guestProfile}
          />
        ) : null}

        <section className="section section-compact">
          <div className="section-header">
            <div>
              <h2>공지사항</h2>
              <p>운영진이 고정한 중요한 공지를 먼저 보여줍니다.</p>
            </div>
          </div>
          <NoticeBoard notices={notices.slice(0, 6)} />
        </section>

        <ShowcasePreviewSection showcases={showcases.slice(0, 3)} />

        <div className="grid grid-3" style={{ marginTop: 28 }}>
          <div className="card">
            <span className="badge badge-green">Participation</span>
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
          </div>
          <div className="card">
            <span className="badge badge-blue">Next Action</span>
            <h3>{activities.length}개 활동 열람 가능</h3>
            <p>Firebase 설정 전에는 localStorage bridge로 같은 흐름을 검증합니다.</p>
          </div>
        </div>

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

function GuestProfileForm({
  message,
  onChange,
  onSubmit,
  value,
}: {
  message: string;
  onChange: (value: GuestProfileFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  value: GuestProfileFormState;
}) {
  function updateField(
    field: keyof GuestProfileFormState,
    nextValue: string,
  ) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <section className="section section-compact">
      <form className="card guest-profile-form" onSubmit={onSubmit}>
        <div>
          <span className="badge badge-green">Guest Profile</span>
          <h2>멤버 승인 요청 정보</h2>
          <p>
            운영진이 guest 계정을 member로 승인하기 전에 확인할 기본 정보를
            제출합니다.
          </p>
        </div>

        <div className="grid grid-2">
          <label className="field">
            <span>이름</span>
            <input
              className="input"
              onChange={(event) => updateField('displayName', event.target.value)}
              required
              value={value.displayName}
            />
          </label>
          <label className="field">
            <span>이메일</span>
            <input
              className="input"
              onChange={(event) => updateField('email', event.target.value)}
              required
              type="email"
              value={value.email}
            />
          </label>
          <label className="field">
            <span>학과</span>
            <input
              className="input"
              onChange={(event) => updateField('department', event.target.value)}
              placeholder="예: 컴퓨터융합학부"
              value={value.department}
            />
          </label>
          <label className="field">
            <span>기수 또는 학년</span>
            <input
              className="input"
              onChange={(event) => updateField('cohort', event.target.value)}
              placeholder="예: 3기, 2학년"
              value={value.cohort}
            />
          </label>
          <label className="field">
            <span>학번</span>
            <input
              className="input"
              onChange={(event) => updateField('studentId', event.target.value)}
              value={value.studentId}
            />
          </label>
          <label className="field">
            <span>관심 분야</span>
            <input
              className="input"
              onChange={(event) => updateField('interests', event.target.value)}
              placeholder="예: Firebase, Gemini, 프론트엔드"
              value={value.interests}
            />
          </label>
        </div>

        <label className="field">
          <span>참여 동기</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField('motivation', event.target.value)}
            placeholder="GDGoC CNU에서 하고 싶은 활동을 적어주세요."
            value={value.motivation}
          />
        </label>

        <div className="form-footer">
          <p className="helper-text">{message}</p>
          <button className="button button-primary" type="submit">
            승인 요청 정보 저장
          </button>
        </div>
      </form>
    </section>
  );
}

function toGuestProfileForm(user: ChapterUser): GuestProfileFormState {
  return {
    cohort: user.cohort ?? '',
    department: user.department ?? '',
    displayName: user.displayName,
    email: user.email,
    interests: user.interests ?? '',
    motivation: user.motivation ?? '',
    studentId: user.studentId ?? '',
  };
}

function ShowcasePreviewSection({ showcases }: { showcases: Showcase[] }) {
  return (
    <section className="section section-compact">
      <div className="section-header">
        <div>
          <h2>쇼케이스</h2>
          <p>
            최근 활동 성과, 회고, 프로젝트 결과를 activity와 분리된 아카이브로
            모아 보여줍니다.
          </p>
        </div>
      </div>
      {showcases.length > 0 ? (
        <div className="grid grid-3">
          {showcases.map((showcase) => (
            <ShowcaseCard key={showcase.id} showcase={showcase} />
          ))}
        </div>
      ) : (
        <div className="empty">아직 표시할 쇼케이스가 없습니다.</div>
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
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {activities.length > 0 ? (
        <div className="grid grid-3">
          {activities.map((activity) => (
            <ActivityCard
              activity={activity}
              applicationState={applicationStates[activity.id]}
              key={activity.id}
              onApply={onApply}
              onCancel={onCancel}
            />
          ))}
        </div>
      ) : (
        <div className="empty">아직 표시할 활동이 없습니다.</div>
      )}
    </section>
  );
}

function getMemberHomeContentRole(role: UserRole): UserRole {
  if (role === 'visitor' || role === 'guest') {
    return role;
  }

  return 'member';
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

function isUserRole(value: string | null): value is UserRole {
  return demoRoleOptions.includes(value as UserRole);
}
