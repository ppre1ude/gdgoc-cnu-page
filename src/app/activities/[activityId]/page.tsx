import { ActivityDetail } from '@/features/activities/activity-detail';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;

  return <ActivityDetail activityId={decodeURIComponent(activityId)} />;
}
