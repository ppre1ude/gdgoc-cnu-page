'use client';

import type { ChapterUser, RoleChangeLog } from '@/domain/chapter-user';
import {
  type ChapterUserStore,
  createInMemoryChapterUserStore,
} from '@/domain/chapter-user-service';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { seedChapterUsers } from './seed-chapter-users';

const usersStorageKey = 'gdgoc-cnu.chapterUsers';
const roleChangeLogsStorageKey = 'gdgoc-cnu.roleChangeLogs';

export function createBrowserChapterUserStore(): ChapterUserStore {
  if (typeof window === 'undefined') {
    return createInMemoryChapterUserStore(seedChapterUsers);
  }

  if (hasFirebaseConfig()) {
    return createFirestoreChapterUserStore();
  }

  return createLocalStorageChapterUserStore();
}

function createLocalStorageChapterUserStore(): ChapterUserStore {
  ensureSeededLocalStorage();

  return {
    async saveUser(user) {
      const users = readUsers();
      writeUsers([user, ...users.filter((item) => item.id !== user.id)]);
      return user;
    },
    async listUsers() {
      return readUsers();
    },
    async findUser(userId) {
      return readUsers().find((user) => user.id === userId) ?? null;
    },
    async saveRoleChangeLog(log) {
      const logs = readRoleChangeLogs();
      writeRoleChangeLogs([log, ...logs.filter((item) => item.id !== log.id)]);
      return log;
    },
    async listRoleChangeLogs() {
      return readRoleChangeLogs();
    },
  };
}

function ensureSeededLocalStorage() {
  if (!window.localStorage.getItem(usersStorageKey)) {
    writeUsers(seedChapterUsers);
  }

  if (!window.localStorage.getItem(roleChangeLogsStorageKey)) {
    writeRoleChangeLogs([]);
  }
}

function readUsers(): ChapterUser[] {
  const raw = window.localStorage.getItem(usersStorageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as ChapterUser[];
}

function writeUsers(users: ChapterUser[]) {
  window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function readRoleChangeLogs(): RoleChangeLog[] {
  const raw = window.localStorage.getItem(roleChangeLogsStorageKey);

  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as RoleChangeLog[];
}

function writeRoleChangeLogs(logs: RoleChangeLog[]) {
  window.localStorage.setItem(roleChangeLogsStorageKey, JSON.stringify(logs));
}

function createFirestoreChapterUserStore(): ChapterUserStore {
  return {
    async saveUser(user) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'chapterUsers', user.id), user);
      return user;
    },
    async listUsers() {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(getFirestoreDb(), 'chapterUsers'));

      if (snapshot.empty) {
        return seedChapterUsers;
      }

      return snapshot.docs.map((item) => item.data() as ChapterUser);
    },
    async findUser(userId) {
      const { doc, getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(doc(getFirestoreDb(), 'chapterUsers', userId));

      return snapshot.exists() ? (snapshot.data() as ChapterUser) : null;
    },
    async saveRoleChangeLog(log) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(getFirestoreDb(), 'roleChangeLogs', log.id), log);
      return log;
    },
    async listRoleChangeLogs() {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(getFirestoreDb(), 'roleChangeLogs'));

      return snapshot.docs.map((item) => item.data() as RoleChangeLog);
    },
  };
}
