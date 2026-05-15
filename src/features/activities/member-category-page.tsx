'use client';

import Link from 'next/link';

import type { Activity } from '@/domain/activity';
import type { ActivityApplicationState } from '@/domain/activity-application';
import {
  applyForActivity,
  cancelApplicationForActivity,
  type MemberApplicationSummary,
} from '@/domain/activity-participation-service';
import {
  getMemberDashboardDestination,
  memberDashboardDestinations,
  type MemberDashboardDestinationId,
} from '@/domain/member-dashboard-destinations';
import { describeMemberHomeAccess } from '@/domain/member-access';
import type { Notice } from '@/domain/notice';
import type { ChapterRecord } from '@/domain/chapter-record';
import { ActivityCard } from '@/components/activity-card';
import { ChapterRecordCard } from '@/components/chapter-record-card';
import { NoticeBoard } from '@/components/notice-board';
import {
  WdsBadge,
  WdsEmptyState,
  WdsTextLinkButton,
} from '@/components/wds-form-controls';
import {
  WdsBadgeGroup,
  WdsPageHeader,
  WdsQueue,
  WdsQueueRow,
  WdsResponsiveGrid,
  WdsSectionHeader,
} from '@/components/wds-layout-primitives';
import { formatKoreanDateTime } from '@/lib/format-korean-date-time';
import { useMemberHomeSnapshot } from './use-member-home-snapshot';

type MemberCategoryPageProps = {
  category: MemberDashboardDestinationId;
};

export function MemberCategoryPage({ category }: MemberCategoryPageProps) {
  const {
    applicationStore,
    refreshMemberHome,
    role,
    snapshot,
    userId,
  } = useMemberHomeSnapshot();
  const destination = getMemberDashboardDestination(category);
  const access = describeMemberHomeAccess(role);
  const applicationStates = snapshot?.applicationStates ?? {};
  const canApplyToActivities =
    snapshot?.canApplyToActivities ?? access.canApplyToActivities;

  async function handleApply(activity: Activity) {
    const confirmed = window.confirm('이 활동에 참여 신청하시겠습니까?');

    if (!confirmed) {
      return;
    }

    await applyForActivity(applicationStore, {
      activityId: activity.id,
      now: new Date().toISOString(),
      userId,
    });
    await refreshMemberHome(role, userId);
  }

  async function handleCancel(activity: Activity) {
    const confirmed = window.confirm('신청을 취소하시겠습니까?');

    if (!confirmed) {
      return;
    }

    await cancelApplicationForActivity(applicationStore, {
      activityId: activity.id,
      cancellationAllowed: true,
      now: new Date().toISOString(),
      userId,
    });
    await refreshMemberHome(role, userId);
  }

  if (!destination) {
    return null;
  }

  return (
    <main className="page">
      <div className="container">
        <WdsPageHeader
          description={destination.description}
          eyebrow="Member Dashboard"
          title={destination.title}
        />

        <MemberFlowTabs activeId={category} />

        {renderCategoryContent({
          applicationStates,
          canApplyToActivities,
          category,
          handleApply,
          handleCancel,
          snapshot,
        })}
      </div>
    </main>
  );
}

function MemberFlowTabs({
  activeId,
}: {
  activeId: MemberDashboardDestinationId;
}) {
  return (
    <nav aria-label="Member dashboard branches" className="member-flow-tabs">
      {memberDashboardDestinations.map((destination) => (
        <Link
          aria-current={destination.id === activeId ? 'page' : undefined}
          className={
            destination.id === activeId
              ? 'member-flow-tab member-flow-tab-active'
              : 'member-flow-tab'
          }
          href={destination.href}
          key={destination.id}
        >
          {destination.label}
        </Link>
      ))}
    </nav>
  );
}

function renderCategoryContent({
  applicationStates,
  canApplyToActivities,
  category,
  handleApply,
  handleCancel,
  snapshot,
}: {
  applicationStates: Record<string, ActivityApplicationState>;
  canApplyToActivities: boolean;
  category: MemberDashboardDestinationId;
  handleApply: (activity: Activity) => void;
  handleCancel: (activity: Activity) => void;
  snapshot: ReturnType<typeof useMemberHomeSnapshot>['snapshot'];
}) {
  switch (category) {
    case 'calendar':
      return (
        <CalendarBranch
          activities={snapshot?.dashboard.calendarActivities ?? []}
          applicationStates={applicationStates}
          commitments={snapshot?.dashboard.myNextCommitments ?? []}
        />
      );
    case 'notices':
      return <NoticeBranch notices={snapshot?.notices ?? []} />;
    case 'studies':
      return (
        <ActivityBranch
          activities={(snapshot?.activities ?? []).filter(
            (activity) => activity.type === 'study',
          )}
          applicationStates={applicationStates}
          emptyMessage="현재 볼 수 있는 스터디가 없습니다."
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="스터디 목록"
        />
      );
    case 'projects':
      return (
        <ActivityBranch
          activities={(snapshot?.activities ?? []).filter(
            (activity) => activity.type === 'project',
          )}
          applicationStates={applicationStates}
          emptyMessage="현재 볼 수 있는 프로젝트가 없습니다."
          onApply={canApplyToActivities ? handleApply : undefined}
          onCancel={canApplyToActivities ? handleCancel : undefined}
          title="프로젝트 목록"
        />
      );
    case 'records':
      return <RecordBranch records={snapshot?.records ?? []} />;
  }
}

function CalendarBranch({
  activities,
  applicationStates,
  commitments,
}: {
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  commitments: MemberApplicationSummary[];
}) {
  return (
    <>
      <section className="section section-compact">
        <WdsSectionHeader
          description="앞으로 예정된 이벤트, 스터디 모임, 프로젝트 마일스톤을 시간순으로 확인합니다."
          title="전체 일정"
        />
        <ScheduleQueue
          activities={activities}
          applicationStates={applicationStates}
          emptyMessage="예정된 일정이 없습니다."
        />
      </section>

      <section className="section section-compact">
        <WdsSectionHeader
          description="내가 신청했거나 승인된 활동만 따로 모아 다음 행동을 확인합니다."
          title="내 다음 참여"
        />
        {commitments.length > 0 ? (
          <ScheduleQueue
            activities={commitments.map(({ activity }) => activity)}
            applicationStates={applicationStates}
            emptyMessage="아직 예정된 참여 항목이 없습니다."
          />
        ) : (
          <WdsEmptyState>아직 예정된 참여 항목이 없습니다.</WdsEmptyState>
        )}
      </section>
    </>
  );
}

function NoticeBranch({ notices }: { notices: Notice[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="대시보드에 보이던 중요 공지와 최근 공지를 전체 목록으로 확인합니다."
        title="공지사항"
      />
      <NoticeBoard notices={notices} />
    </section>
  );
}

function ActivityBranch({
  activities,
  applicationStates,
  emptyMessage,
  onApply,
  onCancel,
  title,
}: {
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  emptyMessage: string;
  onApply?: (activity: Activity) => void;
  onCancel?: (activity: Activity) => void;
  title: string;
}) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="상태, 일정, 신청 가능 여부를 보고 바로 상세 화면으로 이동합니다."
        title={title}
      />
      {activities.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {activities.map((activity) => (
            <ActivityCard
              activity={activity}
              applicationState={applicationStates[activity.id]}
              key={activity.id}
              onApply={onApply}
              onCancel={onCancel}
            />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>{emptyMessage}</WdsEmptyState>
      )}
    </section>
  );
}

function RecordBranch({ records }: { records: ChapterRecord[] }) {
  return (
    <section className="section section-compact">
      <WdsSectionHeader
        description="회고, 리뷰, 기술 노트처럼 Discord보다 오래 남길 챕터 기록을 모아봅니다."
        title="기록"
      />
      {records.length > 0 ? (
        <WdsResponsiveGrid columns={3}>
          {records.map((record) => (
            <ChapterRecordCard key={record.id} record={record} />
          ))}
        </WdsResponsiveGrid>
      ) : (
        <WdsEmptyState>아직 게시된 기록이 없습니다.</WdsEmptyState>
      )}
    </section>
  );
}

function ScheduleQueue({
  activities,
  applicationStates,
  emptyMessage,
}: {
  activities: Activity[];
  applicationStates: Record<string, ActivityApplicationState>;
  emptyMessage: string;
}) {
  if (activities.length === 0) {
    return <WdsEmptyState>{emptyMessage}</WdsEmptyState>;
  }

  return (
    <WdsQueue as="div">
      {activities.map((activity) => {
        const applicationState = applicationStates[activity.id];

        return (
          <WdsQueueRow
            actions={
              <WdsTextLinkButton
                href={`/activities/${encodeURIComponent(activity.id)}`}
              >
                자세히
              </WdsTextLinkButton>
            }
            as="article"
            key={activity.id}
          >
            <div>
              <WdsBadgeGroup>
                <WdsBadge tone="blue">{activity.type}</WdsBadge>
                {applicationState ? (
                  <WdsBadge tone="green">{applicationState}</WdsBadge>
                ) : null}
              </WdsBadgeGroup>
              <strong>{activity.title}</strong>
              <p className="helper-text">
                {activity.startsAt
                  ? formatKoreanDateTime(activity.startsAt)
                  : '일정 미정'}
              </p>
            </div>
          </WdsQueueRow>
        );
      })}
    </WdsQueue>
  );
}
