import {
  type Activity,
  getActivityRegistrationPolicy,
} from '@/domain/activity';
import type { ActivityApplicationState } from '@/domain/activity-application';
import { formatKoreanDateTime } from '@/lib/format-korean-date-time';

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

const registrationModeLabel: Record<
  NonNullable<Activity['registrationMode']>,
  string
> = {
  internal: 'Internal',
  external: 'External',
  hybrid: 'Hybrid',
  none: 'Info',
};

const applicationStateLabel: Record<ActivityApplicationState, string> = {
  applied: '운영진 승인 대기 중',
  approved: '승인됨',
};

export function ActivityCard({
  activity,
  applicationState,
  onApply,
  onCancel,
}: {
  activity: Activity;
  applicationState?: ActivityApplicationState;
  onApply?: (activity: Activity) => void;
  onCancel?: (activity: Activity) => void;
}) {
  const registrationPolicy = getActivityRegistrationPolicy(activity);
  const canApply =
    registrationPolicy.canApplyInternally && onApply && !applicationState;
  const canCancel =
    onCancel && (applicationState === 'applied' || applicationState === 'approved');

  return (
    <article className="card">
      <div className="badge-row">
        <span className="badge badge-blue">{activityTypeLabel[activity.type]}</span>
        <span className="badge">{visibilityLabel[activity.visibility]}</span>
        {registrationPolicy.registrationMode !== 'internal' ? (
          <span className="badge">
            {registrationModeLabel[registrationPolicy.registrationMode]}
          </span>
        ) : null}
        {applicationState ? (
          <span className="badge badge-green">
            {applicationStateLabel[applicationState]}
          </span>
        ) : null}
      </div>
      <h3>{activity.title}</h3>
      <p>{activity.summary}</p>
      {activity.startsAt ? (
        <p className="helper-text" style={{ marginTop: 14 }}>
          {formatDate(activity.startsAt)}
        </p>
      ) : null}
      {canApply || canCancel || registrationPolicy.externalRegistrationUrl ? (
        <div className="card-actions">
          {registrationPolicy.externalRegistrationUrl ? (
            <a
              className="button button-secondary button-small"
              href={registrationPolicy.externalRegistrationUrl}
              rel="noreferrer"
              target="_blank"
            >
              {registrationPolicy.externalRegistrationLabel}
            </a>
          ) : null}
          {canApply ? (
            <button
              className="button button-primary button-small"
              onClick={() => onApply(activity)}
              type="button"
            >
              참여 신청
            </button>
          ) : null}
          {canCancel ? (
            <button
              className="button button-secondary button-small"
              onClick={() => onCancel(activity)}
              type="button"
            >
              신청 취소
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function formatDate(value: string) {
  return formatKoreanDateTime(value);
}
