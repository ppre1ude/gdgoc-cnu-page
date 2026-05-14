'use client';

import {
  type ActivitySession,
  type ActivitySessionStore,
  createInMemoryActivitySessionStore,
} from '@/domain/activity-session';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';

const storageKey = 'gdgoc-cnu.activitySessions';

export function createBrowserActivitySessionStore(): ActivitySessionStore {
  if (typeof window === 'undefined') {
    return createInMemoryActivitySessionStore();
  }

  if (hasFirebaseConfig()) {
    return createFirestoreActivitySessionStore();
  }

  return createLocalStorageActivitySessionStore();
}

function createLocalStorageActivitySessionStore(): ActivitySessionStore {
  return {
    async save(session) {
      const sessions = readSessions();
      writeSessions([
        session,
        ...sessions.filter((item) => item.id !== session.id),
      ]);
      return session;
    },
    async listByActivity(activityId) {
      return readSessions().filter((session) => session.activityId === activityId);
    },
    async findById(sessionId) {
      return readSessions().find((session) => session.id === sessionId) ?? null;
    },
  };
}

function readSessions(): ActivitySession[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as ActivitySession[];
}

function writeSessions(sessions: ActivitySession[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(sessions));
}

function createFirestoreActivitySessionStore(): ActivitySessionStore {
  return {
    async save(session) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'sessions', session.id), session);
      return session;
    },
    async listByActivity(activityId) {
      const { collection, getDocs, query, where } = await import(
        'firebase/firestore'
      );
      const snapshot = await getDocs(
        query(
          collection(getFirestoreDb(), 'sessions'),
          where('activityId', '==', activityId),
        ),
      );

      return snapshot.docs.map((item) => item.data() as ActivitySession);
    },
    async findById(sessionId) {
      const { doc, getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(doc(getFirestoreDb(), 'sessions', sessionId));

      return snapshot.exists() ? (snapshot.data() as ActivitySession) : null;
    },
  };
}
