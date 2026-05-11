'use client';

import type { Notice } from '@/domain/notice';
import {
  type NoticeStore,
  createInMemoryNoticeStore,
} from '@/domain/notice-service';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedNotices } from './seed-notices';

const storageKey = 'gdgoc-cnu.notices';

export function createBrowserNoticeStore(): NoticeStore {
  if (typeof window === 'undefined') {
    return createInMemoryNoticeStore(seedNotices);
  }

  if (hasFirebaseConfig()) {
    return createFirestoreNoticeStore();
  }

  return createLocalStorageNoticeStore();
}

function createLocalStorageNoticeStore(): NoticeStore {
  ensureSeededLocalStorage();

  return {
    async create(notice) {
      const notices = readNotices();
      writeNotices([notice, ...notices]);
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
    async list() {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(getFirestoreDb(), 'notices'));

      if (snapshot.empty) {
        return seedNotices;
      }

      return snapshot.docs.map((item) => item.data() as Notice);
    },
  };
}
