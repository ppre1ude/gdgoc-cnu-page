'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ChapterUser, RoleChangeLog } from '@/domain/chapter-user';
import {
  approveGuestToMember,
  listPendingGuestUsers,
} from '@/domain/chapter-user-service';
import { WdsButton } from '@/components/wds-form-controls';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { formatKoreanDate } from '@/lib/format-korean-date-time';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { seedChapterUsers } from '../users/seed-chapter-users';

export function MemberApprovalPanel() {
  const { role, userId } = useAuthSession();
  const store = useMemo(() => createBrowserChapterUserStore(), []);
  const [pendingUsers, setPendingUsers] = useState<ChapterUser[]>(
    seedChapterUsers.filter((user) => user.role === 'guest'),
  );
  const [roleChangeLogs, setRoleChangeLogs] = useState<RoleChangeLog[]>([]);
  const [message, setMessage] = useState(
    '가입 직후 guest인 사용자를 member로 승인하는 운영진 흐름입니다.',
  );

  useEffect(() => {
    void refreshApprovalQueue();
  }, []);

  async function refreshApprovalQueue() {
    const [nextPendingUsers, nextRoleChangeLogs] = await Promise.all([
      listPendingGuestUsers(store),
      store.listRoleChangeLogs(),
    ]);

    setPendingUsers(nextPendingUsers);
    setRoleChangeLogs(nextRoleChangeLogs);
  }

  async function approveUser(user: ChapterUser) {
    const confirmed = window.confirm(
      `${user.displayName}님을 member로 승인하시겠습니까?`,
    );

    if (!confirmed) {
      return;
    }

    await approveGuestToMember(store, {
      actorId: userId,
      actorRole: role,
      now: new Date().toISOString(),
      targetUserId: user.id,
    });

    setMessage(`${user.displayName}님을 member로 승인했습니다.`);
    await refreshApprovalQueue();
  }

  return (
    <section className="section section-compact">
      <div className="section-header">
        <div>
          <h2>멤버 승인</h2>
          <p>
            운영진이 guest 계정을 member로 승격하는 기본 권한 흐름입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <span className="badge badge-green">Approval Queue</span>
          <h3>{pendingUsers.length}명 승인 대기</h3>
          <p>{message}</p>
        </div>
        <div className="card">
          <span className="badge badge-blue">Role Logs</span>
          <h3>{roleChangeLogs.length}건 기록됨</h3>
          <p>
            승인 작업은 actor, target, 이전 role, 다음 role과 함께 저장됩니다.
          </p>
        </div>
      </div>

      <div className="member-approval-list" style={{ marginTop: 16 }}>
        {pendingUsers.length > 0 ? (
          pendingUsers.map((user) => (
            <article className="member-approval-row" key={user.id}>
              <div>
                <div className="badge-row">
                  <span className="badge">Guest</span>
                  <span className="badge">
                    {formatKoreanDate(user.createdAt)} 가입
                  </span>
                  {user.profileSubmittedAt ? (
                    <span className="badge badge-blue">
                      {formatKoreanDate(user.profileSubmittedAt)} 제출
                    </span>
                  ) : (
                    <span className="badge">프로필 미제출</span>
                  )}
                </div>
                <strong>{user.displayName}</strong>
                <p>{user.email}</p>
                <GuestProfileSummary user={user} />
              </div>
              <WdsButton
                onClick={() => approveUser(user)}
                size="small"
                tone="primary"
                type="button"
              >
                member 승인
              </WdsButton>
            </article>
          ))
        ) : (
          <div className="empty">승인 대기 중인 guest가 없습니다.</div>
        )}
      </div>
    </section>
  );
}

function GuestProfileSummary({ user }: { user: ChapterUser }) {
  const profileItems = [
    ['학과', user.department],
    ['기수', user.cohort],
    ['학번', user.studentId],
    ['관심 분야', user.interests],
    ['참여 동기', user.motivation],
  ].filter(([, value]) => Boolean(value));

  if (profileItems.length === 0) {
    return (
      <p className="helper-text">
        아직 제출된 승인 요청 프로필 정보가 없습니다.
      </p>
    );
  }

  return (
    <dl className="profile-summary-list">
      {profileItems.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
