import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getJoinFlowState,
  getLoginHref,
  getPublicJoinHref,
  getRouteLoginHref,
  resolveSafeNextPath,
} from './auth-flow.ts';

describe('auth flow routing', () => {
  it('sends public join CTAs to the join screen before member home', () => {
    assert.equal(getPublicJoinHref(), '/join');
  });

  it('builds a Google login screen href with a safe next path', () => {
    assert.equal(getLoginHref('/member'), '/login?next=%2Fmember');
    assert.equal(getLoginHref('/join'), '/login?next=%2Fjoin');
  });

  it('builds global login links that preserve the current safe route', () => {
    assert.equal(
      getRouteLoginHref(
        '/admin/activities',
        new URLSearchParams({ tab: 'drafts' }),
      ),
      '/login?next=%2Fadmin%2Factivities%3Ftab%3Ddrafts',
    );
  });

  it('does not use the login screen itself as the post-login destination', () => {
    assert.equal(
      getRouteLoginHref('/login', new URLSearchParams({ next: '/admin' })),
      '/login?next=%2Fmember',
    );
  });

  it('falls back to member home for unsafe or empty next paths', () => {
    assert.equal(resolveSafeNextPath('https://example.com'), '/member');
    assert.equal(resolveSafeNextPath('//example.com/member'), '/member');
    assert.equal(resolveSafeNextPath('member'), '/member');
    assert.equal(resolveSafeNextPath(null), '/member');
  });

  it('marks the no-Firebase demo join entry as needing guest mode first', () => {
    assert.equal(
      getJoinFlowState({
        isFirebaseConfigured: false,
        role: 'team_member',
        status: 'demo',
      }),
      'demo_guest_required',
    );
  });

  it('shows the join profile form for signed-in or demo guests', () => {
    assert.equal(
      getJoinFlowState({
        isFirebaseConfigured: true,
        role: 'guest',
        status: 'signed_in',
      }),
      'profile',
    );
    assert.equal(
      getJoinFlowState({
        isFirebaseConfigured: false,
        role: 'guest',
        status: 'demo',
      }),
      'profile',
    );
  });
});
