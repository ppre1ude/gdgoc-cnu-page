import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDemoEnvironmentReadiness } from './demo-environment.ts';

describe('demo environment readiness', () => {
  it('marks demo bridge as ready when Firebase is not configured', () => {
    const readiness = createDemoEnvironmentReadiness({
      authStatus: 'demo',
      firebaseConfigured: false,
      geminiConfigured: false,
    });

    assert.equal(readiness.overallStatus, 'demo_ready');
    assert.deepEqual(
      readiness.items.map((item) => ({
        id: item.id,
        status: item.status,
      })),
      [
        { id: 'firebase', status: 'action_needed' },
        { id: 'auth', status: 'demo_ready' },
        { id: 'gemini', status: 'fallback_ready' },
      ],
    );
    assert.deepEqual(readiness.requiredActions, [
      'Firebase Web app config를 .env.local에 추가하면 Firestore/Auth 실제 연결로 전환됩니다.',
      'GEMINI_API_KEY를 추가하면 AI 작성 보조가 local fallback 대신 Gemini를 호출합니다.',
    ]);
  });

  it('marks the environment as live ready when Firebase and Gemini are configured', () => {
    const readiness = createDemoEnvironmentReadiness({
      authStatus: 'signed_in',
      firebaseConfigured: true,
      geminiConfigured: true,
    });

    assert.equal(readiness.overallStatus, 'live_ready');
    assert.deepEqual(readiness.requiredActions, []);
  });

  it('keeps Firebase in warning state until a configured Auth user signs in', () => {
    const readiness = createDemoEnvironmentReadiness({
      authStatus: 'signed_out',
      firebaseConfigured: true,
      geminiConfigured: true,
    });

    assert.equal(readiness.overallStatus, 'needs_attention');
    assert.equal(readiness.items[1]?.status, 'action_needed');
    assert.deepEqual(readiness.requiredActions, [
      'Firebase Auth Google 로그인을 완료해야 실제 사용자/역할 흐름을 검증할 수 있습니다.',
    ]);
  });
});
