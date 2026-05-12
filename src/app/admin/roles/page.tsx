import { RoleGate } from '@/components/role-gate';
import { RoleAdmin } from '@/features/admin/role-admin';

export default function RoleAdminPage() {
  return (
    <RoleGate
      allowedRoles={['admin']}
      description="역할 변경은 admin 역할만 사용할 수 있습니다."
      title="Admin 권한이 필요합니다"
    >
      <RoleAdmin />
    </RoleGate>
  );
}
