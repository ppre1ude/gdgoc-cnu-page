'use client';

import type { UserRole } from '@/domain/activity';
import {
  WdsButton,
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
  const {
    displayName,
    email,
    errorMessage,
    isFirebaseConfigured,
    role,
    setDemoRole,
    signInWithGoogle,
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
    <WdsButton
      onClick={signInWithGoogle}
      size="small"
      tone="ghost"
      type="button"
    >
      {errorMessage ? 'Auth 재시도' : 'Google 로그인'}
    </WdsButton>
  );
}
