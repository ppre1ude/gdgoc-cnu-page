import { RoleGate } from '@/components/role-gate';
import { NoticeAdmin } from '@/features/notices/notice-admin';

export default function NoticeAdminPage() {
  return (
    <RoleGate
      allowedRoles={['team_member', 'organizer', 'admin']}
      description="공지 관리는 운영진 역할이 있어야 사용할 수 있습니다."
    >
      <NoticeAdmin />
    </RoleGate>
  );
}
