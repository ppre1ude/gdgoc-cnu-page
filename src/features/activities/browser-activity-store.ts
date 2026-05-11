'use client';

import {
  type ActivityStore,
  createInMemoryActivityStore,
} from '@/domain/activity-service';
import type { Activity } from '@/domain/activity';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedActivities } from './seed-activities';

const storageKey = 'gdgoc-cnu.activities';

export function createBrowserActivityStore(): ActivityStore {
  if (typeof window === 'undefined') {
    return createInMemoryActivityStore(seedActivities);
  }

  if (hasFirebaseConfig()) {
    return createFirestoreActivityStore();
  }

  return createLocalStorageActivityStore();
}

function createLocalStorageActivityStore(): ActivityStore {
  ensureSeededLocalStorage();

  return {
    async create(activity) {
      const activities = readActivities();
      writeActivities([activity, ...activities]);
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
    async list() {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(getFirestoreDb(), 'activities'));

      if (snapshot.empty) {
        return seedActivities;
      }

      return snapshot.docs.map((item) => item.data() as Activity);
    },
  };
}
