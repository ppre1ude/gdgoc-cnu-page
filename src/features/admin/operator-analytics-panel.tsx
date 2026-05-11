'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ActivityApplication } from '@/domain/activity-application';
import { listApplicationsForActivity } from '@/domain/activity-participation-service';
import { listHomeActivities } from '@/domain/activity-service';
import {
  calculateOperatorAnalytics,
  type OperatorAnalytics,
} from '@/domain/operator-analytics';
import { createBrowserActivityApplicationStore } from '../activities/browser-activity-application-store';
import { createBrowserActivityStore } from '../activities/browser-activity-store';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { seedChapterUsers } from '../users/seed-chapter-users';

const initialAnalytics: OperatorAnalytics = calculateOperatorAnalytics({
  applications: [],
  roleChangeLogs: [],
  users: seedChapterUsers,
});

export function OperatorAnalyticsPanel() {
  const activityStore = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const [analytics, setAnalytics] = useState<OperatorAnalytics>(initialAnalytics);

  useEffect(() => {
    void refreshAnalytics();
  }, []);

  async function refreshAnalytics() {
    const [activities, users, roleChangeLogs] = await Promise.all([
      listHomeActivities(activityStore, 'team_member'),
      userStore.listUsers(),
      userStore.listRoleChangeLogs(),
    ]);
    const applicationsByActivity = await Promise.all(
      activities.map((activity) =>
        listApplicationsForActivity(applicationStore, activity.id),
      ),
    );
    const applications: ActivityApplication[] = applicationsByActivity.flat();

    setAnalytics(
      calculateOperatorAnalytics({
        applications,
        roleChangeLogs,
        users,
      }),
    );
  }

  return (
    <section className="section section-compact">
      <div className="section-header">
        <div>
          <h2>운영 지표</h2>
          <p>현재 데이터에서 바로 계산 가능한 멤버, 승인 대기, 신청 승인 지표입니다.</p>
        </div>
      </div>

      <div className="grid grid-3">
        <AnalyticsCard
          label="Active Members"
          title={`${analytics.activeMemberCount}명 활동 멤버`}
          description="member, team_member, organizer, admin을 포함하고 alumni는 제외합니다."
        />
        <AnalyticsCard
          label="Pending Guests"
          title={`${analytics.pendingGuestCount}명 승인 대기`}
          description="가입했지만 아직 member로 승격되지 않은 guest 계정입니다."
        />
        <AnalyticsCard
          label="Applications"
          title={`${analytics.pendingApplicationCount}건 승인 대기`}
          description={`${analytics.approvedApplicationCount}건은 승인되었고, 취소된 신청은 지표에서 제외합니다.`}
        />
        <AnalyticsCard
          label="Approval Rate"
          title={`${analytics.applicationApprovalRate}% 신청 승인율`}
          description="승인된 신청 / 취소되지 않은 신청 기준으로 계산합니다."
        />
        <AnalyticsCard
          label="Role Logs"
          title={`${analytics.roleChangeLogCount}건 role 변경`}
          description="운영진이 수행한 멤버 승인 또는 역할 변경 이력을 추적합니다."
        />
      </div>
    </section>
  );
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
    <div className="card">
      <span className="badge badge-blue">{label}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
