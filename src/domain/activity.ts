export type UserRole =
  | 'visitor'
  | 'guest'
  | 'member'
  | 'alumni'
  | 'team_member'
  | 'organizer'
  | 'admin';

export type ActivityType = 'event' | 'study' | 'project' | 'challenge' | 'social';
export type ActivityVisibility = 'public' | 'member' | 'operator';
export type ActivityStatus = 'draft' | 'published' | 'archived';
export type ActivityRegistrationMode = 'internal' | 'external' | 'hybrid' | 'none';

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
  createdAt: string;
  updatedAt: string;
};

const roleVisibilityRank: Record<UserRole, number> = {
  visitor: 0,
  guest: 0,
  member: 1,
  alumni: 1,
  team_member: 2,
  organizer: 2,
  admin: 2,
};

const activityVisibilityRank: Record<ActivityVisibility, number> = {
  public: 0,
  member: 1,
  operator: 2,
};

const defaultExternalRegistrationLabel = '공식 등록 페이지';

export function listVisibleActivities(
  activities: Activity[],
  role: UserRole,
): Activity[] {
  const allowedRank = roleVisibilityRank[role];

  return activities.filter((activity) => {
    if (activity.status !== 'published') {
      return false;
    }

    return activityVisibilityRank[activity.visibility] <= allowedRank;
  });
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
    externalRegistrationLabel:
      externalRegistrationUrl && activity.externalRegistrationLabel?.trim()
        ? activity.externalRegistrationLabel.trim()
        : defaultExternalRegistrationLabel,
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
