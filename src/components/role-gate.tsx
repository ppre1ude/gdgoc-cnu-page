'use client';

import type { ReactNode } from 'react';

import { WdsNotice } from '@/components/wds-form-controls';
import {
  WdsOffset,
  WdsPageHeader,
} from '@/components/wds-layout-primitives';
import type { UserRole } from '@/domain/activity';
import { koreanCopy } from '@/domain/korean-copy';
import { isRoleAllowed } from '@/domain/role-access-policy';
import { useAuthSession } from '@/features/auth/auth-session-provider';

export function RoleGate({
  allowedRoles,
  children,
  description = koreanCopy.roleGate.defaultDescription,
  title = koreanCopy.roleGate.defaultTitle,
}: {
  allowedRoles: readonly UserRole[];
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
            description={koreanCopy.roleGate.loadingDescription}
            eyebrow="Access"
            title={koreanCopy.roleGate.loadingTitle}
          />
        </div>
      </main>
    );
  }

  if (!isRoleAllowed(role, allowedRoles)) {
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
              <strong>
                {koreanCopy.roleGate.currentRoleLabel}: {role}
              </strong>
              <WdsOffset offset="xs">
                <p className="helper-text helper-text-caution">
                  {isFirebaseConfigured
                    ? koreanCopy.roleGate.liveAccessNotice
                    : koreanCopy.roleGate.demoAccessNotice}
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
