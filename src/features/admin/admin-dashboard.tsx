'use client';

import Link from 'next/link';
import { Typography } from '@wanteddev/wds';

import {
  WdsBadgeGroup,
  WdsPageHeader,
  WdsResponsiveGrid,
  WdsSectionHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { WdsBadge, WdsNotice } from '@/components/wds-form-controls';
import {
  adminDashboardSections,
  getAdminDashboardSectionHref,
  type AdminDashboardSection,
  type AdminDashboardSectionId,
} from '@/domain/admin-dashboard-sections';
import { getAdminNavigationItems } from '@/domain/navigation';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { DemoEnvironmentPanel } from './demo-environment-panel';
import { DemoSeedPanel } from './demo-seed-panel';
import { MemberApprovalPanel } from './member-approval-panel';
import { OperatorAnalyticsPanel } from './operator-analytics-panel';

const adminToolCardSx = {
  transition:
    'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
  '&:hover, &:focus-visible': {
    borderColor: 'rgb(var(--semantic-primary-normal-rgb) / 0.36)',
    boxShadow: 'var(--shadow)',
    transform: 'translateY(-1px)',
  },
};

const adminToolLinkSx = {
  color: 'var(--primary)',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 800,
  marginTop: '16px',
};

type AdminDashboardProps = {
  initialSectionId?: AdminDashboardSectionId;
};

export function AdminDashboard({
  initialSectionId = 'overview',
}: AdminDashboardProps) {
  const { role } = useAuthSession();
  const adminItems = getAdminNavigationItems(role);
  const selectedSection =
    adminDashboardSections.find((section) => section.id === initialSectionId) ??
    adminDashboardSections[0];

  return (
    <main className="page">
      <div className="container operator-dashboard-container">
        <WdsPageHeader
          description="운영진이 활동과 공지사항을 등록하고, 멤버 홈에 반영되는 흐름을 확인하는 데모 대시보드입니다. 최종 버전에서는 권한이 있는 운영진에게만 노출됩니다."
          eyebrow="Operator Dashboard"
          title="Admin"
        />

        <div className="operator-dashboard-shell">
          <AdminDashboardSidebar
            adminToolCount={adminItems.length}
            selectedSectionId={selectedSection.id}
          />

          <div className="operator-dashboard-content">
            {selectedSection.id === 'overview' ? (
              <AdminOverviewSection adminItems={adminItems} />
            ) : null}
            {selectedSection.id === 'environment' ? (
              <DemoEnvironmentPanel />
            ) : null}
            {selectedSection.id === 'seed' ? <DemoSeedPanel /> : null}
            {selectedSection.id === 'analytics' ? (
              <OperatorAnalyticsPanel />
            ) : null}
            {selectedSection.id === 'approvals' ? (
              <MemberApprovalPanel />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminDashboardSidebar({
  adminToolCount,
  selectedSectionId,
}: {
  adminToolCount: number;
  selectedSectionId: AdminDashboardSectionId;
}) {
  const counts: Partial<Record<AdminDashboardSectionId, string>> = {
    overview: `${adminToolCount}개`,
  };

  return (
    <aside className="operator-dashboard-sidebar">
      <div className="operator-sidebar-status">
        <WdsBadgeGroup>
          <WdsBadge tone="blue">Admin</WdsBadge>
          <WdsBadge>Operator</WdsBadge>
        </WdsBadgeGroup>
        <strong>Operator Workspace</strong>
        <p>운영 도구, 환경 점검, 데이터 준비, 지표, 승인 흐름을 목적별로 전환합니다.</p>
      </div>

      <nav className="operator-dashboard-nav" aria-label="Admin dashboard sections">
        {adminDashboardSections.map((section) => {
          const isActive = section.id === selectedSectionId;

          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'operator-dashboard-nav-item operator-dashboard-nav-item-active'
                  : 'operator-dashboard-nav-item'
              }
              href={getAdminDashboardSectionHref(section.id)}
              key={section.id}
            >
              <span>
                <strong>{section.label}</strong>
                <small>{section.title}</small>
              </span>
              {counts[section.id] ? (
                <em aria-label={`${section.label} count`}>
                  {counts[section.id]}
                </em>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function AdminOverviewSection({
  adminItems,
}: {
  adminItems: ReturnType<typeof getAdminNavigationItems>;
}) {
  return (
    <section className="operator-dashboard-overview">
      <WdsSectionHeader
        description="상단바에는 Admin 하나만 노출하고, 세부 운영 도구는 이 화면에서 선택합니다."
        title="운영 도구"
      />
      <WdsResponsiveGrid columns={2}>
        {adminItems.map((item) => (
          <WdsSurfaceCard
            as={Link}
            href={item.href}
            key={item.href}
            sx={adminToolCardSx}
          >
            <WdsBadge tone="blue">Admin Tool</WdsBadge>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <Typography as="span" sx={adminToolLinkSx}>
              열기
            </Typography>
          </WdsSurfaceCard>
        ))}
      </WdsResponsiveGrid>

      <WdsNotice>
        <strong>Live deployment mode</strong>
        <p className="helper-text helper-text-caution">
          Vercel 시연에서는 Firebase Auth와 저장된 사용자 역할을 기준으로
          team_member, organizer, admin 권한을 확인합니다.
        </p>
      </WdsNotice>
    </section>
  );
}
