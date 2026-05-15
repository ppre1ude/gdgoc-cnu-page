import {
  canReadPublishedResource,
  type UserRole,
} from './role-access-policy.ts';

export type { UserRole } from './role-access-policy.ts';

export type ActivityType = 'event' | 'study' | 'project' | 'challenge' | 'social';
export type ActivityVisibility = 'public' | 'member' | 'operator';
export type ActivityStatus = 'draft' | 'published' | 'archived';
export type ActivityRegistrationMode = 'internal' | 'external' | 'hybrid' | 'none';
export type ActivityProposalStatus = 'pending_review' | 'accepted';

export type ActivityRegistrationPolicy = {
  registrationMode: ActivityRegistrationMode;
  canApplyInternally: boolean;
  externalRegistrationUrl?: string;
  externalRegistrationLabel: string;
};

export type Activity = {
  id: string;
  title: string;
  summary: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  startsAt?: string;
  registrationMode?: ActivityRegistrationMode;
  externalRegistrationUrl?: string;
  externalRegistrationLabel?: string;
  proposalStatus?: ActivityProposalStatus;
  proposedByUserId?: string;
  proposalSubmittedAt?: string;
  proposalReviewedAt?: string;
  proposalReviewedByUserId?: string;
  createdAt: string;
  updatedAt: string;
};

const externalRegistrationLabel = '바로가기';

export function listVisibleActivities(
  activities: Activity[],
  role: UserRole,
): Activity[] {
  return activities.filter((activity) =>
    canReadPublishedResource(role, activity),
  );
}

export function getActivityRegistrationPolicy(
  activity: Activity,
): ActivityRegistrationPolicy {
  const registrationMode = activity.registrationMode ?? 'internal';
  const canApplyInternally =
    registrationMode === 'internal' || registrationMode === 'hybrid';
  const externalRegistrationUrl = shouldExposeExternalRegistrationUrl(
    registrationMode,
    activity.externalRegistrationUrl,
  )
    ? activity.externalRegistrationUrl
    : undefined;

  return {
    registrationMode,
    canApplyInternally,
    externalRegistrationUrl,
    externalRegistrationLabel,
  };
}

function shouldExposeExternalRegistrationUrl(
  registrationMode: ActivityRegistrationMode,
  url: string | undefined,
) {
  if (registrationMode !== 'external' && registrationMode !== 'hybrid') {
    return false;
  }

  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
}
