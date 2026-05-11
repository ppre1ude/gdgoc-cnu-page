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
  list(): Promise<Activity[]>;
};

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

const operatorRoles = new Set<UserRole>(['team_member', 'organizer', 'admin']);

export function createInMemoryActivityStore(
  initialActivities: Activity[] = [],
): ActivityStore {
  const activities = [...initialActivities];

  return {
    async create(activity) {
      activities.push(activity);
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

export async function listHomeActivities(
  store: ActivityStore,
  role: UserRole,
): Promise<Activity[]> {
  const activities = await store.list();

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
  const activities = await store.list();

  return (
    listVisibleActivities(activities, role).find(
      (activity) => activity.id === activityId,
    ) ?? null
  );
}
