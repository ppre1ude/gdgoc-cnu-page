'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Activity } from '@/domain/activity';
import { listHomeActivities } from '@/domain/activity-service';
import { listVisibleActivities } from '@/domain/activity';
import { ActivityCard } from '@/components/activity-card';
import { createBrowserActivityStore } from './browser-activity-store';
import { seedActivities } from './seed-activities';

export function MemberHome() {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, 'member'),
  );

  useEffect(() => {
    void listHomeActivities(store, 'member').then(setActivities);
  }, [store]);

  const upcoming = activities.filter((activity) => activity.startsAt);
  const studiesAndProjects = activities.filter((activity) =>
    ['study', 'project'].includes(activity.type),
  );
  const challenges = activities.filter((activity) =>
    ['challenge', 'social'].includes(activity.type),
  );

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
            <h3>{activities.length}개 활동 열람 가능</h3>
            <p>운영진이 등록한 공개/멤버 활동을 기준으로 표시합니다.</p>
          </div>
          <div className="card">
            <span className="badge badge-blue">Next Action</span>
            <h3>관심 활동 확인</h3>
            <p>참여 신청과 승인 흐름은 다음 vertical slice에서 연결합니다.</p>
          </div>
        </div>

        <ActivitySection
          activities={upcoming}
          description="오프라인 이벤트와 일정이 있는 활동을 우선 표시합니다."
          title="다가오는 활동"
        />
        <ActivitySection
          activities={studiesAndProjects}
          description="장기적으로 이어지는 학습과 제작 활동입니다."
          title="스터디 / 프로젝트"
        />
        <ActivitySection
          activities={challenges}
          description="챕터 참여를 높이기 위한 챌린지와 친목 활동입니다."
          title="챌린지 / 친목"
        />
      </div>
    </main>
  );
}

function ActivitySection({
  activities,
  description,
  title,
}: {
  activities: Activity[];
  description: string;
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
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </div>
      ) : (
        <div className="empty">아직 표시할 활동이 없습니다.</div>
      )}
    </section>
  );
}
