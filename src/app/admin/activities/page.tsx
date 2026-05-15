import { RoleGate } from '@/components/role-gate';
import { operatorUserRoles } from '@/domain/role-access-policy';
import { ActivityAdmin } from '@/features/activities/activity-admin';

export default function ActivityAdminPage() {
  return (
    <RoleGate
      allowedRoles={operatorUserRoles}
      description="활동 관리는 운영진 역할이 있어야 사용할 수 있습니다."
    >
      <ActivityAdmin />
    </RoleGate>
  );
}
