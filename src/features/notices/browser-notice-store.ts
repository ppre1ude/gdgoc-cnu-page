'use client';

import type { Notice } from '@/domain/notice';
import {
  type NoticeStore,
  createInMemoryNoticeStore,
} from '@/domain/notice-service';
import {
  listProductionFirestoreDocuments,
  resolveBrowserDataAdapterMode,
} from '@/domain/data-adapter-split';
import {
  getReadablePublishedVisibilities,
  shouldUseUnfilteredContentRead,
} from '@/domain/role-access-policy';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedNotices } from './seed-notices';

const storageKey = 'gdgoc-cnu.notices';

export function createBrowserNoticeStore(): NoticeStore {
  const adapterMode = resolveBrowserDataAdapterMode({
    firebaseConfigured: hasFirebaseConfig(),
    hasBrowserRuntime: typeof window !== 'undefined',
  });

  if (adapterMode === 'production_firestore') {
    return createFirestoreNoticeStore();
  }

  return adapterMode === 'server_demo_memory'
    ? createInMemoryNoticeStore(seedNotices)
    : createLocalStorageNoticeStore();
}

function createLocalStorageNoticeStore(): NoticeStore {
  ensureSeededLocalStorage();

  return {
    async create(notice) {
      const notices = readNotices();
      writeNotices([notice, ...notices]);
      return notice;
    },
    async save(notice) {
      const notices = readNotices();
      const index = notices.findIndex((current) => current.id === notice.id);

      if (index === -1) {
        writeNotices([notice, ...notices]);
        return notice;
      }

      const nextNotices = [...notices];
      nextNotices[index] = notice;
      writeNotices(nextNotices);
      return notice;
    },
    async list() {
      return readNotices();
    },
  };
}

function ensureSeededLocalStorage() {
  if (!window.localStorage.getItem(storageKey)) {
    writeNotices(seedNotices);
  }
}

function readNotices(): Notice[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as Notice[];
}

function writeNotices(notices: Notice[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(notices));
}

function createFirestoreNoticeStore(): NoticeStore {
  return {
    async create(notice) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'notices', notice.id), notice);
      return notice;
    },
    async save(notice) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'notices', notice.id), notice);
      return notice;
    },
    async list(role) {
      const { collection, getDocs, query, where } = await import(
        'firebase/firestore'
      );
      const noticesCollection = collection(getFirestoreDb(), 'notices');
      const snapshot = await getDocs(
        shouldUseUnfilteredContentRead(role)
          ? noticesCollection
          : query(
              noticesCollection,
              where('status', '==', 'published'),
              where(
                'visibility',
                'in',
                getReadablePublishedVisibilities(role ?? 'visitor'),
              ),
            ),
      );

      return listProductionFirestoreDocuments(snapshot, (data) => data as Notice);
    },
  };
}
