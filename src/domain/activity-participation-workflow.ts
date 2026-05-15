import type { Activity } from './activity.ts';
import type { ActivityApplication } from './activity-application.ts';
import {
  type ActivityApplicationStore,
  listApplicationsForActivity,
} from './activity-participation-service.ts';
import {
  type ActivitySession,
  type ActivitySessionStore,
  type SessionAttendance,
  type SessionAttendanceStore,
  type SessionAttendanceSummary,
  loadOrSyncDefaultActivitySession,
  summarizeSessionAttendance,
} from './activity-session.ts';

export type ActivityParticipationSnapshotStores = {
  applicationStore: ActivityApplicationStore;
  attendanceStore: SessionAttendanceStore;
  sessionStore: ActivitySessionStore;
};

export type BuildActivityParticipationSnapshotInput =
  ActivityParticipationSnapshotStores & {
    activities: Activity[];
    now: string;
  };

export type ActivityParticipationSnapshot = {
  applications: ActivityApplication[];
  applicationsByActivity: Record<string, ActivityApplication[]>;
  attendedUserIdsBySession: Record<string, string[]>;
  attendancesBySession: Record<string, SessionAttendance[]>;
  sessionAttendances: SessionAttendance[];
  sessions: ActivitySession[];
  sessionsByActivity: Record<string, ActivitySession | null>;
  summariesByActivity: Record<string, SessionAttendanceSummary | null>;
};

export async function buildActivityParticipationSnapshot(
  input: BuildActivityParticipationSnapshotInput,
): Promise<ActivityParticipationSnapshot> {
  const sessionsByActivity = Object.fromEntries(
    await Promise.all(
      input.activities.map(async (activity) => [
        activity.id,
        await loadOrSyncDefaultActivitySession(input.sessionStore, activity),
      ]),
    ),
  ) as Record<string, ActivitySession | null>;
  const applicationsByActivity = Object.fromEntries(
    await Promise.all(
      input.activities.map(async (activity) => [
        activity.id,
        await listApplicationsForActivity(input.applicationStore, activity.id),
      ]),
    ),
  ) as Record<string, ActivityApplication[]>;
  const sessions = Object.values(sessionsByActivity).filter(
    (session): session is ActivitySession => Boolean(session),
  );
  const attendancesBySession = Object.fromEntries(
    await Promise.all(
      sessions.map(async (session) => [
        session.id,
        await input.attendanceStore.listBySession(session.id),
      ]),
    ),
  ) as Record<string, SessionAttendance[]>;
  const summariesByActivity = Object.fromEntries(
    input.activities.map((activity) => {
      const session = sessionsByActivity[activity.id];

      return [
        activity.id,
        session
          ? summarizeSessionAttendance({
              applications: applicationsByActivity[activity.id] ?? [],
              attendances: attendancesBySession[session.id] ?? [],
              now: input.now,
              session,
            })
          : null,
      ];
    }),
  ) as Record<string, SessionAttendanceSummary | null>;

  return {
    applications: Object.values(applicationsByActivity).flat(),
    applicationsByActivity,
    attendedUserIdsBySession: getAttendedUserIdsBySession(attendancesBySession),
    attendancesBySession,
    sessionAttendances: Object.values(attendancesBySession).flat(),
    sessions,
    sessionsByActivity,
    summariesByActivity,
  };
}

function getAttendedUserIdsBySession(
  attendancesBySession: Record<string, SessionAttendance[]>,
) {
  return Object.fromEntries(
    Object.entries(attendancesBySession).map(([sessionId, attendances]) => [
      sessionId,
      attendances
        .filter((attendance) => attendance.state === 'attended')
        .map((attendance) => attendance.userId),
    ]),
  );
}
