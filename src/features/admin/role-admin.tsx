'use client';

import { useEffect, useMemo, useState } from 'react';

import type { UserRole } from '@/domain/activity';
import type { ChapterUser, RoleChangeLog } from '@/domain/chapter-user';
import { changeUserRole } from '@/domain/chapter-user-service';
import {
  formatKoreanDate,
  formatKoreanDateTime,
} from '@/lib/format-korean-date-time';
import {
  WdsBadge,
  WdsButton,
  WdsField,
  WdsSelect,
} from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsDashboardLayout,
  WdsPageHeader,
  WdsResponsiveGrid,
  WdsSectionHeader,
  WdsStack,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { seedChapterUsers } from '../users/seed-chapter-users';

type AccountRole = Exclude<UserRole, 'visitor'>;

const accountRoles: Array<{
  description: string;
  label: string;
  value: AccountRole;
}> = [
  {
    description: '가입 직후 기본 권한입니다. 운영진 승인 전 상태입니다.',
    label: 'Guest',
    value: 'guest',
  },
  {
    description: '활동 멤버입니다. 신청, 참여, 활동 제안이 가능합니다.',
    label: 'Member',
    value: 'member',
  },
  {
    description: '졸업 또는 비활동 전환 멤버입니다. 참여율 분석에서는 제외됩니다.',
    label: 'Alumni',
    value: 'alumni',
  },
  {
    description: '멤버 승인과 기본 운영 업무를 처리하는 운영진입니다.',
    label: 'Team Member',
    value: 'team_member',
  },
  {
    description: '챕터 운영 책임자 권한입니다.',
    label: 'Organizer',
    value: 'organizer',
  },
  {
    description: '전체 관리자 권한입니다. 역할 변경과 시스템 설정을 다룹니다.',
    label: 'Admin',
    value: 'admin',
  },
];

const roleLabels = new Map<UserRole, string>([
  ['visitor', 'Visitor'],
  ...accountRoles.map((role) => [role.value, role.label] as const),
]);

const roleSortWeight: Record<UserRole, number> = {
  admin: 0,
  organizer: 1,
  team_member: 2,
  member: 3,
  guest: 4,
  alumni: 5,
  visitor: 6,
};

export function RoleAdmin() {
  const { role, userId } = useAuthSession();
  const store = useMemo(() => createBrowserChapterUserStore(), []);
  const [users, setUsers] = useState<ChapterUser[]>(seedChapterUsers);
  const [roleChangeLogs, setRoleChangeLogs] = useState<RoleChangeLog[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, AccountRole>>(
    () =>
      Object.fromEntries(
        seedChapterUsers.map((user) => [user.id, toAccountRole(user.role)]),
      ),
  );
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState(
    '데모에서는 admin actor로 역할 변경을 실행합니다. 실제 배포에서는 Firebase Auth와 custom claims로 보호합니다.',
  );

  useEffect(() => {
    void refreshRoleAdmin();
  }, []);

  async function refreshRoleAdmin() {
    const [nextUsers, nextRoleChangeLogs] = await Promise.all([
      store.listUsers(),
      store.listRoleChangeLogs(),
    ]);

    setUsers(sortUsers(nextUsers));
    setRoleChangeLogs(
      [...nextRoleChangeLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
    setSelectedRoles((current) => {
      const nextSelections: Record<string, AccountRole> = {};

      for (const user of nextUsers) {
        nextSelections[user.id] = current[user.id] ?? toAccountRole(user.role);
      }

      return nextSelections;
    });
  }

  async function requestRoleChange(user: ChapterUser) {
    const nextRole = selectedRoles[user.id] ?? toAccountRole(user.role);

    if (nextRole === user.role) {
      setMessage(`${user.displayName}님의 역할은 이미 ${getRoleLabel(user.role)}입니다.`);
      return;
    }

    const confirmed = window.confirm(
      `${user.displayName}님의 역할을 ${getRoleLabel(user.role)}에서 ${getRoleLabel(
        nextRole,
      )}(으)로 변경할까요? 변경 이력에 기록됩니다.`,
    );

    if (!confirmed) {
      return;
    }

    setPendingUserId(user.id);

    try {
      const changed = await changeUserRole(store, {
        actorId: userId,
        actorRole: role,
        nextRole,
        now: new Date().toISOString(),
        targetUserId: user.id,
      });

      setMessage(
        `${changed.displayName}님의 역할을 ${getRoleLabel(changed.role)}로 변경했습니다.`,
      );
      await refreshRoleAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '역할 변경 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <WdsPageHeader
          description="가입한 사용자의 역할을 조정하고, 운영진 승격과 alumni 전환 같은 권한 변경 이력을 추적합니다."
          eyebrow="Operator Dashboard"
          title="Role Admin"
        />

        <section className="section section-compact">
          <WdsResponsiveGrid columns={2}>
            <WdsSurfaceCard>
              <WdsBadge tone="blue">Role Policy</WdsBadge>
              <h2>역할 변경은 admin만 수행</h2>
              <p>
                team_member는 guest를 member로 승인할 수 있지만, 일반 역할 변경은 admin
                전용 흐름으로 분리했습니다.
              </p>
            </WdsSurfaceCard>
            <WdsSurfaceCard>
              <WdsBadge tone="green">Audit Log</WdsBadge>
              <h2>{roleChangeLogs.length}건 기록됨</h2>
              <p>
                모든 역할 변경은 actor, target, 이전 역할, 다음 역할, 변경 시각과 함께
                저장됩니다.
              </p>
            </WdsSurfaceCard>
          </WdsResponsiveGrid>
        </section>

        <WdsDashboardLayout offset="md">
          <WdsStack as="section">
            <WdsSectionHeader
              description={message}
              flush
              title="사용자 역할"
            />

            <div className="member-approval-list">
              {users.map((user) => {
                const selectedRole = selectedRoles[user.id] ?? toAccountRole(user.role);
                const isPending = pendingUserId === user.id;

                return (
                  <article className="member-approval-row" key={user.id}>
                    <div>
                      <WdsBadgeGroup>
                        <WdsBadge>{getRoleLabel(user.role)}</WdsBadge>
                        <WdsBadge>{formatKoreanDate(user.createdAt)} 가입</WdsBadge>
                        {user.department ? (
                          <WdsBadge tone="blue">{user.department}</WdsBadge>
                        ) : null}
                      </WdsBadgeGroup>
                      <strong>{user.displayName}</strong>
                      <p>{user.email}</p>
                      <p className="helper-text">
                        현재 역할: {getRoleLabel(user.role)} · 최근 갱신:{' '}
                        {formatKoreanDate(user.updatedAt)}
                      </p>
                    </div>

                    <WdsActionRow align="flex-end">
                      <WdsField className="demo-role-field" label="변경할 역할">
                        <WdsSelect
                          onValueChange={(nextRole) =>
                            setSelectedRoles((current) => ({
                              ...current,
                              [user.id]: nextRole,
                            }))
                          }
                          options={accountRoles}
                          value={selectedRole}
                        />
                      </WdsField>
                      <WdsButton
                        disabled={isPending || selectedRole === user.role}
                        onClick={() => requestRoleChange(user)}
                        size="small"
                        tone="primary"
                        type="button"
                      >
                        {isPending ? '변경 중' : '역할 변경'}
                      </WdsButton>
                    </WdsActionRow>
                  </article>
                );
              })}
            </div>
          </WdsStack>

          <WdsStack as="aside">
            <WdsSurfaceCard>
              <WdsBadge tone="blue">Role Guide</WdsBadge>
              <h2>권한 설명</h2>
              <dl className="profile-summary-list">
                {accountRoles.map((role) => (
                  <div key={role.value}>
                    <dt>{role.label}</dt>
                    <dd>{role.description}</dd>
                  </div>
                ))}
              </dl>
            </WdsSurfaceCard>

            <WdsSurfaceCard>
              <WdsBadge tone="green">Recent Logs</WdsBadge>
              <h2>최근 변경</h2>
              {roleChangeLogs.length > 0 ? (
                <dl className="profile-summary-list">
                  {roleChangeLogs.slice(0, 6).map((log) => (
                    <div key={log.id}>
                      <dt>{formatKoreanDateTime(log.createdAt)}</dt>
                      <dd>
                        {log.targetUserId}: {getRoleLabel(log.previousRole)} →{' '}
                        {getRoleLabel(log.nextRole)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="helper-text">아직 역할 변경 기록이 없습니다.</p>
              )}
            </WdsSurfaceCard>
          </WdsStack>
        </WdsDashboardLayout>
      </div>
    </main>
  );
}

function getRoleLabel(role: UserRole) {
  return roleLabels.get(role) ?? role;
}

function sortUsers(users: ChapterUser[]) {
  return [...users].sort((a, b) => {
    const roleOrder = roleSortWeight[a.role] - roleSortWeight[b.role];

    if (roleOrder !== 0) {
      return roleOrder;
    }

    return a.createdAt.localeCompare(b.createdAt);
  });
}

function toAccountRole(role: UserRole): AccountRole {
  return role === 'visitor' ? 'guest' : role;
}
