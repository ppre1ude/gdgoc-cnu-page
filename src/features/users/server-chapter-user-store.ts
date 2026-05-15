import type { ChapterUser, RoleChangeLog } from '@/domain/chapter-user';
import type { ChapterUserStore } from '@/domain/chapter-user-service';
import { getFirebaseAdminDb } from '@/lib/firebase/server';

const chapterUsersCollection = 'chapterUsers';
const roleChangeLogsCollection = 'roleChangeLogs';

export function createServerChapterUserStore(): ChapterUserStore {
  const db = getFirebaseAdminDb();

  return {
    async saveUser(user) {
      await db.collection(chapterUsersCollection).doc(user.id).set(user);
      return user;
    },
    async listUsers() {
      const snapshot = await db.collection(chapterUsersCollection).get();

      return snapshot.docs.map((item) => item.data() as ChapterUser);
    },
    async findUser(userId) {
      const snapshot = await db.collection(chapterUsersCollection).doc(userId).get();

      return snapshot.exists ? (snapshot.data() as ChapterUser) : null;
    },
    async saveRoleChangeLog(log) {
      await db.collection(roleChangeLogsCollection).doc(log.id).set(log);
      return log;
    },
    async listRoleChangeLogs() {
      const snapshot = await db.collection(roleChangeLogsCollection).get();

      return snapshot.docs.map((item) => item.data() as RoleChangeLog);
    },
  };
}
