'use client';

import type { UserRole } from '@/domain/activity';
import {
  demoRoleOptions,
  useAuthSession,
} from '@/features/auth/auth-session-provider';

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
      <label className="auth-role-control">
        <span className="auth-pill">Demo role</span>
        <select
          className="auth-role-select"
          onChange={(event) => setDemoRole(event.target.value as UserRole)}
          value={role}
        >
          {demoRoleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (status === 'loading') {
    return <span className="auth-pill">Auth 확인 중</span>;
  }

  if (status === 'signed_in') {
    return (
      <button
        className="auth-pill auth-button"
        onClick={signOutCurrentUser}
        type="button"
      >
        {displayName ?? email ?? '로그아웃'}
      </button>
    );
  }

  return (
    <button className="auth-pill auth-button" onClick={signInWithGoogle} type="button">
      {errorMessage ? 'Auth 재시도' : 'Google 로그인'}
    </button>
  );
}
