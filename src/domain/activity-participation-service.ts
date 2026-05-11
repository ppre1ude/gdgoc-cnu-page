import {
  applyToActivity,
  cancelActivityApplication,
  type ActivityApplication,
  type ActivityApplicationState,
} from './activity-application.ts';

export type ActivityApplicationStore = {
  save(application: ActivityApplication): Promise<ActivityApplication>;
  listByUser(userId: string): Promise<ActivityApplication[]>;
  findByActivityAndUser(
    activityId: string,
    userId: string,
  ): Promise<ActivityApplication | null>;
};

export type ApplyForActivityInput = {
  activityId: string;
  userId: string;
  now: string;
};

export type CancelApplicationForActivityInput = {
  activityId: string;
  userId: string;
  cancellationAllowed: boolean;
  now: string;
};

export function createInMemoryActivityApplicationStore(
  initialApplications: ActivityApplication[] = [],
): ActivityApplicationStore {
  const applications = new Map(
    initialApplications.map((application) => [application.id, application]),
  );

  return {
    async save(application) {
      applications.set(application.id, application);
      return application;
    },
    async listByUser(userId) {
      return [...applications.values()].filter(
        (application) => application.userId === userId,
      );
    },
    async findByActivityAndUser(activityId, userId) {
      return applications.get(`${activityId}_${userId}`) ?? null;
    },
  };
}

export async function applyForActivity(
  store: ActivityApplicationStore,
  input: ApplyForActivityInput,
): Promise<ActivityApplication> {
  const application = applyToActivity(input);

  return store.save(application);
}

export async function cancelApplicationForActivity(
  store: ActivityApplicationStore,
  input: CancelApplicationForActivityInput,
): Promise<ActivityApplication> {
  const application = await store.findByActivityAndUser(
    input.activityId,
    input.userId,
  );

  if (!application) {
    throw new Error('Activity application does not exist.');
  }

  return store.save(
    cancelActivityApplication(application, {
      cancellationAllowed: input.cancellationAllowed,
      now: input.now,
    }),
  );
}

export async function getApplicationStateByActivity(
  store: ActivityApplicationStore,
  userId: string,
): Promise<Record<string, ActivityApplicationState>> {
  const applications = await store.listByUser(userId);

  return Object.fromEntries(
    applications.map((application) => [application.activityId, application.state]),
  );
}
