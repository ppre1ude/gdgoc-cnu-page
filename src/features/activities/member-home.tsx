'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Activity } from '@/domain/activity';
import { listHomeActivities } from '@/domain/activity-service';
import { listVisibleActivities } from '@/domain/activity';
import type { ActivityApplicationState } from '@/domain/activity-application';
import {
  applyForActivity,
  cancelApplicationForActivity,
  getApplicationStateByActivity,
} from '@/domain/activity-participation-service';
import { ActivityCard } from '@/components/activity-card';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivityStore } from './browser-activity-store';
import { seedActivities } from './seed-activities';

const demoMemberId = 'demo-member';

export function MemberHome() {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, 'member'),
  );
  const [applicationStates, setApplicationStates] = useState<
    Record<string, ActivityApplicationState>
  >({});

  useEffect(() => {
    void refreshMemberHome();
  }, []);

  async function refreshMemberHome() {
    const [nextActivities, nextApplicationStates] = await Promise.all([
      listHomeActivities(store, 'member'),
      getApplicationStateByActivity(applicationStore, demoMemberId),
    ]);

    setActivities(nextActivities);
    setApplicationStates(nextApplicationStates);
  }

  async function handleApply(activity: Activity) {
    await applyForActivity(applicationStore, {
      activityId: activity.id,
      now: new Date().toISOString(),
      userId: demoMemberId,
    });
    await refreshMemberHome();
  }

  async function handleCancel(activity: Activity) {
    await cancelApplicationForActivity(applicationStore, {
      activityId: activity.id,
      cancellationAllowed: true,
      now: new Date().toISOString(),
      userId: demoMemberId,
    });
    await refreshMemberHome();
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

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Member Home</p>
        <h1 className="page-title">지금 우리 챕터에서 진행 중인 활동</h1>
        <p className="page-lead">
          공지, 이벤트, 스터디, 프로젝트를 한 화면에서 확인하는 멤버용 홈입니다.
          현재 데모는 activity 데이터를 Firebase 또는 localStorage bridge에서 읽습니다.
        </p>

        <div className="grid grid-3" style={{ marginTop: 28 }}>
          <div className="notice">
            <strong>고정 공지</strong>
            <p className="helper-text" style={{ color: '#7a4d00', marginTop: 8 }}>
              Build with AI 데모를 위해 Activity CRUD를 먼저 연결했습니다.
            </p>
          </div>
          <div className="card">
            <span className="badge badge-green">Participation</span>
            <h3>{activeApplicationCount}개 활동 참여 중</h3>
            <p>참여 신청을 누르면 이 숫자와 카드 상태가 바로 바뀝니다.</p>
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
          onApply={handleApply}
          onCancel={handleCancel}
          title="다가오는 활동"
        />
        <ActivitySection
          activities={studiesAndProjects}
          applicationStates={applicationStates}
          description="장기적으로 이어지는 학습과 제작 활동입니다."
          onApply={handleApply}
          onCancel={handleCancel}
          title="스터디 / 프로젝트"
        />
        <ActivitySection
          activities={challenges}
          applicationStates={applicationStates}
          description="챕터 참여를 높이기 위한 챌린지와 친목 활동입니다."
          onApply={handleApply}
          onCancel={handleCancel}
          title="챌린지 / 친목"
        />
      </div>
    </main>
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
  onApply: (activity: Activity) => void;
  onCancel: (activity: Activity) => void;
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
