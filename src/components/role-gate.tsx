'use client';

import type { ReactNode } from 'react';

import type { UserRole } from '@/domain/activity';
import { useAuthSession } from '@/features/auth/auth-session-provider';

export function RoleGate({
  allowedRoles,
  children,
  description = '현재 역할로는 이 화면에 접근할 수 없습니다.',
  title = '권한이 필요합니다',
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
  description?: string;
  title?: string;
}) {
  const { role, status } = useAuthSession();

  if (status === 'loading') {
    return (
      <main className="page">
        <div className="container">
          <p className="eyebrow">Access</p>
          <h1 className="page-title">권한 확인 중</h1>
          <p className="page-lead">로그인 상태와 챕터 역할을 불러오고 있습니다.</p>
        </div>
      </main>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <main className="page">
        <div className="container">
          <p className="eyebrow">Access Denied</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-lead">{description}</p>
          <section className="section section-compact">
            <div className="notice">
              <strong>현재 역할: {role}</strong>
              <p className="helper-text" style={{ color: '#7a4d00', marginTop: 8 }}>
                데모 환경에서는 상단의 Demo role 선택으로 권한별 화면을 확인할 수 있습니다.
                실제 배포에서는 Firebase Auth와 저장된 사용자 역할을 기준으로 보호합니다.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return children;
}
