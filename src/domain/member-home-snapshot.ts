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

export type MemberHomeSnapshotStores = {
  activityStore: ActivityStore;
  applicationStore: ActivityApplicationStore;
  noticeStore: NoticeStore;
  recordStore: ChapterRecordStore;
  showcaseStore: ShowcaseStore;
};

export type BuildMemberHomeSnapshotInput = MemberHomeSnapshotStores & {
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

export type MemberHomeSnapshot = {
  access: MemberHomeAccess;
  activeApplicationCount: number;
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  canApplyToActivities: boolean;
  canProposeActivities: boolean;
  contentRole: UserRole;
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

  return {
    access,
    activeApplicationCount: getActiveApplicationCount(applicationStates),
    activities,
    applicationStates,
    canApplyToActivities: access.canApplyToActivities,
    canProposeActivities: access.canApplyToActivities,
    contentRole,
    memberApplicationSummaries: listMemberApplicationSummaries(
      activities,
      applicationStates,
    ),
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

function getMemberHomeContentRole(role: UserRole): UserRole {
  if (role === 'visitor' || role === 'guest') {
    return role;
  }

  return 'member';
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
