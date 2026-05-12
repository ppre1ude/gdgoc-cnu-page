'use client';

import Link from 'next/link';

import { getAdminNavigationItems } from '@/domain/navigation';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { MemberApprovalPanel } from './member-approval-panel';
import { OperatorAnalyticsPanel } from './operator-analytics-panel';

export function AdminDashboard() {
  const { role } = useAuthSession();
  const adminItems = getAdminNavigationItems(role);

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Operator Dashboard</p>
        <h1 className="page-title">Admin</h1>
        <p className="page-lead">
          운영진이 활동과 공지사항을 등록하고, 멤버 홈에 반영되는 흐름을
          확인하는 데모 대시보드입니다. 최종 버전에서는 권한이 있는 운영진에게만
          노출됩니다.
        </p>

        <section className="section section-compact">
          <div className="section-header">
            <div>
              <h2>운영 도구</h2>
              <p>
                상단바에는 Admin 하나만 노출하고, 세부 운영 도구는 이 화면에서
                선택합니다.
              </p>
            </div>
          </div>
          <div className="grid grid-2">
            {adminItems.map((item) => (
              <Link className="card admin-tool-card" href={item.href} key={item.href}>
                <span className="badge badge-blue">Admin Tool</span>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
                <span className="admin-tool-link">열기</span>
              </Link>
            ))}
          </div>
        </section>

        <OperatorAnalyticsPanel />

        <MemberApprovalPanel />

        <section className="section section-compact">
          <div className="notice">
            <strong>Demo mode</strong>
            <p className="helper-text" style={{ color: '#7a4d00', marginTop: 8 }}>
              현재는 발표 접근성을 위해 Admin 진입점을 노출합니다. Firebase Auth와
              역할 판별 흐름이 붙으면 team_member, organizer, admin 권한으로
              보호합니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
