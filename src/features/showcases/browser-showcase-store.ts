'use client';

import type { Showcase } from '@/domain/showcase';
import { normalizeShowcase, normalizeShowcases } from '@/domain/showcase';
import {
  type ShowcaseStore,
  createInMemoryShowcaseStore,
} from '@/domain/showcase-service';
import {
  listProductionFirestoreDocuments,
  resolveBrowserDataAdapterMode,
} from '@/domain/data-adapter-split';
import {
  getReadablePublishedVisibilities,
  shouldUseUnfilteredContentRead,
} from '@/domain/role-access-policy';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedShowcases } from './seed-showcases';

const storageKey = 'gdgoc-cnu.showcases';

export function createBrowserShowcaseStore(): ShowcaseStore {
  const adapterMode = resolveBrowserDataAdapterMode({
    firebaseConfigured: hasFirebaseConfig(),
    hasBrowserRuntime: typeof window !== 'undefined',
  });

  if (adapterMode === 'production_firestore') {
    return createFirestoreShowcaseStore();
  }

  return adapterMode === 'server_demo_memory'
    ? createInMemoryShowcaseStore(seedShowcases)
    : createLocalStorageShowcaseStore();
}

function createLocalStorageShowcaseStore(): ShowcaseStore {
  ensureSeededLocalStorage();

  return {
    async create(showcase) {
      const safeShowcase = normalizeShowcase(showcase);
      const showcases = readShowcases();
      writeShowcases([safeShowcase, ...showcases]);
      return safeShowcase;
    },
    async list() {
      return readShowcases();
    },
  };
}

function ensureSeededLocalStorage() {
  if (!window.localStorage.getItem(storageKey)) {
    writeShowcases(seedShowcases);
    return;
  }

  writeShowcases(mergeSeedShowcases(readShowcases()));
}

function readShowcases(): Showcase[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  try {
    return normalizeShowcases(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeShowcases(showcases: Showcase[]) {
  window.localStorage.setItem(
    storageKey,
    JSON.stringify(showcases.map((showcase) => normalizeShowcase(showcase))),
  );
}

function mergeSeedShowcases(showcases: Showcase[]): Showcase[] {
  const seedById = new Map(
    seedShowcases.map((showcase) => [showcase.id, showcase]),
  );
  const showcaseIds = new Set(showcases.map((showcase) => showcase.id));
  const mergedShowcases = showcases.map((showcase) => {
    const seedShowcase = seedById.get(showcase.id);

    if (!seedShowcase) {
      return showcase;
    }

    return {
      ...seedShowcase,
      ...showcase,
      tags: showcase.tags.length > 0 ? showcase.tags : seedShowcase.tags,
    };
  });
  const missingSeedShowcases = seedShowcases.filter(
    (showcase) => !showcaseIds.has(showcase.id),
  );

  return [...mergedShowcases, ...missingSeedShowcases];
}

function createFirestoreShowcaseStore(): ShowcaseStore {
  return {
    async create(showcase) {
      const safeShowcase = normalizeShowcase(showcase);
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'showcases', safeShowcase.id), safeShowcase);
      return safeShowcase;
    },
    async list(role) {
      const { collection, getDocs, query, where } = await import(
        'firebase/firestore'
      );
      const showcasesCollection = collection(getFirestoreDb(), 'showcases');
      const snapshot = await getDocs(
        shouldUseUnfilteredContentRead(role)
          ? showcasesCollection
          : query(
              showcasesCollection,
              where('status', '==', 'published'),
              where(
                'visibility',
                'in',
                getReadablePublishedVisibilities(role ?? 'visitor'),
              ),
            ),
      );

      return normalizeShowcases(listProductionFirestoreDocuments(snapshot));
    },
  };
}
