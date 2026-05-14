'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  createDemoEnvironmentReadiness,
  type DemoEnvironmentItem,
} from '@/domain/demo-environment';
import { useAuthSession } from '@/features/auth/auth-session-provider';

type EnvironmentStatusResponse = {
  firebaseConfigured: boolean;
  geminiConfigured: boolean;
  geminiModel: string;
  missingFirebaseKeys: string[];
};

const initialEnvironmentStatus: EnvironmentStatusResponse = {
  firebaseConfigured: false,
  geminiConfigured: false,
  geminiModel: 'gemini-2.0-flash',
  missingFirebaseKeys: [],
};

const statusLabels: Record<DemoEnvironmentItem['status'], string> = {
  action_needed: '설정 필요',
  demo_ready: 'Demo 준비됨',
  fallback_ready: 'Fallback 준비됨',
  ready: 'Live 준비됨',
};

const overallLabels = {
  demo_ready: 'Demo bridge로 발표 가능',
  live_ready: '실제 Firebase/Gemini 연결 준비됨',
  needs_attention: '실제 데모 전 확인 필요',
};

export function DemoEnvironmentPanel() {
  const { status } = useAuthSession();
  const [environmentStatus, setEnvironmentStatus] = useState(
    initialEnvironmentStatus,
  );

  useEffect(() => {
    let isCancelled = false;

    void fetch('/api/environment/status')
      .then((response) => response.json() as Promise<EnvironmentStatusResponse>)
      .then((payload) => {
        if (!isCancelled) {
          setEnvironmentStatus(payload);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setEnvironmentStatus(initialEnvironmentStatus);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const readiness = useMemo(
    () =>
      createDemoEnvironmentReadiness({
        authStatus: status,
        firebaseConfigured: environmentStatus.firebaseConfigured,
        geminiConfigured: environmentStatus.geminiConfigured,
      }),
    [environmentStatus.firebaseConfigured, environmentStatus.geminiConfigured, status],
  );

  return (
    <section className="section section-compact">
      <div className="section-header">
        <div>
          <h2>Demo Environment</h2>
          <p>
            발표 전에 Firebase, Auth, Gemini 연결 상태를 값 노출 없이 확인합니다.
          </p>
        </div>
        <span className="badge badge-blue">
          {overallLabels[readiness.overallStatus]}
        </span>
      </div>

      <div className="grid grid-3">
        {readiness.items.map((item) => (
          <article className="card" key={item.id}>
            <span className={getBadgeClassName(item.status)}>
              {statusLabels[item.status]}
            </span>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="notice" style={{ marginTop: 16 }}>
        <strong>다음 준비물</strong>
        {readiness.requiredActions.length > 0 ? (
          <ul className="helper-list">
            {readiness.requiredActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
            {environmentStatus.missingFirebaseKeys.length > 0 ? (
              <li>
                Firebase 누락 환경 변수:{' '}
                {environmentStatus.missingFirebaseKeys.join(', ')}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="helper-text" style={{ color: '#7a4d00', marginTop: 8 }}>
            필수 환경 설정이 준비되어 있습니다. 현재 Gemini 모델은{' '}
            {environmentStatus.geminiModel}입니다.
          </p>
        )}
      </div>
    </section>
  );
}

function getBadgeClassName(status: DemoEnvironmentItem['status']) {
  if (status === 'ready' || status === 'demo_ready') {
    return 'badge badge-green';
  }

  if (status === 'fallback_ready') {
    return 'badge badge-blue';
  }

  return 'badge';
}
