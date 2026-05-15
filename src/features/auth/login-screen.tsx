'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { resolveSafeNextPath } from '@/domain/auth-flow';
import { submitGuestProfile } from '@/domain/chapter-user-service';
import {
  WdsBadge,
  WdsButton,
  WdsTextLinkButton,
} from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsPageHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { createBrowserChapterUserStore } from '@/features/users/browser-chapter-user-store';
import {
  defaultGuestProfile,
  GuestProfileForm,
  type GuestProfileFormState,
  toGuestProfileForm,
} from '@/features/users/guest-profile-form';
import { useAuthSession } from './auth-session-provider';

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    displayName,
    email,
    errorMessage,
    isFirebaseConfigured,
    role,
    signInWithGoogle,
    status,
    userId,
  } = useAuthSession();
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestProfile, setGuestProfile] = useState<GuestProfileFormState>(
    createFallbackProfile(displayName, email),
  );
  const [profileSubmittedAt, setProfileSubmittedAt] = useState<string | null>(
    null,
  );
  const [profileMessage, setProfileMessage] = useState(
    '승인에 필요한 정보를 제출하면 운영진 승인 큐에서 확인할 수 있습니다.',
  );
  const nextPath = useMemo(
    () => resolveSafeNextPath(searchParams.get('next')),
    [searchParams],
  );
  const canSubmitProfile = status === 'signed_in' && role === 'guest';

  useEffect(() => {
    if (status !== 'signed_in' || role === 'guest') {
      return;
    }

    router.replace(nextPath);
  }, [nextPath, role, router, status]);

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

  async function handleGoogleSignIn() {
    setLocalError(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : 'Google 로그인을 완료하지 못했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
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
    setProfileMessage(
      '가입 요청 정보가 저장되었습니다. 운영진 승인 전까지 guest 상태로 대기합니다.',
    );
  }

  const feedback = localError ?? errorMessage;

  if (canSubmitProfile) {
    return (
      <main className="page auth-flow-page">
        <div className="container auth-flow-container">
          <WdsPageHeader
            description="Google 로그인은 완료됐습니다. 운영진 승인을 위한 기본 정보를 이 화면에서 제출합니다."
            eyebrow="Member Onboarding"
            title="가입 정보 제출"
          />

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
              <WdsTextLinkButton href="/member">
                Member Home 보기
              </WdsTextLinkButton>
              <WdsTextLinkButton href="/">Public Home</WdsTextLinkButton>
            </WdsActionRow>

            {feedback ? (
              <p className="helper-text helper-text-caution">{feedback}</p>
            ) : null}
          </WdsSurfaceCard>

          <section className="section section-compact">
            <GuestProfileForm
              message={profileMessage}
              onChange={setGuestProfile}
              onSubmit={handleGuestProfileSubmit}
              value={guestProfile}
            />
          </section>
        </div>
      </main>
    );
  }

  if (status === 'loading' || status === 'signed_in') {
    return (
      <main className="page auth-flow-page">
        <div className="container auth-flow-container">
          <WdsSurfaceCard className="auth-flow-card">
            <p className="helper-text">
              {status === 'signed_in'
                ? '멤버 홈으로 이동하고 있습니다.'
                : '가입 정보 입력을 준비하고 있습니다.'}
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
          description="GDGoC CNU 멤버 홈과 가입 요청은 Google 계정 하나로 시작합니다."
          eyebrow="Google Login"
          title="Google 계정으로 계속하기"
        />

        <WdsSurfaceCard className="auth-flow-card">
          <WdsBadgeGroup>
            <WdsBadge tone="blue">Firebase Auth</WdsBadge>
            <WdsBadge>{status}</WdsBadge>
          </WdsBadgeGroup>

          <div className="auth-flow-copy">
            <h2>Google 로그인으로 가입을 시작합니다</h2>
            <p>
              처음 로그인하면 guest 계정이 만들어지고, 이 화면에서 운영진
              승인에 필요한 프로필을 바로 제출합니다.
            </p>
          </div>

          <WdsActionRow>
            <WdsButton
              disabled={!isFirebaseConfigured || isSubmitting}
              onClick={handleGoogleSignIn}
              tone="primary"
              type="button"
            >
              {isSubmitting ? 'Google 로그인 중' : 'Google로 시작하기'}
            </WdsButton>
            <WdsTextLinkButton href="/">Public Home</WdsTextLinkButton>
          </WdsActionRow>

          {feedback ? (
            <p className="helper-text helper-text-caution">{feedback}</p>
          ) : null}
        </WdsSurfaceCard>
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
