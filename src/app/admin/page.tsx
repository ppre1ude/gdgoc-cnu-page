import { RoleGate } from '@/components/role-gate';
import { resolveAdminDashboardSectionId } from '@/domain/admin-dashboard-sections';
import { operatorUserRoles } from '@/domain/role-access-policy';
import { AdminDashboard } from '@/features/admin/admin-dashboard';

type AdminPageProps = {
  searchParams?: Promise<{
    section?: string | string[];
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};

  return (
    <RoleGate
      allowedRoles={operatorUserRoles}
      description="운영진 역할이 있어야 관리자 대시보드를 열 수 있습니다."
    >
      <AdminDashboard
        initialSectionId={resolveAdminDashboardSectionId(
          getFirstSearchParam(params.section),
        )}
      />
    </RoleGate>
  );
}

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
