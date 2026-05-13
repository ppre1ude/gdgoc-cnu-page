'use client';

import type { ChapterRecord } from '@/domain/chapter-record';
import {
  type ChapterRecordStore,
  createInMemoryChapterRecordStore,
} from '@/domain/chapter-record-service';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedChapterRecords } from './seed-chapter-records';

const storageKey = 'gdgoc-cnu.chapterRecords';

export function createBrowserChapterRecordStore(): ChapterRecordStore {
  if (typeof window === 'undefined') {
    return createInMemoryChapterRecordStore(seedChapterRecords);
  }

  if (hasFirebaseConfig()) {
    return createFirestoreChapterRecordStore();
  }

  return createLocalStorageChapterRecordStore();
}

function createLocalStorageChapterRecordStore(): ChapterRecordStore {
  ensureSeededLocalStorage();

  return {
    async create(record) {
      const records = readRecords();
      writeRecords([record, ...records]);
      return record;
    },
    async save(record) {
      const records = readRecords();
      const index = records.findIndex((current) => current.id === record.id);

      if (index === -1) {
        writeRecords([record, ...records]);
        return record;
      }

      const nextRecords = [...records];
      nextRecords[index] = record;
      writeRecords(nextRecords);
      return record;
    },
    async list() {
      return readRecords();
    },
  };
}

function ensureSeededLocalStorage() {
  if (!window.localStorage.getItem(storageKey)) {
    writeRecords(seedChapterRecords);
    return;
  }

  writeRecords(mergeSeedRecords(readRecords()));
}

function readRecords(): ChapterRecord[] {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ChapterRecord[];
  } catch {
    return [];
  }
}

function writeRecords(records: ChapterRecord[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(records));
}

function mergeSeedRecords(records: ChapterRecord[]): ChapterRecord[] {
  const seedById = new Map(
    seedChapterRecords.map((record) => [record.id, record]),
  );
  const recordIds = new Set(records.map((record) => record.id));
  const mergedRecords = records.map((record) => {
    const seedRecord = seedById.get(record.id);

    if (!seedRecord) {
      return record;
    }

    return {
      ...seedRecord,
      ...record,
      tags: record.tags?.length ? record.tags : seedRecord.tags,
    };
  });
  const missingSeedRecords = seedChapterRecords.filter(
    (record) => !recordIds.has(record.id),
  );

  return [...mergedRecords, ...missingSeedRecords];
}

function createFirestoreChapterRecordStore(): ChapterRecordStore {
  return {
    async create(record) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'chapterRecords', record.id), record);
      return record;
    },
    async save(record) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'chapterRecords', record.id), record);
      return record;
    },
    async list() {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(getFirestoreDb(), 'chapterRecords'));

      if (snapshot.empty) {
        return seedChapterRecords;
      }

      return snapshot.docs.map((item) => item.data() as ChapterRecord);
    },
  };
}

