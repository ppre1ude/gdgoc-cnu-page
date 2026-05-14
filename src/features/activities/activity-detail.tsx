'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  type Activity,
  type UserRole,
  getActivityRegistrationPolicy,
} from '@/domain/activity';
import type { ActivityApplicationState } from '@/domain/activity-application';
import {
  applyForActivity,
  cancelApplicationForActivity,
  getApplicationStateByActivity,
} from '@/domain/activity-participation-service';
import { getVisibleActivityById } from '@/domain/activity-service';
import {
  demoRoleOptions,
  useAuthSession,
} from '@/features/auth/auth-session-provider';
import {
  WdsBadge,
  WdsButton,
  WdsEmptyState,
  WdsField,
  WdsLinkButton,
  WdsSelect,
  WdsTextLinkButton,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import { describeMemberHomeAccess } from '@/domain/member-access';
import { formatKoreanDateTime } from '@/lib/format-korean-date-time';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivityStore } from './browser-activity-store';

const activityTypeLabel: Record<Activity['type'], string> = {
  event: 'Event',
  study: 'Study',
  project: 'Project',
  challenge: 'Challenge',
  social: 'Social',
};

const visibilityLabel: Record<Activity['visibility'], string> = {
  public: 'Public',
  member: 'Member',
  operator: 'Operator',
};

const applicationStateLabel: Record<ActivityApplicationState, string> = {
  applied: '운영진 승인 대기 중',
  approved: '승인됨',
};

const demoRoleSelectOptions: WdsSelectOption<UserRole>[] = demoRoleOptions.map(
  (role) => ({
    label: role,
    value: role,
  }),
);

export function ActivityDetail({ activityId }: { activityId: string }) {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const {
    isFirebaseConfigured,
    role,
    setDemoRole,
    status,
    userId,
  } = useAuthSession();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [applicationState, setApplicationState] =
    useState<ActivityApplicationState>();
  const [message, setMessage] = useState('활동 정보를 불러오는 중입니다.');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void refreshDetail(role, userId);
  }, [activityId, role, userId]);

  async function refreshDetail(
    currentRole: UserRole = role,
    currentUserId: string | null | undefined = userId,
  ) {
    const nextActivity = await getVisibleActivityById(
      store,
      activityId,
      currentRole,
    );
    const access = describeMemberHomeAccess(currentRole);

    setActivity(nextActivity);
    setIsLoaded(true);

    if (!nextActivity) {
      setApplicationState(undefined);
      setMessage('현재 역할로 열람할 수 없는 활동이거나 삭제된 활동입니다.');
      return;
    }

    if (access.canApplyToActivities && currentUserId) {
      const states = await getApplicationStateByActivity(
        applicationStore,
        currentUserId,
      );
      setApplicationState(states[nextActivity.id]);
    } else {
      setApplicationState(undefined);
    }

    setMessage(access.message);
  }

  async function changeDemoRole(nextRole: UserRole) {
    if (isFirebaseConfigured) {
      return;
    }

    setDemoRole(nextRole);
    await refreshDetail(nextRole, userId);
  }

  async function handleApply() {
    if (!activity || !userId) {
      return;
    }

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
    await refreshDetail();
  }

  async function handleCancel() {
    if (!activity || !userId) {
      return;
    }

    const confirmed = window.confirm(
      '정말 취소하시겠습니까? 승인된 신청을 취소하면 다시 승인을 받아야 합니다.',
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
    await refreshDetail();
  }

  const access = describeMemberHomeAccess(role);
  const registrationPolicy = activity
    ? getActivityRegistrationPolicy(activity)
    : null;
  const canApply =
    Boolean(activity) &&
    access.canApplyToActivities &&
    Boolean(userId) &&
    Boolean(registrationPolicy?.canApplyInternally) &&
    !applicationState;
  const canCancel =
    Boolean(userId) &&
    (applicationState === 'applied' || applicationState === 'approved');

  return (
    <main className="page">
      <div className="container">
        <div className="toolbar section-offset-md">
          <WdsLinkButton href="/member" size="small" tone="secondary">
            Member Home
          </WdsLinkButton>
          <WdsTextLinkButton href="/admin/activities">
            Activity Admin
          </WdsTextLinkButton>
        </div>

        <section className="section section-compact">
          <div className="access-panel">
            <div>
              <div className="badge-row">
                <WdsBadge tone="blue">Activity Detail</WdsBadge>
                <WdsBadge>{status}</WdsBadge>
              </div>
              <h2>{activity ? activity.title : '활동 상세'}</h2>
              <p>{message}</p>
            </div>
            <WdsField className="demo-role-field" label="현재 역할">
              <WdsSelect
                disabled={isFirebaseConfigured}
                onValueChange={(nextRole) => void changeDemoRole(nextRole)}
                options={demoRoleSelectOptions}
                value={role}
              />
            </WdsField>
          </div>
        </section>

        {!isLoaded ? (
          <WdsEmptyState>활동 정보를 불러오는 중입니다.</WdsEmptyState>
        ) : activity && registrationPolicy ? (
          <article className="activity-detail">
            <div className="activity-detail-main">
              <div className="badge-row">
                <WdsBadge tone="blue">
                  {activityTypeLabel[activity.type]}
                </WdsBadge>
                <WdsBadge>{visibilityLabel[activity.visibility]}</WdsBadge>
                <WdsBadge>{registrationPolicy.registrationMode}</WdsBadge>
                {applicationState ? (
                  <WdsBadge tone="green">
                    {applicationStateLabel[applicationState]}
                  </WdsBadge>
                ) : null}
              </div>

              <h1>{activity.title}</h1>
              <p>{activity.summary}</p>

              <dl className="activity-meta-list">
                <div>
                  <dt>일정</dt>
                  <dd>
                    {activity.startsAt
                      ? formatKoreanDateTime(activity.startsAt)
                      : '일정 미정'}
                  </dd>
                </div>
                <div>
                  <dt>등록 방식</dt>
                  <dd>{getRegistrationDescription(registrationPolicy.registrationMode)}</dd>
                </div>
                <div>
                  <dt>공개 범위</dt>
                  <dd>{visibilityLabel[activity.visibility]}</dd>
                </div>
              </dl>
            </div>

            <aside className="activity-detail-side">
              <h2>다음 행동</h2>
              <p className="helper-text">
                공식 Google 행사라면 외부 등록 페이지를 먼저 확인하고, 내부
                참여 추적이 필요한 경우 홈페이지 신청도 함께 사용합니다.
              </p>
              <div className="card-actions">
                {registrationPolicy.externalRegistrationUrl ? (
                  <WdsLinkButton
                    external
                    href={registrationPolicy.externalRegistrationUrl}
                    rel="noreferrer"
                    target="_blank"
                    tone="secondary"
                  >
                    {registrationPolicy.externalRegistrationLabel}
                  </WdsLinkButton>
                ) : null}
                {canApply ? (
                  <WdsButton
                    onClick={handleApply}
                    tone="primary"
                    type="button"
                  >
                    참여 신청
                  </WdsButton>
                ) : null}
                {canCancel ? (
                  <WdsButton
                    onClick={handleCancel}
                    tone="secondary"
                    type="button"
                  >
                    신청 취소
                  </WdsButton>
                ) : null}
              </div>
            </aside>
          </article>
        ) : (
          <WdsEmptyState>
            현재 역할로 열람할 수 없는 활동입니다. 멤버 전용 활동은 승인된
            멤버에게만 표시됩니다.
          </WdsEmptyState>
        )}
      </div>
    </main>
  );
}

function getRegistrationDescription(
  mode: NonNullable<Activity['registrationMode']> | 'internal',
) {
  switch (mode) {
    case 'external':
      return '외부 등록 페이지에서 신청합니다.';
    case 'hybrid':
      return '외부 등록과 홈페이지 내부 신청을 함께 사용합니다.';
    case 'none':
      return '정보 안내용 활동입니다.';
    case 'internal':
      return '홈페이지에서 참여 신청합니다.';
  }
}
