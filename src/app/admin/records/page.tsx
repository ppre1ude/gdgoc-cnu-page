import { RoleGate } from '@/components/role-gate';
import { operatorUserRoles } from '@/domain/role-access-policy';
import { RecordAdmin } from '@/features/records/record-admin';

export default function RecordAdminPage() {
  return (
    <RoleGate
      allowedRoles={operatorUserRoles}
      description="기록 관리는 운영진 역할이 있어야 사용할 수 있습니다."
    >
      <RecordAdmin />
    </RoleGate>
  );
}
