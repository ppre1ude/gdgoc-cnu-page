import { RoleGate } from '@/components/role-gate';
import { ShowcaseAdmin } from '@/features/showcases/showcase-admin';

export default function ShowcaseAdminPage() {
  return (
    <RoleGate
      allowedRoles={['team_member', 'organizer', 'admin']}
      description="쇼케이스 관리는 운영진 역할이 있어야 사용할 수 있습니다."
    >
      <ShowcaseAdmin />
    </RoleGate>
  );
}
