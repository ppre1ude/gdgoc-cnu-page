import type { Activity, UserRole } from './activity.ts';
import {
  type ActivityStore,
  listHomeActivities,
} from './activity-service.ts';
import type { ActivityApplicationState } from './activity-application.ts';
import {
  type ActivityApplicationStore,
  getApplicationStateByActivity,
  listMemberApplicationSummaries,
  type MemberApplicationSummary,
} from './activity-participation-service.ts';
import type { ChapterRecord } from './chapter-record.ts';
import {
  type ChapterRecordStore,
  listHomeChapterRecords,
} from './chapter-record-service.ts';
import {
  describeMemberHomeAccess,
  type MemberHomeAccess,
} from './member-access.ts';
import type { Notice } from './notice.ts';
import {
  listHomeNotices,
  type NoticeStore,
} from './notice-service.ts';
import type { Showcase } from './showcase.ts';
import {
  listHomeShowcases,
  type ShowcaseStore,
} from './showcase-service.ts';
import { getMemberHomeContentRole } from './role-access-policy.ts';

export type MemberHomeSnapshotStores = {
  activityStore: ActivityStore;
  applicationStore: ActivityApplicationStore;
  noticeStore: NoticeStore;
  recordStore: ChapterRecordStore;
  showcaseStore: ShowcaseStore;
};

export type BuildMemberHomeSnapshotInput = MemberHomeSnapshotStores & {
  now?: string;
  role: UserRole;
  userId: string;
};

export type MemberHomeSnapshotIdentity = {
  role: UserRole;
  userId: string;
};

export type MemberHomeActivitySections = {
  challengesAndSocialActivities: Activity[];
  studiesAndProjects: Activity[];
  upcomingActivities: Activity[];
};

export type MemberHomeDashboard = {
  calendarActivities: Activity[];
  importantNotices: Notice[];
  myNextCommitments: MemberApplicationSummary[];
  openStudyProjects: Activity[];
};

export type MemberHomeSnapshot = {
  access: MemberHomeAccess;
  activeApplicationCount: number;
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  canApplyToActivities: boolean;
  canProposeActivities: boolean;
  contentRole: UserRole;
  dashboard: MemberHomeDashboard;
  memberApplicationSummaries: MemberApplicationSummary[];
  notices: Notice[];
  records: ChapterRecord[];
  role: UserRole;
  sections: MemberHomeActivitySections;
  showcases: Showcase[];
  userId: string;
};

export async function buildMemberHomeSnapshot(
  input: BuildMemberHomeSnapshotInput,
): Promise<MemberHomeSnapshot> {
  const access = describeMemberHomeAccess(input.role);
  const contentRole = getMemberHomeContentRole(input.role);
  const now = input.now ?? new Date().toISOString();
  const [
    activities,
    applicationStates,
    notices,
    showcases,
    records,
  ] = await Promise.all([
    listHomeActivities(input.activityStore, contentRole),
    access.canApplyToActivities
      ? getApplicationStateByActivity(input.applicationStore, input.userId)
      : Promise.resolve({}),
    listHomeNotices(input.noticeStore, contentRole),
    listHomeShowcases(input.showcaseStore, contentRole),
    listHomeChapterRecords(input.recordStore, contentRole),
  ]);
  const memberApplicationSummaries = listMemberApplicationSummaries(
    activities,
    applicationStates,
  );

  return {
    access,
    activeApplicationCount: getActiveApplicationCount(applicationStates),
    activities,
    applicationStates,
    canApplyToActivities: access.canApplyToActivities,
    canProposeActivities: access.canApplyToActivities,
    contentRole,
    dashboard: getMemberHomeDashboard(
      activities,
      notices,
      memberApplicationSummaries,
      now,
    ),
    memberApplicationSummaries,
    notices,
    records,
    role: input.role,
    sections: getMemberHomeActivitySections(activities),
    showcases,
    userId: input.userId,
  };
}

export function isMemberHomeSnapshotCurrent(
  snapshot: MemberHomeSnapshot | null,
  identity: MemberHomeSnapshotIdentity,
) {
  return (
    Boolean(snapshot) &&
    snapshot?.role === identity.role &&
    snapshot.userId === identity.userId
  );
}

function getActiveApplicationCount(
  applicationStates: Record<string, ActivityApplicationState>,
) {
  return Object.values(applicationStates).filter(
    (state) => state === 'applied' || state === 'approved',
  ).length;
}

function getMemberHomeActivitySections(
  activities: Activity[],
): MemberHomeActivitySections {
  return {
    challengesAndSocialActivities: activities.filter((activity) =>
      ['challenge', 'social'].includes(activity.type),
    ),
    studiesAndProjects: activities.filter((activity) =>
      ['study', 'project'].includes(activity.type),
    ),
    upcomingActivities: activities.filter((activity) => activity.startsAt),
  };
}

function getMemberHomeDashboard(
  activities: Activity[],
  notices: Notice[],
  memberApplicationSummaries: MemberApplicationSummary[],
  now: string,
): MemberHomeDashboard {
  return {
    calendarActivities: activities
      .filter((activity) => isUpcomingScheduledActivity(activity, now))
      .sort((activity, nextActivity) =>
        activity.startsAt!.localeCompare(nextActivity.startsAt!),
      ),
    importantNotices: notices,
    myNextCommitments: memberApplicationSummaries.filter(({ activity }) =>
      isUpcomingOrUnscheduledActivity(activity, now),
    ),
    openStudyProjects: activities.filter((activity) =>
      ['study', 'project'].includes(activity.type) &&
      isUpcomingOrUnscheduledActivity(activity, now),
    ),
  };
}

function isUpcomingScheduledActivity(activity: Activity, now: string) {
  return Boolean(activity.startsAt) && activity.startsAt! >= now;
}

function isUpcomingOrUnscheduledActivity(activity: Activity, now: string) {
  return !activity.startsAt || activity.startsAt >= now;
}
