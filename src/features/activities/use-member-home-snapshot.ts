'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UserRole } from '@/domain/activity';
import {
  buildMemberHomeSnapshot,
  isMemberHomeSnapshotCurrent,
  type MemberHomeSnapshot,
} from '@/domain/member-home-snapshot';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { createBrowserActivityApplicationStore } from './browser-activity-application-store';
import { createBrowserActivityStore } from './browser-activity-store';
import { createBrowserNoticeStore } from '../notices/browser-notice-store';
import { createBrowserShowcaseStore } from '../showcases/browser-showcase-store';
import { createBrowserChapterRecordStore } from '../records/browser-chapter-record-store';

export function useMemberHomeSnapshot() {
  const authSession = useAuthSession();
  const activityStore = useMemo(() => createBrowserActivityStore(), []);
  const applicationStore = useMemo(
    () => createBrowserActivityApplicationStore(),
    [],
  );
  const noticeStore = useMemo(() => createBrowserNoticeStore(), []);
  const showcaseStore = useMemo(() => createBrowserShowcaseStore(), []);
  const recordStore = useMemo(() => createBrowserChapterRecordStore(), []);
  const [snapshot, setSnapshot] = useState<MemberHomeSnapshot | null>(null);

  const refreshMemberHome = useCallback(
    async (currentRole: UserRole, currentUserId: string) => {
      setSnapshot(
        await buildMemberHomeSnapshot({
          activityStore,
          applicationStore,
          noticeStore,
          recordStore,
          role: currentRole,
          showcaseStore,
          userId: currentUserId,
        }),
      );
    },
    [
      activityStore,
      applicationStore,
      noticeStore,
      recordStore,
      showcaseStore,
    ],
  );

  useEffect(() => {
    if (authSession.status === 'loading') {
      return;
    }

    void refreshMemberHome(authSession.role, authSession.userId);
  }, [
    authSession.role,
    authSession.status,
    authSession.userId,
    refreshMemberHome,
  ]);

  const currentSnapshot = isMemberHomeSnapshotCurrent(snapshot, {
    role: authSession.role,
    userId: authSession.userId,
  })
    ? snapshot
    : null;

  return {
    ...authSession,
    applicationStore,
    refreshMemberHome,
    snapshot: currentSnapshot,
  };
}
