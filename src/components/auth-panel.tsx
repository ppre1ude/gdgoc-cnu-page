'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import type { UserRole } from '@/domain/activity';
import { getRouteLoginHref } from '@/domain/auth-flow';
import {
  WdsButton,
  WdsLinkButton,
  WdsSelect,
  type WdsSelectOption,
} from '@/components/wds-form-controls';
import {
  demoRoleOptions,
  useAuthSession,
} from '@/features/auth/auth-session-provider';

const demoRoleSelectOptions = demoRoleOptions.map((option) => ({
  label: option,
  value: option,
})) satisfies WdsSelectOption<UserRole>[];

export function AuthPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    displayName,
    email,
    isFirebaseConfigured,
    role,
    setDemoRole,
    signOutCurrentUser,
    status,
  } = useAuthSession();

  if (!isFirebaseConfigured) {
    return (
      <div className="auth-role-control">
        <span className="auth-pill">Demo role</span>
        <WdsSelect
          aria-label="Demo role"
          height={32}
          onValueChange={setDemoRole}
          options={demoRoleSelectOptions}
          value={role}
          width="160px"
        />
      </div>
    );
  }

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
