'use client';

import type { SessionAttendance } from '@/domain/activity-session';
import {
  type SessionAttendanceStore,
  createInMemorySessionAttendanceStore,
} from '@/domain/activity-session';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';

const storageKey = 'gdgoc-cnu.sessionAttendances';

export function createBrowserSessionAttendanceStore(): SessionAttendanceStore {
  if (typeof window === 'undefined') {
    return createInMemorySessionAttendanceStore();
  }

  if (hasFirebaseConfig()) {
    return createFirestoreSessionAttendanceStore();
  }

  return createLocalStorageSessionAttendanceStore();
}

function createLocalStorageSessionAttendanceStore(): SessionAttendanceStore {
  return {
    async save(attendance) {
      const attendances = readAttendances();
      writeAttendances([
        attendance,
        ...attendances.filter((item) => item.id !== attendance.id),
      ]);
      return attendance;
    },
    async listBySession(sessionId) {
      return readAttendances().filter(
        (attendance) => attendance.sessionId === sessionId,
      );
    },
    async findBySessionAndUser(sessionId, userId) {
      return (
        readAttendances().find(
          (attendance) =>
            attendance.sessionId === sessionId && attendance.userId === userId,
        ) ?? null
      );
    },
  };
}

function readAttendances(): SessionAttendance[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as SessionAttendance[];
}

function writeAttendances(attendances: SessionAttendance[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(attendances));
}

function createFirestoreSessionAttendanceStore(): SessionAttendanceStore {
  return {
    async save(attendance) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(getFirestoreDb(), 'sessionAttendances', attendance.id),
        attendance,
      );
      return attendance;
    },
    async listBySession(sessionId) {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const snapshot = await getDocs(
        query(
          collection(getFirestoreDb(), 'sessionAttendances'),
          where('sessionId', '==', sessionId),
        ),
      );

      return snapshot.docs.map((item) => item.data() as SessionAttendance);
    },
    async findBySessionAndUser(sessionId, userId) {
      const { doc, getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(
        doc(getFirestoreDb(), 'sessionAttendances', `${sessionId}_${userId}`),
      );

      return snapshot.exists() ? (snapshot.data() as SessionAttendance) : null;
    },
  };
}
