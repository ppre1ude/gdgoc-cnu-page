'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getJoinFlowState, getLoginHref } from '@/domain/auth-flow';
import { submitGuestProfile } from '@/domain/chapter-user-service';
import {
  WdsBadge,
  WdsLinkButton,
  WdsTextLinkButton,
} from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsPageHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import {
  defaultGuestProfile,
  GuestProfileForm,
  type GuestProfileFormState,
  toGuestProfileForm,
} from './guest-profile-form';
import { createBrowserChapterUserStore } from './browser-chapter-user-store';

export function JoinScreen() {
  const {
    displayName,
    email,
    isFirebaseConfigured,
    role,
    setDemoRole,
    status: authStatus,
    userId,
  } = useAuthSession();
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const [guestProfile, setGuestProfile] = useState<GuestProfileFormState>(
    createFallbackProfile(displayName, email),
  );
  const [profileSubmittedAt, setProfileSubmittedAt] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState(
    'Google 로그인 후 운영진 승인에 필요한 정보를 저장합니다.',
  );

  const joinFlowState = getJoinFlowState({
    isFirebaseConfigured,
    role,
    status: authStatus,
  });
  const canSubmitProfile = joinFlowState === 'profile';

  useEffect(() => {
    if (joinFlowState === 'demo_guest_required') {
      setDemoRole('guest');
    }
  }, [joinFlowState, setDemoRole]);

  useEffect(() => {
    if (!canSubmitProfile) {
      setGuestProfile(createFallbackProfile(displayName, email));
      setProfileSubmittedAt(null);
      return;
    }

    void loadGuestProfile();
  }, [canSubmitProfile, displayName, email, userId]);

  async function loadGuestProfile() {
    const savedGuest = await userStore.findUser(userId);

    if (!savedGuest) {
      setGuestProfile(createFallbackProfile(displayName, email));
      setProfileSubmittedAt(null);
      return;
    }

    setGuestProfile(toGuestProfileForm(savedGuest));
    setProfileSubmittedAt(savedGuest.profileSubmittedAt ?? null);
  }

  async function handleGuestProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submitted = await submitGuestProfile(userStore, {
      displayName: guestProfile.displayName.trim() || defaultGuestProfile.displayName,
      email: guestProfile.email.trim() || defaultGuestProfile.email,
      id: userId,
      now: new Date().toISOString(),
      profile: {
        cohort: guestProfile.cohort.trim(),
        department: guestProfile.department.trim(),
        interests: guestProfile.interests.trim(),
        motivation: guestProfile.motivation.trim(),
        studentId: guestProfile.studentId.trim(),
      },
    });

    setGuestProfile(toGuestProfileForm(submitted));
    setProfileSubmittedAt(submitted.profileSubmittedAt ?? null);
    setMessage('가입 요청 정보가 저장되었습니다. 운영진 승인 전까지 guest 상태로 대기합니다.');
  }

  if (joinFlowState === 'loading' || joinFlowState === 'demo_guest_required') {
    return (
      <main className="page auth-flow-page">
        <div className="container auth-flow-container">
          <WdsSurfaceCard className="auth-flow-card">
            <p className="helper-text">
              {joinFlowState === 'demo_guest_required'
                ? '데모 가입 화면을 준비하고 있습니다.'
                : '로그인 상태를 확인하고 있습니다.'}
            </p>
          </WdsSurfaceCard>
        </div>
      </main>
    );
  }

  return (
    <main className="page auth-flow-page">
      <div className="container auth-flow-container">
        <WdsPageHeader
          description="Google 로그인으로 guest 계정을 만든 뒤, 운영진 승인을 위한 기본 정보를 제출합니다."
          eyebrow="Join GDGoC CNU"
          title="멤버 가입 요청"
        />

        {joinFlowState === 'profile' ? (
          <>
            <WdsSurfaceCard className="auth-flow-card">
              <WdsBadgeGroup>
                <WdsBadge tone="green">Guest</WdsBadge>
                <WdsBadge>
                  {profileSubmittedAt ? 'profile_submitted' : 'profile_required'}
                </WdsBadge>
              </WdsBadgeGroup>
              <div className="auth-flow-copy">
                <h2>
                  {profileSubmittedAt
                    ? '가입 요청 정보가 저장되었습니다'
                    : '가입 요청 정보를 제출해주세요'}
                </h2>
                <p>
                  제출 후 운영진이 guest 계정을 member로 승인하면 멤버 홈의
                  활동 신청과 제안 기능을 사용할 수 있습니다.
                </p>
              </div>
              <WdsActionRow>
                <WdsTextLinkButton href="/member">Member Home 보기</WdsTextLinkButton>
              </WdsActionRow>
            </WdsSurfaceCard>

            <section className="section section-compact">
              <GuestProfileForm
                message={message}
                onChange={setGuestProfile}
                onSubmit={handleGuestProfileSubmit}
                value={guestProfile}
              />
            </section>
          </>
        ) : (
          <WdsSurfaceCard className="auth-flow-card">
            <WdsBadgeGroup>
              <WdsBadge tone="blue">Google Login</WdsBadge>
              <WdsBadge>{authStatus}</WdsBadge>
            </WdsBadgeGroup>
            <div className="auth-flow-copy">
              <h2>
                {joinFlowState === 'login_required'
                  ? 'Google 로그인부터 시작합니다'
                  : '이미 멤버 권한이 있습니다'}
              </h2>
              <p>
                {joinFlowState === 'login_required'
                  ? '가입 요청을 제출하려면 먼저 Google 계정으로 로그인해야 합니다.'
                  : 'guest 승인 대기 단계가 아니므로 바로 멤버 홈으로 이동할 수 있습니다.'}
              </p>
            </div>
            <WdsActionRow>
              {joinFlowState === 'login_required' ? (
                <WdsLinkButton href={getLoginHref('/join')} tone="primary">
                  Google 로그인
                </WdsLinkButton>
              ) : (
                <WdsLinkButton href="/member" tone="primary">
                  Member Home
                </WdsLinkButton>
              )}
              <WdsTextLinkButton href="/">Public Home</WdsTextLinkButton>
            </WdsActionRow>
          </WdsSurfaceCard>
        )}
      </div>
    </main>
  );
}

function createFallbackProfile(
  displayName: string | undefined,
  email: string | undefined,
): GuestProfileFormState {
  return {
    ...defaultGuestProfile,
    displayName: displayName ?? defaultGuestProfile.displayName,
    email: email ?? defaultGuestProfile.email,
  };
}
