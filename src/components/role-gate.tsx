'use client';

import type { ReactNode } from 'react';

import { WdsNotice } from '@/components/wds-form-controls';
import {
  WdsOffset,
  WdsPageHeader,
} from '@/components/wds-layout-primitives';
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
  const { isFirebaseConfigured, role, status } = useAuthSession();

  if (status === 'loading') {
    return (
      <main className="page">
        <div className="container">
          <WdsPageHeader
            description="로그인 상태와 챕터 역할을 불러오고 있습니다."
            eyebrow="Access"
            title="권한 확인 중"
          />
        </div>
      </main>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <main className="page">
        <div className="container">
          <WdsPageHeader
            description={description}
            eyebrow="Access Denied"
            title={title}
          />
          <section className="section section-compact">
            <WdsNotice>
              <strong>현재 역할: {role}</strong>
              <WdsOffset offset="xs">
                <p className="helper-text helper-text-caution">
                  {isFirebaseConfigured
                    ? '실제 배포 환경에서는 Firebase Auth 로그인과 저장된 사용자 역할을 기준으로 접근을 보호합니다. 권한이 필요하면 운영진에게 역할 승인을 요청하세요.'
                    : '데모 환경에서는 상단의 Demo role 선택으로 권한별 화면을 확인할 수 있습니다.'}
                </p>
              </WdsOffset>
            </WdsNotice>
          </section>
        </div>
      </main>
    );
  }

  return children;
}
