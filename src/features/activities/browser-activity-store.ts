'use client';

import {
  type ActivityStore,
  createInMemoryActivityStore,
} from '@/domain/activity-service';
import type { Activity } from '@/domain/activity';
import {
  listProductionFirestoreDocuments,
  resolveBrowserDataAdapterMode,
} from '@/domain/data-adapter-split';
import {
  getReadablePublishedVisibilities,
  shouldUseUnfilteredContentRead,
} from '@/domain/role-access-policy';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedActivities } from './seed-activities';

const storageKey = 'gdgoc-cnu.activities';

export function createBrowserActivityStore(): ActivityStore {
  const adapterMode = resolveBrowserDataAdapterMode({
    firebaseConfigured: hasFirebaseConfig(),
    hasBrowserRuntime: typeof window !== 'undefined',
  });

  if (adapterMode === 'production_firestore') {
    return createFirestoreActivityStore();
  }

  return adapterMode === 'server_demo_memory'
    ? createInMemoryActivityStore(seedActivities)
    : createLocalStorageActivityStore();
}

function createLocalStorageActivityStore(): ActivityStore {
  ensureSeededLocalStorage();

  return {
    async create(activity) {
      const activities = readActivities();
      writeActivities([activity, ...activities]);
      return activity;
    },
    async save(activity) {
      const activities = readActivities();
      const index = activities.findIndex((current) => current.id === activity.id);

      if (index === -1) {
        writeActivities([activity, ...activities]);
        return activity;
      }

      const nextActivities = [...activities];
      nextActivities[index] = activity;
      writeActivities(nextActivities);
      return activity;
    },
    async list() {
      return readActivities();
    },
  };
}

function ensureSeededLocalStorage() {
  if (!window.localStorage.getItem(storageKey)) {
    writeActivities(seedActivities);
    return;
  }

  writeActivities(mergeSeedActivities(readActivities()));
}

function readActivities(): Activity[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as Activity[];
}

function writeActivities(activities: Activity[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(activities));
}

function mergeSeedActivities(activities: Activity[]): Activity[] {
  const seedById = new Map(seedActivities.map((activity) => [activity.id, activity]));
  const activityIds = new Set(activities.map((activity) => activity.id));
  const mergedActivities = activities.map((activity) => {
    const seedActivity = seedById.get(activity.id);

    if (!seedActivity) {
      return activity;
    }

    return {
      ...seedActivity,
      ...activity,
      registrationMode: seedActivity.registrationMode ?? activity.registrationMode,
      externalRegistrationUrl:
        seedActivity.externalRegistrationUrl ?? activity.externalRegistrationUrl,
      externalRegistrationLabel:
        seedActivity.externalRegistrationLabel ?? activity.externalRegistrationLabel,
    };
  });
  const missingSeedActivities = seedActivities.filter(
    (activity) => !activityIds.has(activity.id),
  );

  return [...mergedActivities, ...missingSeedActivities];
}

function createFirestoreActivityStore(): ActivityStore {
  return {
    async create(activity) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'activities', activity.id), activity);
      return activity;
    },
    async save(activity) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'activities', activity.id), activity);
      return activity;
    },
    async list(role) {
      const { collection, getDocs, query, where } = await import(
        'firebase/firestore'
      );
      const activitiesCollection = collection(getFirestoreDb(), 'activities');
      const snapshot = await getDocs(
        shouldUseUnfilteredContentRead(role)
          ? activitiesCollection
          : query(
              activitiesCollection,
              where('status', '==', 'published'),
              where(
                'visibility',
                'in',
                getReadablePublishedVisibilities(role ?? 'visitor'),
              ),
            ),
      );

      return listProductionFirestoreDocuments(
        snapshot,
        (data) => data as Activity,
      );
    },
  };
}
