export const ACTIVITY_APPLICATION_STATES = [
  'applied',
  'approved',
  'cancelled',
] as const;

export type ActivityApplicationState =
  (typeof ACTIVITY_APPLICATION_STATES)[number];

export type ActivityApplication = {
  id: string;
  activityId: string;
  userId: string;
  state: ActivityApplicationState;
  createdAt: string;
  updatedAt: string;
};

export type ApplyToActivityInput = {
  activityId: string;
  userId: string;
  now: string;
};

export type CancelActivityApplicationInput = {
  cancellationAllowed: boolean;
  now: string;
};

export type ApproveActivityApplicationInput = {
  now: string;
};

export function isActivityApplicationState(
  state: string,
): state is ActivityApplicationState {
  return ACTIVITY_APPLICATION_STATES.includes(
    state as ActivityApplicationState,
  );
}

export function applyToActivity(input: ApplyToActivityInput): ActivityApplication {
  return {
    id: `${input.activityId}_${input.userId}`,
    activityId: input.activityId,
    userId: input.userId,
    state: 'applied',
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function approveActivityApplication(
  application: ActivityApplication,
  input: ApproveActivityApplicationInput,
): ActivityApplication {
  if (application.state !== 'applied') {
    throw new Error(
      `Cannot approve application from ${application.state} state.`,
    );
  }

  return {
    ...application,
    state: 'approved',
    updatedAt: input.now,
  };
}

export function cancelActivityApplication(
  application: ActivityApplication,
  input: CancelActivityApplicationInput,
): ActivityApplication {
  if (!input.cancellationAllowed) {
    throw new Error('Cancellation is not allowed for this activity.');
  }

  if (application.state === 'cancelled') {
    throw new Error('Cannot cancel application from cancelled state.');
  }

  return {
    ...application,
    state: 'cancelled',
    updatedAt: input.now,
  };
}
