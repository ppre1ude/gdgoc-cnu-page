import type { Activity, ActivityType, UserRole } from './activity.ts';
import type { ActivityApplication } from './activity-application.ts';

export type ActivitySession = {
  id: string;
  activityId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionAttendanceState = 'attended';

export type SessionAttendance = {
  id: string;
  activityId: string;
  activityType: ActivityType;
  sessionId: string;
  userId: string;
  state: SessionAttendanceState;
  roleSnapshot: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type CreateActivitySessionInput = {
  activityId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  now: string;
};

export type RecordSessionAttendanceInput = {
  activityType: ActivityType;
  roleSnapshot: UserRole;
  now: string;
};

export type SessionAttendanceSummaryInput = {
  applications: ActivityApplication[];
  attendances: SessionAttendance[];
  now: string;
  session: ActivitySession;
};

export type SessionAttendanceSummary = {
  appliedCount: number;
  approvedCount: number;
  attendedCount: number;
  derivedAbsentCount: number;
  hasEnded: boolean;
};

export type SessionAttendanceStore = {
  save(attendance: SessionAttendance): Promise<SessionAttendance>;
  listBySession(sessionId: string): Promise<SessionAttendance[]>;
  findBySessionAndUser(
    sessionId: string,
    userId: string,
  ): Promise<SessionAttendance | null>;
};

export type MarkAttendanceForSessionInput = RecordSessionAttendanceInput & {
  application: ActivityApplication;
  session: ActivitySession;
};

export function createActivitySession(
  input: CreateActivitySessionInput,
): ActivitySession {
  return {
    id: `${input.activityId}_default-session`,
    activityId: input.activityId,
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function createDefaultActivitySession(
  activity: Activity,
): ActivitySession | null {
  if (!activity.startsAt) {
    return null;
  }

  const startsAt = new Date(activity.startsAt);
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

  return createActivitySession({
    activityId: activity.id,
    endsAt: endsAt.toISOString(),
    now: activity.createdAt,
    startsAt: activity.startsAt,
    title: activity.title,
  });
}

export function recordSessionAttendance(
  application: ActivityApplication,
  session: ActivitySession,
  input: RecordSessionAttendanceInput,
): SessionAttendance {
  if (application.cancelledAt) {
    throw new Error('Cancelled applications cannot be marked attended.');
  }

  if (application.state !== 'approved') {
    throw new Error('Only approved applications can be marked attended.');
  }

  if (application.activityId !== session.activityId) {
    throw new Error('Application does not belong to this session activity.');
  }

  return {
    id: `${session.id}_${application.userId}`,
    activityId: session.activityId,
    activityType: input.activityType,
    createdAt: input.now,
    roleSnapshot: input.roleSnapshot,
    sessionId: session.id,
    state: 'attended',
    updatedAt: input.now,
    userId: application.userId,
  };
}

export function summarizeSessionAttendance(
  input: SessionAttendanceSummaryInput,
): SessionAttendanceSummary {
  const activeApplications = input.applications.filter(
    (application) => !application.cancelledAt,
  );
  const approvedApplications = activeApplications.filter(
    (application) => application.state === 'approved',
  );
  const attendedUserIds = new Set(
    input.attendances
      .filter(
        (attendance) =>
          attendance.sessionId === input.session.id &&
          attendance.state === 'attended',
      )
      .map((attendance) => attendance.userId),
  );
  const attendedCount = approvedApplications.filter((application) =>
    attendedUserIds.has(application.userId),
  ).length;
  const hasEnded = input.session.endsAt < input.now;

  return {
    appliedCount: activeApplications.filter(
      (application) => application.state === 'applied',
    ).length,
    approvedCount: approvedApplications.length,
    attendedCount,
    derivedAbsentCount: hasEnded
      ? approvedApplications.length - attendedCount
      : 0,
    hasEnded,
  };
}

export function createInMemorySessionAttendanceStore(
  initialAttendances: SessionAttendance[] = [],
): SessionAttendanceStore {
  const attendances = new Map(
    initialAttendances.map((attendance) => [attendance.id, attendance]),
  );

  return {
    async save(attendance) {
      attendances.set(attendance.id, attendance);
      return attendance;
    },
    async listBySession(sessionId) {
      return [...attendances.values()].filter(
        (attendance) => attendance.sessionId === sessionId,
      );
    },
    async findBySessionAndUser(sessionId, userId) {
      return attendances.get(`${sessionId}_${userId}`) ?? null;
    },
  };
}

export async function markAttendanceForSession(
  store: SessionAttendanceStore,
  input: MarkAttendanceForSessionInput,
): Promise<SessionAttendance> {
  const attendance = recordSessionAttendance(input.application, input.session, {
    activityType: input.activityType,
    now: input.now,
    roleSnapshot: input.roleSnapshot,
  });

  return store.save(attendance);
}
