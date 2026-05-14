'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ActivityApplication } from '@/domain/activity-application';
import type { ActivitySession, SessionAttendance } from '@/domain/activity-session';
import { loadOrSyncDefaultActivitySession } from '@/domain/activity-session';
import { listApplicationsForActivity } from '@/domain/activity-participation-service';
import { listHomeActivities } from '@/domain/activity-service';
import type { Activity, ActivityType } from '@/domain/activity';
import {
  calculateOperatorAnalytics,
  type ActivityParticipationFunnel,
  type ActivityTypeAttendanceRate,
  type LowParticipationMember,
  type OperatorAnalytics,
} from '@/domain/operator-analytics';
import { WdsBadge } from '@/components/wds-form-controls';
import {
  WdsSectionHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { createBrowserActivityApplicationStore } from '../activities/browser-activity-application-store';
import { createBrowserActivitySessionStore } from '../activities/browser-activity-session-store';
import { createBrowserActivityStore } from '../activities/browser-activity-store';
import { createBrowserSessionAttendanceStore } from '../activities/browser-session-attendance-store';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { seedChapterUsers } from '../users/seed-chapter-users';

const initialAnalytics: OperatorAnalytics = calculateOperatorAnalytics({
  applications: [],
  roleChangeLogs: [],
  users: seedChapterUsers,
});

const activityTypeLabel: Record<ActivityType, string> = {
  event: '이벤트',
  study: '스터디',
  project: '프로젝트',
  challenge: '챌린지',
  social: '친목',
};

export function OperatorAnalyticsPanel() {
  const { role } = useAuthSession();
  const activityStore = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const sessionStore = useMemo(() => createBrowserActivitySessionStore(), []);
  const attendanceStore = useMemo(() => createBrowserSessionAttendanceStore(), []);
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const [analytics, setAnalytics] = useState<OperatorAnalytics>(initialAnalytics);

  useEffect(() => {
    void refreshAnalytics();
  }, [role]);

  async function refreshAnalytics() {
    const [activities, users, roleChangeLogs] = await Promise.all([
      listHomeActivities(activityStore, role),
      userStore.listUsers(),
      userStore.listRoleChangeLogs(),
    ]);
    const applicationsByActivity = await Promise.all(
      activities.map((activity) =>
        listApplicationsForActivity(applicationStore, activity.id),
      ),
    );
    const sessions = (
      await Promise.all(
        activities.map((activity) => loadDefaultSessionForActivity(activity)),
      )
    ).filter((session): session is ActivitySession => Boolean(session));
    const attendancesBySession = await Promise.all(
      sessions.map((session) => attendanceStore.listBySession(session.id)),
    );
    const applications: ActivityApplication[] = applicationsByActivity.flat();
    const sessionAttendances: SessionAttendance[] = attendancesBySession.flat();

    setAnalytics(
      calculateOperatorAnalytics({
        activities,
        activityCapacityById: getDemoActivityCapacityById(activities),
        applications,
        activitySessions: sessions,
        now: new Date().toISOString(),
        roleChangeLogs,
        sessionAttendances,
        users,
      }),
    );
  }

  async function loadDefaultSessionForActivity(activity: Activity) {
    return loadOrSyncDefaultActivitySession(sessionStore, activity);
  }

  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="신청, 승인, 세션 출석 데이터를 합쳐 참여율과 미참석 위험을 운영진 관점에서 확인합니다."
        title="운영 지표"
      />

      <div className="grid grid-3">
        <AnalyticsCard
          description="member, team_member, organizer, admin을 포함하고 alumni는 제외합니다."
          label="Active Members"
          title={`${analytics.activeMemberCount}명 활동 멤버`}
        />
        <AnalyticsCard
          description="아직 member로 승격되지 않은 guest 계정입니다."
          label="Pending Guests"
          title={`${analytics.pendingGuestCount}명 승인 대기`}
        />
        <AnalyticsCard
          description={`${analytics.approvedApplicationCount}건 승인, ${analytics.pendingApplicationCount}건 승인 대기 상태입니다.`}
          label="Applications"
          title={`${analytics.applicationApprovalRate}% 신청 승인률`}
        />
        <AnalyticsCard
          description={`${analytics.attendanceOpportunityCount}건의 승인된 참여 기회 중 ${analytics.attendedSessionCount}건이 출석 처리되었습니다.`}
          label="Recent Attendance"
          title={`${analytics.recentAttendanceRate}% 최근 참석률`}
        />
        <AnalyticsCard
          description="최근 30일 안에 종료된 세션만 운영 참여율 denominator에 넣습니다."
          label="Ended Sessions"
          title={`${analytics.recentEndedSessionCount}개 종료 세션`}
        />
        <AnalyticsCard
          description="출석 기록이 없는 승인자를 저장된 absent 상태 없이 파생 계산합니다."
          label="Derived Absence"
          title={`${analytics.derivedAbsentSessionCount}건 미참석 추정`}
        />
        <AnalyticsCard
          description="다가오는 활동별 active member 신청 비율입니다. 취소된 신청과 alumni는 제외합니다."
          label="Upcoming Demand"
          title={`${analytics.upcomingActivityApplicationRate}% 신청률`}
        />
        <AnalyticsCard
          description="활동별 데모 capacity 대비 신청/승인된 active member 비율입니다."
          label="Capacity Fill"
          title={`${analytics.upcomingActivityCapacityFillRate}% 충원율`}
        />
      </div>

      <div className="analytics-dashboard-grid">
        <ActivityFunnels funnels={analytics.activityFunnels} />
        <div className="stack">
          <ActivityTypeRates rates={analytics.activityTypeAttendanceRates} />
          <LowParticipationList members={analytics.lowParticipationMembers} />
        </div>
      </div>
    </section>
  );
}

function getDemoActivityCapacityById(activities: Activity[]) {
  return Object.fromEntries(
    activities
      .filter((activity) => activity.startsAt)
      .map((activity) => [activity.id, getDemoCapacityByType(activity.type)]),
  );
}

function getDemoCapacityByType(type: ActivityType) {
  switch (type) {
    case 'event':
      return 30;
    case 'study':
      return 12;
    case 'project':
      return 8;
    case 'challenge':
      return 40;
    case 'social':
      return 20;
  }
}

function AnalyticsCard({
  description,
  label,
  title,
}: {
  description: string;
  label: string;
  title: string;
}) {
  return (
    <WdsSurfaceCard>
      <WdsBadge tone="blue">{label}</WdsBadge>
      <h3>{title}</h3>
      <p>{description}</p>
    </WdsSurfaceCard>
  );
}

function ActivityFunnels({
  funnels,
}: {
  funnels: ActivityParticipationFunnel[];
}) {
  return (
    <WdsSurfaceCard>
      <WdsBadge tone="green">Activity Funnel</WdsBadge>
      <h3>활동별 참여 흐름</h3>
      {funnels.length > 0 ? (
        <div className="analytics-list">
          {funnels.map((funnel) => (
            <article className="analytics-row" key={funnel.activityId}>
              <div>
                <strong>{funnel.title}</strong>
                <p>
                  {activityTypeLabel[funnel.type]} ·{' '}
                  {funnel.hasEnded ? '종료됨' : '예정/진행 중'}
                </p>
              </div>
              <div className="analytics-metrics">
                <span>신청 {funnel.appliedCount}</span>
                <span>승인 {funnel.approvedCount}</span>
                <span>참석 {funnel.attendedCount}</span>
                <span>미참석 {funnel.derivedAbsentCount}</span>
                <span>{funnel.attendanceRate}%</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="helper-text section-offset-sm">
          일정이 있는 activity가 생기면 활동별 funnel이 표시됩니다.
        </p>
      )}
    </WdsSurfaceCard>
  );
}

function ActivityTypeRates({
  rates,
}: {
  rates: ActivityTypeAttendanceRate[];
}) {
  return (
    <WdsSurfaceCard>
      <WdsBadge tone="blue">Type Rates</WdsBadge>
      <h3>유형별 참석률</h3>
      {rates.length > 0 ? (
        <div className="analytics-list">
          {rates.map((rate) => (
            <div className="analytics-rate-row" key={rate.type}>
              <div>
                <strong>{activityTypeLabel[rate.type]}</strong>
                <p>
                  참석 {rate.attendedCount} / 승인 {rate.approvedCount}
                </p>
              </div>
              <div className="analytics-rate">
                <span>{rate.attendanceRate}%</span>
                <div className="analytics-meter" aria-hidden="true">
                  <div
                    className="analytics-meter-fill"
                    style={{ width: `${rate.attendanceRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="helper-text section-offset-sm">
          종료된 세션의 승인/출석 데이터가 쌓이면 유형별 참석률이 표시됩니다.
        </p>
      )}
    </WdsSurfaceCard>
  );
}

function LowParticipationList({
  members,
}: {
  members: LowParticipationMember[];
}) {
  return (
    <WdsSurfaceCard>
      <WdsBadge>Follow-up</WdsBadge>
      <h3>낮은 참여 멤버</h3>
      {members.length > 0 ? (
        <div className="analytics-list">
          {members.map((member) => (
            <div className="analytics-row" key={member.userId}>
              <div>
                <strong>{member.displayName}</strong>
                <p>{member.userId}</p>
              </div>
              <div className="analytics-metrics">
                <span>참석 {member.attendedCount}</span>
                <span>미참석 {member.absentCount}</span>
                <span>{member.attendanceRate}%</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="helper-text section-offset-sm">
          최근 종료 세션에서 반복 미참석이 감지된 활동 멤버가 없습니다.
        </p>
      )}
    </WdsSurfaceCard>
  );
}
