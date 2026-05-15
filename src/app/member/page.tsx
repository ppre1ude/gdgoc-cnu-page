import { MemberHome } from '@/features/activities/member-home';
import { resolveMemberDashboardSectionId } from '@/domain/member-dashboard-sections';

type MemberHomePageProps = {
  searchParams?: Promise<{
    section?: string | string[];
  }>;
};

export default async function MemberHomePage({
  searchParams,
}: MemberHomePageProps) {
  const params = searchParams ? await searchParams : {};

  return (
    <MemberHome
      initialSectionId={resolveMemberDashboardSectionId(
        getFirstSearchParam(params.section),
      )}
    />
  );
}

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
