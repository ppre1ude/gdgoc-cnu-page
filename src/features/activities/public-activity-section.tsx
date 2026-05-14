'use client';

import { useEffect, useMemo, useState } from 'react';

import { ActivityCard } from '@/components/activity-card';
import { listVisibleActivities, type Activity } from '@/domain/activity';
import { listPublicHomeActivities } from '@/domain/activity-service';
import { createBrowserActivityStore } from './browser-activity-store';
import { seedActivities } from './seed-activities';

export function PublicActivitySection() {
  const store = useMemo(() => createBrowserActivityStore(), []);
  const [activities, setActivities] = useState<Activity[]>(
    listVisibleActivities(seedActivities, 'visitor'),
  );

  useEffect(() => {
    let isCancelled = false;

    void listPublicHomeActivities(store).then((nextActivities) => {
      if (!isCancelled) {
        setActivities(nextActivities);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [store]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Public Activities</h2>
            <p>
              외부 방문자에게 공개할 수 있는 최근 활동과 캠페인입니다. 운영진이
              public activity를 저장하면 이 영역에도 반영됩니다.
            </p>
          </div>
        </div>
        {activities.length > 0 ? (
          <div className="grid grid-3">
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        ) : (
          <div className="empty">아직 공개된 활동이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
