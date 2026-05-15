import type { Activity } from './activity.ts';

export type ActivitySchedule =
  | {
      activityId: string;
      createdAt: string;
      defaultSessionEndsAt: string;
      defaultSessionId: string;
      kind: 'scheduled';
      startsAt: string;
      title: string;
      updatedAt: string;
    }
  | {
      activityId: string;
      createdAt: string;
      kind: 'unscheduled';
      title: string;
      updatedAt: string;
    };

export type DefaultActivitySessionDraft = {
  activityId: string;
  createdAt: string;
  endsAt: string;
  id: string;
  startsAt: string;
  title: string;
  updatedAt: string;
};

export type DefaultActivitySessionComparable = Pick<
  DefaultActivitySessionDraft,
  'endsAt' | 'startsAt' | 'title' | 'updatedAt'
>;

export type SessionEndComparable = {
  endsAt: string;
};

const defaultSessionDurationMs = 2 * 60 * 60 * 1000;

export function getActivitySchedule(activity: Activity): ActivitySchedule {
  if (!activity.startsAt) {
    return {
      activityId: activity.id,
      createdAt: activity.createdAt,
      kind: 'unscheduled',
      title: activity.title,
      updatedAt: activity.updatedAt,
    };
  }

  return {
    activityId: activity.id,
    createdAt: activity.createdAt,
    defaultSessionEndsAt: getDefaultSessionEndsAt(activity.startsAt),
    defaultSessionId: getDefaultSessionId(activity.id),
    kind: 'scheduled',
    startsAt: activity.startsAt,
    title: activity.title,
    updatedAt: activity.updatedAt,
  };
}

export function getDefaultActivitySessionDraft(
  activity: Activity,
): DefaultActivitySessionDraft | null {
  const schedule = getActivitySchedule(activity);

  if (schedule.kind !== 'scheduled') {
    return null;
  }

  return {
    activityId: schedule.activityId,
    createdAt: schedule.createdAt,
    endsAt: schedule.defaultSessionEndsAt,
    id: schedule.defaultSessionId,
    startsAt: schedule.startsAt,
    title: schedule.title,
    updatedAt: schedule.updatedAt,
  };
}

export function shouldSyncDefaultActivitySession(
  savedSession: DefaultActivitySessionComparable,
  defaultSession: DefaultActivitySessionComparable,
) {
  return (
    savedSession.title !== defaultSession.title ||
    savedSession.startsAt !== defaultSession.startsAt ||
    savedSession.endsAt !== defaultSession.endsAt ||
    savedSession.updatedAt !== defaultSession.updatedAt
  );
}

export function isActivityUpcoming(activity: Activity, now: string) {
  if (!activity.startsAt) {
    return false;
  }

  return Date.parse(activity.startsAt) > Date.parse(now);
}

export function isSessionRecentlyEnded(
  session: SessionEndComparable,
  {
    now,
    recentWindowDays = 30,
  }: {
    now: string;
    recentWindowDays?: number;
  },
) {
  const nowTime = Date.parse(now);
  const recentStartTime = nowTime - recentWindowDays * 24 * 60 * 60 * 1000;
  const sessionEndTime = Date.parse(session.endsAt);

  return sessionEndTime <= nowTime && sessionEndTime >= recentStartTime;
}

function getDefaultSessionId(activityId: string) {
  return `${activityId}_default-session`;
}

function getDefaultSessionEndsAt(startsAt: string) {
  return new Date(Date.parse(startsAt) + defaultSessionDurationMs).toISOString();
}
