'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { getPublicJoinHref, resolveSafeNextPath } from '@/domain/auth-flow';
import {
  WdsBadge,
  WdsButton,
  WdsLinkButton,
  WdsTextLinkButton,
} from '@/components/wds-form-controls';
import {
  WdsActionRow,
  WdsBadgeGroup,
  WdsPageHeader,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import { useAuthSession } from './auth-session-provider';

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    errorMessage,
    isFirebaseConfigured,
    role,
    signInWithGoogle,
    status,
  } = useAuthSession();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = useMemo(
    () => resolveSafeNextPath(searchParams.get('next')),
    [searchParams],
  );

  useEffect(() => {
    if (status !== 'signed_in') {
      return;
    }

    router.replace(role === 'guest' ? getPublicJoinHref() : nextPath);
  }, [nextPath, role, router, status]);

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

  const feedback = localError ?? errorMessage;

  return (
    <main className="page auth-flow-page">
      <div className="container auth-flow-container">
        <WdsPageHeader
          description="GDGoC CNU 멤버 홈과 가입 요청은 Google 계정으로 시작합니다."
          eyebrow="Google Login"
          title="Google 계정으로 계속하기"
        />

        <WdsSurfaceCard className="auth-flow-card">
          <WdsBadgeGroup>
            <WdsBadge tone="blue">Firebase Auth</WdsBadge>
            <WdsBadge>{status}</WdsBadge>
          </WdsBadgeGroup>

          <div className="auth-flow-copy">
            <h2>로그인 후 가입 정보를 제출합니다</h2>
            <p>
              처음 로그인하면 guest 계정이 만들어지고, 가입 화면에서 운영진
              승인에 필요한 프로필을 제출합니다.
            </p>
          </div>

          {isFirebaseConfigured ? (
            <WdsActionRow>
              <WdsButton
                disabled={isSubmitting || status === 'loading'}
                onClick={handleGoogleSignIn}
                tone="primary"
                type="button"
              >
                {isSubmitting ? 'Google 로그인 중' : 'Google로 시작하기'}
              </WdsButton>
              <WdsTextLinkButton href={getPublicJoinHref()}>
                가입 화면 보기
              </WdsTextLinkButton>
            </WdsActionRow>
          ) : (
            <WdsActionRow>
              <WdsLinkButton href={getPublicJoinHref()} tone="primary">
                데모 가입 화면 보기
              </WdsLinkButton>
              <WdsTextLinkButton href="/member">Member Home</WdsTextLinkButton>
            </WdsActionRow>
          )}

          {feedback ? <p className="helper-text helper-text-caution">{feedback}</p> : null}
        </WdsSurfaceCard>
      </div>
    </main>
  );
}
