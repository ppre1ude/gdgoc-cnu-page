'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Activity } from '@/domain/activity';
import { listHomeActivities } from '@/domain/activity-service';
import { listVisibleActivities } from '@/domain/activity';
import type { ActivityApplicationState } from '@/domain/activity-application';
import type { Notice } from '@/domain/notice';
import { listHomeNotices } from '@/domain/notice-service';
import {
  applyForActivity,
  cancelApplicationForActivity,
  getApplicationStateByActivity,
} from '@/domain/activity-participation-service';
import { ActivityCard } from '@/components/activity-card';
import { NoticeBoard } from '@/components/notice-board';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivityStore } from './browser-activity-store';
import { createBrowserNoticeStore } from '../notices/browser-notice-store';
import { seedActivities } from './seed-activities';
import { seedNotices } from '../notices/seed-notices';

const demoMemberId = 'demo-member';

export function MemberHome() {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(() => createBrowserActivityApplicationStore(), []);
  const noticeStore = useMemo(() => createBrowserNoticeStore(), []);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, 'member'),
  );
  const [notices, setNotices] = useState<Notice[]>(
    seedNotices.filter((notice) => notice.status === 'published'),
  );
  const [applicationStates, setApplicationStates] = useState<
    Record<string, ActivityApplicationState>
  >({});

  useEffect(() => {
    void refreshMemberHome();
  }, []);

  async function refreshMemberHome() {
    const [nextActivities, nextApplicationStates, nextNotices] = await Promise.all([
      listHomeActivities(store, 'member'),
      getApplicationStateByActivity(applicationStore, demoMemberId),
      listHomeNotices(noticeStore, 'member'),
    ]);

    setActivities(nextActivities);
    setApplicationStates(nextApplicationStates);
    setNotices(nextNotices);
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

        <section className="section section-compact">
          <div className="section-header">
            <div>
              <h2>공지사항</h2>
              <p>운영진이 고정한 중요한 공지를 먼저 보여줍니다.</p>
            </div>
          </div>
          <NoticeBoard notices={notices.slice(0, 6)} />
        </section>

        <div className="grid grid-3" style={{ marginTop: 28 }}>
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
