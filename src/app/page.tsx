import { WdsBadge, WdsLinkButton } from '@/components/wds-form-controls';
import {
  onboardingBrandPoints,
  onboardingDetailSections,
  onboardingValueBadges,
} from '@/domain/public-home-onboarding';
import { getLoginHref, getPublicOnboardingHref } from '@/domain/auth-flow';
import { PublicActivitySection } from '@/features/activities/public-activity-section';
import {
  YonseiBannerTextAnimation,
  YonseiDeveloperBannerDoodle,
} from '@/features/onboarding/yonsei-developer-banner';
import { PublicShowcaseSection } from '@/features/showcases/public-showcase-section';

const googleLogoLetters = [
  { className: 'google-letter-blue', value: 'G' },
  { className: 'google-letter-red', value: 'D' },
  { className: 'google-letter-yellow', value: 'G' },
  { className: 'google-letter-blue', value: 'o' },
  { className: 'google-letter-green', value: 'C' },
  { className: 'google-letter-space', value: ' ' },
  { className: 'google-letter-blue', value: 'C' },
  { className: 'google-letter-red', value: 'N' },
  { className: 'google-letter-yellow', value: 'U' },
] as const;

export default function PublicHomePage() {
  return (
    <main className="public-home">
      <section
        aria-labelledby="public-home-title"
        className="onboarding-hero"
      >
        <div className="container onboarding-hero-shell">
          <div className="onboarding-hero-grid">
            <div className="onboarding-copy">
              <h1 id="public-home-title">
                <YonseiBannerTextAnimation delaySeconds={0.1}>
                  We are
                </YonseiBannerTextAnimation>
                <YonseiBannerTextAnimation
                  aria-label="GDGoC CNU"
                  className="google-logo-word"
                  delaySeconds={0.4}
                >
                  {googleLogoLetters.map((letter, index) => (
                    <span
                      aria-hidden="true"
                      className={`google-letter ${letter.className}`}
                      key={`${letter.value}-${index}`}
                    >
                      {letter.value === ' ' ? '\u00A0' : letter.value}
                    </span>
                  ))}
                </YonseiBannerTextAnimation>
                <YonseiBannerTextAnimation delaySeconds={0.6}>
                  Developers.
                </YonseiBannerTextAnimation>
              </h1>
              <p>
                GDGoC CNU는 Google Developers 생태계와 연결된 전남대학교 학생 개발자 커뮤니티입니다.
                우리는 학생들이 서로 연결되고, 함께 배우고, 프로젝트로 성장하며
                기술로 커뮤니티에 임팩트를 만들도록 돕습니다.
              </p>
              <div className="hero-actions">
                <WdsLinkButton href={getPublicOnboardingHref()} tone="primary">
                  멤버로 참여하기
                </WdsLinkButton>
                <WdsLinkButton href={getLoginHref('/member')} tone="secondary">
                  로그인하기
                </WdsLinkButton>
              </div>
            </div>

            <YonseiDeveloperBannerDoodle />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="values-title"
        className="section campaign-bridge reveal-on-scroll"
        id="values"
      >
        <div className="container">
          <div className="developer-intro-head">
            <WdsBadge tone="green">GDGoC CNU Values</WdsBadge>
            <h2 id="values-title">Impact, Connect, Learn, Grow로 시작합니다.</h2>
            <p>
              GDGoC CNU는 Google Developers 생태계와 연결된 전남대학교 학생 개발자 커뮤니티입니다.
              우리는 학생에게 임팩트를 만들고, 학생이 기술로 커뮤니티에 다시
              임팩트를 만들도록 돕습니다.
            </p>
          </div>

          <div className="onboarding-jam-grid" role="list">
            {onboardingValueBadges.map((badge, index) => (
              <a
                className={`onboarding-jam-card onboarding-jam-card-${badge.accent}`}
                href={`#${badge.targetId}`}
                key={badge.label}
                role="listitem"
              >
                <span className="onboarding-jam-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="onboarding-jam-symbol">{badge.symbol}</span>
                <strong>{badge.label}</strong>
                <p>{badge.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section onboarding-section-intro">
        <div className="container">
          <h2>Section Introduction.</h2>
          <p>
            각 단계는 처음 방문한 전남대학교 학생이 이해해야 하는 가치 단위로
            나뉩니다. 연결하고, 배우고, 성장하는 흐름이 워크숍과 프로젝트
            활동으로 이어집니다.
          </p>
        </div>
      </section>

      {onboardingDetailSections.map((section) => (
        <section
          className={`onboarding-detail-section onboarding-detail-section-${section.accent}`}
          id={section.targetId}
          key={section.targetId}
        >
          <div className="container onboarding-detail-grid">
            <aside className="onboarding-detail-outline">
              <span>{section.order}</span>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </aside>

            <div className="onboarding-detail-body">
              <div className="onboarding-detail-block">
                <span>{section.kicker}</span>
                <h3>What we do</h3>
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>

              <div className="onboarding-tool-panel">
                <h3>How it shows up</h3>
                <div className="onboarding-tool-list">
                  {section.tools.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section onboarding-outcome-band">
        <div className="container onboarding-outcome-grid">
          <div className="onboarding-outcome-copy">
            <WdsBadge tone="blue">GDGoC CNU Values</WdsBadge>
            <h2>참여자가 남기고 가야 할 것</h2>
            <p>
              온보딩은 이벤트 소개에서 끝나지 않습니다. 다음 활동으로 이어질 수
              있는 사람, 결과물, 기록을 만드는 것이 목표입니다.
            </p>
            <div className="hero-actions">
              <WdsLinkButton href={getPublicOnboardingHref()} tone="primary">
                가입 정보 제출하기
              </WdsLinkButton>
              <WdsLinkButton href="#activities" tone="secondary">
                공개 활동 보기
              </WdsLinkButton>
            </div>
          </div>

          <div className="onboarding-proof-list brand-proof-list" role="list">
            {onboardingBrandPoints.map((point) => (
              <div
                className="onboarding-proof-item"
                key={point.label}
                role="listitem"
              >
                <span>{point.label}</span>
                <strong>{point.value}</strong>
                <p>{point.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicShowcaseSection />

      <div id="activities">
        <PublicActivitySection />
      </div>
    </main>
  );
}
