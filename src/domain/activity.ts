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

export type Activity = {
  id: string;
  title: string;
  summary: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  startsAt?: string;
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
