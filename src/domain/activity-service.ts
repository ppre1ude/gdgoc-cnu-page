import {
  type Activity,
  type ActivityRegistrationMode,
  type ActivityStatus,
  type ActivityType,
  type ActivityVisibility,
  listVisibleActivities,
  type UserRole,
} from './activity.ts';

export type ActivityStore = {
  create(activity: Activity): Promise<Activity>;
  save(activity: Activity): Promise<Activity>;
  list(role?: UserRole): Promise<Activity[]>;
};

export type ActivityProposalType = Extract<ActivityType, 'study' | 'project'>;

export type CreateActivityInput = {
  actorRole: UserRole;
  title: string;
  summary: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  startsAt?: string;
  registrationMode?: ActivityRegistrationMode;
  externalRegistrationUrl?: string;
  externalRegistrationLabel?: string;
  now: string;
};

export type ProposeMemberActivityInput = {
  actorRole: UserRole;
  actorUserId: string;
  title: string;
  summary: string;
  type: ActivityProposalType;
  startsAt?: string;
  now: string;
};

export type AcceptActivityProposalInput = {
  actorRole: UserRole;
  actorUserId: string;
  activityId: string;
  now: string;
};

export type ArchiveActivityInput = {
  actorRole: UserRole;
  activityId: string;
  now: string;
};

export type UpdateActivityInput = {
  actorRole: UserRole;
  activityId: string;
  title: string;
  summary: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  startsAt?: string;
  registrationMode?: ActivityRegistrationMode;
  externalRegistrationUrl?: string;
  externalRegistrationLabel?: string;
  now: string;
};

const operatorRoles = new Set<UserRole>(['team_member', 'organizer', 'admin']);
const activeMemberRoles = new Set<UserRole>([
  'member',
  'team_member',
  'organizer',
  'admin',
]);

export function createInMemoryActivityStore(
  initialActivities: Activity[] = [],
): ActivityStore {
  const activities = [...initialActivities];

  return {
    async create(activity) {
      activities.push(activity);
      return activity;
    },
    async save(activity) {
      const index = activities.findIndex((current) => current.id === activity.id);

      if (index === -1) {
        activities.push(activity);
        return activity;
      }

      activities[index] = activity;
      return activity;
    },
    async list() {
      return [...activities];
    },
  };
}

export async function createActivity(
  store: ActivityStore,
  input: CreateActivityInput,
): Promise<Activity> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can create official activities.');
  }

  return store.create({
    id: `activity-${crypto.randomUUID()}`,
    title: input.title,
    summary: input.summary,
    type: input.type,
    visibility: input.visibility,
    status: input.status,
    startsAt: input.startsAt,
    registrationMode: input.registrationMode,
    externalRegistrationUrl: input.externalRegistrationUrl,
    externalRegistrationLabel: input.externalRegistrationLabel,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

export async function updateActivity(
  store: ActivityStore,
  input: UpdateActivityInput,
): Promise<Activity> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can update activities.');
  }

  const activity = await findActivityOrThrow(store, input.activityId);

  return store.save({
    ...activity,
    title: input.title,
    summary: input.summary,
    type: input.type,
    visibility: input.visibility,
    status: input.status,
    startsAt: input.startsAt,
    registrationMode: input.registrationMode,
    externalRegistrationUrl: input.externalRegistrationUrl,
    externalRegistrationLabel: input.externalRegistrationLabel,
    updatedAt: input.now,
  });
}

export async function archiveActivity(
  store: ActivityStore,
  input: ArchiveActivityInput,
): Promise<Activity> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can archive activities.');
  }

  const activity = await findActivityOrThrow(store, input.activityId);

  return store.save({
    ...activity,
    status: 'archived',
    updatedAt: input.now,
  });
}

export async function proposeMemberActivity(
  store: ActivityStore,
  input: ProposeMemberActivityInput,
): Promise<Activity> {
  if (!activeMemberRoles.has(input.actorRole)) {
    throw new Error('Only active members can propose activities.');
  }

  const isStudy = input.type === 'study';

  return store.create({
    id: `activity-${crypto.randomUUID()}`,
    title: input.title,
    summary: input.summary,
    type: input.type,
    visibility: isStudy ? 'member' : 'operator',
    status: isStudy ? 'published' : 'draft',
    startsAt: input.startsAt,
    registrationMode: 'internal',
    proposalStatus: isStudy ? 'accepted' : 'pending_review',
    proposedByUserId: input.actorUserId,
    proposalSubmittedAt: input.now,
    proposalReviewedAt: isStudy ? input.now : undefined,
    proposalReviewedByUserId: isStudy ? input.actorUserId : undefined,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

export async function listPendingActivityProposals(
  store: ActivityStore,
  actorRole: UserRole,
): Promise<Activity[]> {
  if (!operatorRoles.has(actorRole)) {
    throw new Error('Only operators can list pending activity proposals.');
  }

  const activities = await store.list(actorRole);

  return activities
    .filter((activity) => activity.proposalStatus === 'pending_review')
    .sort((a, b) => {
      const submittedA = a.proposalSubmittedAt ?? a.createdAt;
      const submittedB = b.proposalSubmittedAt ?? b.createdAt;

      if (submittedA === submittedB) {
        return a.title.localeCompare(b.title);
      }

      return submittedA.localeCompare(submittedB);
    });
}

export async function acceptActivityProposal(
  store: ActivityStore,
  input: AcceptActivityProposalInput,
): Promise<Activity> {
  if (!operatorRoles.has(input.actorRole)) {
    throw new Error('Only operators can approve activity proposals.');
  }

  const activities = await store.list(input.actorRole);
  const activity = activities.find((current) => current.id === input.activityId);

  if (!activity) {
    throw new Error('Activity proposal was not found.');
  }

  if (activity.proposalStatus !== 'pending_review') {
    throw new Error('Only pending activity proposals can be approved.');
  }

  return store.save({
    ...activity,
    visibility: 'member',
    status: 'published',
    proposalStatus: 'accepted',
    proposalReviewedAt: input.now,
    proposalReviewedByUserId: input.actorUserId,
    updatedAt: input.now,
  });
}

export async function listHomeActivities(
  store: ActivityStore,
  role: UserRole,
): Promise<Activity[]> {
  const activities = await store.list(role);

  return listVisibleActivities(activities, role).sort((a, b) => {
    if (!a.startsAt || !b.startsAt) {
      return a.title.localeCompare(b.title);
    }

    return a.startsAt.localeCompare(b.startsAt);
  });
}

export async function getVisibleActivityById(
  store: ActivityStore,
  activityId: string,
  role: UserRole,
): Promise<Activity | null> {
  const activities = await store.list(role);

  return (
    listVisibleActivities(activities, role).find(
      (activity) => activity.id === activityId,
    ) ?? null
  );
}

async function findActivityOrThrow(
  store: ActivityStore,
  activityId: string,
): Promise<Activity> {
  const activities = await store.list();
  const activity = activities.find((current) => current.id === activityId);

  if (!activity) {
    throw new Error(`Activity was not found: ${activityId}`);
  }

  return activity;
}
