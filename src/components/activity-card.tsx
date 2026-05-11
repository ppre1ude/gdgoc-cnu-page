import type { Activity } from '@/domain/activity';

const activityTypeLabel: Record<Activity['type'], string> = {
  event: 'Event',
  study: 'Study',
  project: 'Project',
  challenge: 'Challenge',
  social: 'Social',
};

const visibilityLabel: Record<Activity['visibility'], string> = {
  public: 'Public',
  member: 'Member',
  operator: 'Operator',
};

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="card">
      <div className="badge-row">
        <span className="badge badge-blue">{activityTypeLabel[activity.type]}</span>
        <span className="badge">{visibilityLabel[activity.visibility]}</span>
      </div>
      <h3>{activity.title}</h3>
      <p>{activity.summary}</p>
      {activity.startsAt ? (
        <p className="helper-text" style={{ marginTop: 14 }}>
          {formatDate(activity.startsAt)}
        </p>
      ) : null}
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}
