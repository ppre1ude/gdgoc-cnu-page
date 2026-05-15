import {
  type Activity,
  getActivityRegistrationPolicy,
} from '@/domain/activity';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsOffset,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import {
  WdsButton,
  WdsBadge,
  WdsLinkButton,
  WdsTextLinkButton,
} from '@/components/wds-form-controls';
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
    <WdsSurfaceCard as="article">
      <WdsBadgeGroup>
        <WdsBadge tone="blue">{activityTypeLabel[activity.type]}</WdsBadge>
        <WdsBadge>{visibilityLabel[activity.visibility]}</WdsBadge>
        {registrationPolicy.registrationMode !== 'internal' ? (
          <WdsBadge>
            {registrationModeLabel[registrationPolicy.registrationMode]}
          </WdsBadge>
        ) : null}
        {applicationState ? (
          <WdsBadge tone="green">
            {applicationStateLabel[applicationState]}
          </WdsBadge>
        ) : null}
      </WdsBadgeGroup>
      <h3>{activity.title}</h3>
      <p>{activity.summary}</p>
      {activity.startsAt ? (
        <WdsOffset offset="sm">
          <p className="helper-text">
            {formatKoreanDateTime(activity.startsAt)}
          </p>
        </WdsOffset>
      ) : null}
      <WdsActionRow offset="sm">
        <WdsTextLinkButton
          href={`/activities/${encodeURIComponent(activity.id)}`}
        >
          자세히
        </WdsTextLinkButton>
        {registrationPolicy.externalRegistrationUrl ? (
          <WdsLinkButton
            external
            href={registrationPolicy.externalRegistrationUrl}
            rel="noreferrer"
            size="small"
            target="_blank"
            tone="secondary"
          >
            {registrationPolicy.externalRegistrationLabel}
          </WdsLinkButton>
        ) : null}
        {canApply ? (
          <WdsButton
            onClick={() => onApply(activity)}
            size="small"
            tone="primary"
            type="button"
          >
            참여 신청
          </WdsButton>
        ) : null}
        {canCancel ? (
          <WdsButton
            onClick={() => onCancel(activity)}
            size="small"
            tone="secondary"
            type="button"
          >
            신청 취소
          </WdsButton>
        ) : null}
      </WdsActionRow>
    </WdsSurfaceCard>
  );
}
