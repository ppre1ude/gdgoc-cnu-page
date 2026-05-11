'use client';

import type { ActivityApplication } from '@/domain/activity-application';
import {
  type ActivityApplicationStore,
  createInMemoryActivityApplicationStore,
} from '@/domain/activity-participation-service';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';

const storageKey = 'gdgoc-cnu.activityApplications';

export function createBrowserActivityApplicationStore(): ActivityApplicationStore {
  if (typeof window === 'undefined') {
    return createInMemoryActivityApplicationStore();
  }

  if (hasFirebaseConfig()) {
    return createFirestoreActivityApplicationStore();
  }

  return createLocalStorageActivityApplicationStore();
}

function createLocalStorageActivityApplicationStore(): ActivityApplicationStore {
  return {
    async save(application) {
      const applications = readApplications();
      writeApplications([
        application,
        ...applications.filter((item) => item.id !== application.id),
      ]);
      return application;
    },
    async listByUser(userId) {
      return readApplications().filter((application) => application.userId === userId);
    },
    async listByActivity(activityId) {
      return readApplications().filter(
        (application) => application.activityId === activityId,
      );
    },
    async findByActivityAndUser(activityId, userId) {
      return (
        readApplications().find(
          (application) =>
            application.activityId === activityId && application.userId === userId,
        ) ?? null
      );
    },
  };
}

function readApplications(): ActivityApplication[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as ActivityApplication[];
}

function writeApplications(applications: ActivityApplication[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(applications));
}

function createFirestoreActivityApplicationStore(): ActivityApplicationStore {
  return {
    async save(application) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(getFirestoreDb(), 'activityApplications', application.id),
        application,
      );
      return application;
    },
    async listByUser(userId) {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const snapshot = await getDocs(
        query(
          collection(getFirestoreDb(), 'activityApplications'),
          where('userId', '==', userId),
        ),
      );

      return snapshot.docs.map((item) => item.data() as ActivityApplication);
    },
    async listByActivity(activityId) {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const snapshot = await getDocs(
        query(
          collection(getFirestoreDb(), 'activityApplications'),
          where('activityId', '==', activityId),
        ),
      );

      return snapshot.docs.map((item) => item.data() as ActivityApplication);
    },
    async findByActivityAndUser(activityId, userId) {
      const { doc, getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(
        doc(getFirestoreDb(), 'activityApplications', `${activityId}_${userId}`),
      );

      return snapshot.exists() ? (snapshot.data() as ActivityApplication) : null;
    },
  };
}
