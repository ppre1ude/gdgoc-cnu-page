import { RoleGate } from '@/components/role-gate';
import { operatorUserRoles } from '@/domain/role-access-policy';
import { AdminDashboard } from '@/features/admin/admin-dashboard';

export default function AdminPage() {
  return (
    <RoleGate
      allowedRoles={operatorUserRoles}
      description="운영진 역할이 있어야 관리자 대시보드를 열 수 있습니다."
    >
      <AdminDashboard />
    </RoleGate>
  );
}
