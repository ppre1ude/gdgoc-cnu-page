import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getLegacyJoinRedirectHref,
  getLoginHref,
  getPublicOnboardingHref,
  getRouteLoginHref,
  resolveSafeNextPath,
} from './auth-flow.ts';

describe('auth flow routing', () => {
  it('sends public onboarding CTAs to the single Google login flow', () => {
    assert.equal(getPublicOnboardingHref(), '/login?next=%2Fmember');
  });

  it('builds a Google login screen href with a safe next path', () => {
    assert.equal(getLoginHref('/member'), '/login?next=%2Fmember');
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

  it('keeps legacy join URLs compatible by redirecting to the login flow', () => {
    assert.equal(getLegacyJoinRedirectHref(), '/login?next=%2Fmember');
  });
});
