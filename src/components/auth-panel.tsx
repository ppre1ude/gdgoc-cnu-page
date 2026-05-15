'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { getRouteLoginHref } from '@/domain/auth-flow';
import {
  WdsButton,
  WdsLinkButton,
} from '@/components/wds-form-controls';
import { useAuthSession } from '@/features/auth/auth-session-provider';

export function AuthPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    displayName,
    email,
    signOutCurrentUser,
    status,
  } = useAuthSession();

  if (status === 'loading') {
    return <span className="auth-pill">Auth 확인 중</span>;
  }

  if (status === 'signed_in') {
    return (
      <WdsButton
        onClick={signOutCurrentUser}
        size="small"
        tone="ghost"
        type="button"
      >
        {displayName ?? email ?? '로그아웃'}
      </WdsButton>
    );
  }

  return (
    <WdsLinkButton
      href={getRouteLoginHref(pathname, searchParams)}
      size="small"
      tone="ghost"
    >
      Google 로그인
    </WdsLinkButton>
  );
}
