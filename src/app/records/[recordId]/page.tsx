import { RecordDetail } from '@/features/records/record-detail';

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;

  return <RecordDetail recordId={decodeURIComponent(recordId)} />;
}

