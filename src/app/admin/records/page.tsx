import { RoleGate } from '@/components/role-gate';
import { RecordAdmin } from '@/features/records/record-admin';

export default function RecordAdminPage() {
  return (
    <RoleGate
      allowedRoles={['team_member', 'organizer', 'admin']}
      description="기록 관리는 운영진 역할이 있어야 사용할 수 있습니다."
    >
      <RecordAdmin />
    </RoleGate>
  );
}

