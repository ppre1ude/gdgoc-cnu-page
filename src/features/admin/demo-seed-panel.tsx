'use client';

import { useMemo, useState } from 'react';

import type { Activity } from '@/domain/activity';
import type { ChapterRecord } from '@/domain/chapter-record';
import type { ChapterUser } from '@/domain/chapter-user';
import {
  type DemoSeedDocument,
  type DemoSeedResult,
  seedMissingDocuments,
} from '@/domain/demo-seed';
import type { Notice } from '@/domain/notice';
import type { Showcase } from '@/domain/showcase';
import { loadOrSyncDefaultActivitySession } from '@/domain/activity-session';
import { WdsBadge, WdsButton, WdsNotice } from '@/components/wds-form-controls';
import {
  WdsOffset,
  WdsResponsiveGrid,
  WdsSectionHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { formatKoreanDateTime } from '@/lib/format-korean-date-time';
import { getFirestoreDb, hasFirebaseConfig } from '@/lib/firebase/client';
import { createBrowserActivityStore } from '@/features/activities/browser-activity-store';
import { createBrowserActivitySessionStore } from '@/features/activities/browser-activity-session-store';
import { seedActivities } from '@/features/activities/seed-activities';
import { seedNotices } from '@/features/notices/seed-notices';
import { createBrowserNoticeStore } from '@/features/notices/browser-notice-store';
import { createBrowserShowcaseStore } from '@/features/showcases/browser-showcase-store';
import { seedShowcases } from '@/features/showcases/seed-showcases';
import { createBrowserChapterRecordStore } from '@/features/records/browser-chapter-record-store';
import { seedChapterRecords } from '@/features/records/seed-chapter-records';
import { createBrowserChapterUserStore } from '@/features/users/browser-chapter-user-store';
import { seedChapterUsers } from '@/features/users/seed-chapter-users';

type DemoSeedSummary = {
  mode: 'firestore' | 'localStorage';
  results: DemoSeedResult[];
  sessionSyncCount: number;
  completedAt: string;
};

export function DemoSeedPanel() {
  const activityStore = useMemo(() => createBrowserActivityStore(), []);
  const noticeStore = useMemo(() => createBrowserNoticeStore(), []);
  const showcaseStore = useMemo(() => createBrowserShowcaseStore(), []);
  const recordStore = useMemo(() => createBrowserChapterRecordStore(), []);
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const sessionStore = useMemo(() => createBrowserActivitySessionStore(), []);
  const [summary, setSummary] = useState<DemoSeedSummary | null>(null);
  const [message, setMessage] = useState(
    '발표용 seed 데이터는 기존 문서를 덮어쓰지 않고 누락된 seed id만 채웁니다.',
  );
  const [isSeeding, setIsSeeding] = useState(false);

  async function seedDemoData() {
    setIsSeeding(true);
    setMessage('Demo 데이터를 확인하고 누락된 문서를 저장하는 중입니다.');

    try {
      const mode = hasFirebaseConfig() ? 'firestore' : 'localStorage';
      const results =
        mode === 'firestore'
          ? await seedFirestoreDemoData()
          : await seedLocalDemoData({
              activityStore,
              noticeStore,
              recordStore,
              showcaseStore,
              userStore,
            });
      const sessions = await Promise.all(
        seedActivities.map((activity) =>
          loadOrSyncDefaultActivitySession(sessionStore, activity),
        ),
      );
      const sessionSyncCount = sessions.filter(Boolean).length;

      setSummary({
        completedAt: new Date().toISOString(),
        mode,
        results,
        sessionSyncCount,
      });
      setMessage(
        mode === 'firestore'
          ? 'Firestore에 누락된 demo 문서를 채웠습니다.'
          : 'localStorage demo bridge에 누락된 demo 문서를 채웠습니다.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Demo 데이터 저장 실패: ${error.message}`
          : 'Demo 데이터 저장에 실패했습니다.',
      );
    } finally {
      setIsSeeding(false);
    }
  }

  const createdCount =
    summary?.results.reduce((total, result) => total + result.createdIds.length, 0) ??
    0;
  const skippedCount =
    summary?.results.reduce((total, result) => total + result.skippedIds.length, 0) ??
    0;

  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description={
          <>
            발표 전에 seed 데이터를 안전하게 채웁니다. Firebase 연결 전에는 전체
            local demo bridge를, Firebase 연결 후에는 rules가 허용하는 운영
            콘텐츠를 Firestore에 저장합니다.
          </>
        }
        title="Demo Data"
        trailingContent={
          <WdsButton
            disabled={isSeeding}
            onClick={seedDemoData}
            tone="primary"
            type="button"
          >
            {isSeeding ? '채우는 중' : 'Demo 데이터 채우기'}
          </WdsButton>
        }
      />

      <WdsNotice>
        <strong>{hasFirebaseConfig() ? 'Firestore seed 모드' : 'Local demo bridge 모드'}</strong>
        <p className="helper-text helper-text-caution">
          {message}
        </p>
        {hasFirebaseConfig() ? (
          <p className="helper-text helper-text-caution">
            Firestore 모드에서는 activities, notices, showcases와 기본 sessions를
            채웁니다. chapterUsers와 chapterRecords는 보안 규칙상 로그인/승인
            흐름 또는 수동 bootstrap으로 준비합니다.
          </p>
        ) : null}
      </WdsNotice>

      {summary ? (
        <WdsResponsiveGrid columns={3} offset="sm">
          <WdsSurfaceCard as="article">
            <WdsBadge tone="green">Created</WdsBadge>
            <h3>{createdCount}개 문서 추가</h3>
            <p>
              이미 존재하지 않는 seed id만 저장했습니다. 기존 문서 내용은
              유지됩니다.
            </p>
          </WdsSurfaceCard>
          <WdsSurfaceCard as="article">
            <WdsBadge tone="blue">Skipped</WdsBadge>
            <h3>{skippedCount}개 문서 유지</h3>
            <p>같은 seed id가 이미 있으면 다시 쓰지 않습니다.</p>
          </WdsSurfaceCard>
          <WdsSurfaceCard as="article">
            <WdsBadge>Sessions</WdsBadge>
            <h3>{summary.sessionSyncCount}개 기본 세션 확인</h3>
            <p>일정이 있는 seed activity에 기본 출석 세션을 연결했습니다.</p>
          </WdsSurfaceCard>
        </WdsResponsiveGrid>
      ) : null}

      {summary ? (
        <WdsOffset offset="sm">
          <WdsNotice>
            <strong>
              {summary.mode === 'firestore' ? 'Firestore' : 'localStorage'} seed 결과 ·{' '}
              {formatKoreanDateTime(summary.completedAt)}
            </strong>
            <ul className="helper-list">
              {summary.results.map((result) => (
                <li key={result.collection}>
                  {result.collection}: 추가 {result.createdIds.length}개, 유지{' '}
                  {result.skippedIds.length}개
                </li>
              ))}
            </ul>
          </WdsNotice>
        </WdsOffset>
      ) : null}
    </section>
  );
}

async function seedLocalDemoData({
  activityStore,
  noticeStore,
  recordStore,
  showcaseStore,
  userStore,
}: {
  activityStore: ReturnType<typeof createBrowserActivityStore>;
  noticeStore: ReturnType<typeof createBrowserNoticeStore>;
  recordStore: ReturnType<typeof createBrowserChapterRecordStore>;
  showcaseStore: ReturnType<typeof createBrowserShowcaseStore>;
  userStore: ReturnType<typeof createBrowserChapterUserStore>;
}) {
  return Promise.all([
    seedMissingDocuments<Activity>({
      collection: 'activities',
      seeds: seedActivities,
      listExisting: () => activityStore.list('admin'),
      writeSeed: (seed) => activityStore.create(seed),
    }),
    seedMissingDocuments<Notice>({
      collection: 'notices',
      seeds: seedNotices,
      listExisting: () => noticeStore.list('admin'),
      writeSeed: (seed) => noticeStore.create(seed),
    }),
    seedMissingDocuments<Showcase>({
      collection: 'showcases',
      seeds: seedShowcases,
      listExisting: () => showcaseStore.list('admin'),
      writeSeed: (seed) => showcaseStore.create(seed),
    }),
    seedMissingDocuments<ChapterRecord>({
      collection: 'chapterRecords',
      seeds: seedChapterRecords,
      listExisting: () => recordStore.list('admin'),
      writeSeed: (seed) => recordStore.create(seed),
    }),
    seedMissingDocuments<ChapterUser>({
      collection: 'chapterUsers',
      seeds: seedChapterUsers,
      listExisting: () => userStore.listUsers(),
      writeSeed: (seed) => userStore.saveUser(seed),
    }),
  ]);
}

async function seedFirestoreDemoData() {
  return Promise.all([
    seedFirestoreCollection('activities', seedActivities),
    seedFirestoreCollection('notices', seedNotices),
    seedFirestoreCollection('showcases', seedShowcases),
  ]);
}

async function seedFirestoreCollection<TDocument extends DemoSeedDocument>(
  collectionPath: string,
  seeds: TDocument[],
) {
  const {
    collection: firestoreCollection,
    doc,
    getDocs,
    setDoc,
  } = await import('firebase/firestore');
  const database = getFirestoreDb();
  const snapshot = await getDocs(firestoreCollection(database, collectionPath));
  const existingDocuments = snapshot.docs.map(
    (documentSnapshot) =>
      ({
        id: documentSnapshot.id,
      }) as TDocument,
  );

  return seedMissingDocuments<TDocument>({
    collection: collectionPath,
    seeds,
    listExisting: async () => existingDocuments,
    writeSeed: async (seed) => {
      await setDoc(doc(database, collectionPath, seed.id), seed);
      return seed;
    },
  });
}
