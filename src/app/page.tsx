import { WdsBadge, WdsLinkButton } from '@/components/wds-form-controls';
import {
  WdsResponsiveGrid,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';
import {
  onboardingBrandPoints,
  onboardingPosterPipeline,
  onboardingValueBadges,
  onboardingValueProcess,
} from '@/domain/public-home-onboarding';
import { PublicActivitySection } from '@/features/activities/public-activity-section';
import { PublicShowcaseSection } from '@/features/showcases/public-showcase-section';

export default function PublicHomePage() {
  return (
    <main className="public-home">
      <section
        aria-labelledby="public-home-title"
        className="onboarding-hero"
      >
        <div className="onboarding-ribbon ribbon-red" aria-hidden="true">
          <span>Impact</span>
        </div>
        <div className="onboarding-ribbon ribbon-yellow" aria-hidden="true">
          <span>Workshop</span>
        </div>
        <div className="onboarding-ribbon ribbon-green" aria-hidden="true">
          <span>Community</span>
        </div>
        <div className="onboarding-ribbon-arc ribbon-arc-green" aria-hidden="true" />
        <div className="onboarding-ribbon-arc ribbon-arc-blue" aria-hidden="true" />

        <div className="container onboarding-hero-grid">
          <div className="onboarding-copy">
            <div className="onboarding-kicker" aria-label="캠페인">
              <span>GDGoC CNU</span>
              <span>Build with AI</span>
            </div>
            <h1 id="public-home-title">
              <span>배우고, 만들고,</span>
              <span>나누는</span>
              <span>학생 개발자</span>
              <span>커뮤니티</span>
            </h1>
            <p>
              <span>GDGoC CNU는 Google 기술과 AI를 함께 실험하며,</span>
              <span>워크숍과 프로젝트를 통해</span>
              <span>배움을 실제 결과로 연결합니다.</span>
              <span>서로의 성장을 돕고 그 경험을 커뮤니티에 나눕니다.</span>
            </p>
            <div className="hero-actions">
              <WdsLinkButton href="/member" tone="primary">
                멤버로 참여하기
              </WdsLinkButton>
              <WdsLinkButton href="/member" tone="secondary">
                지원하기
              </WdsLinkButton>
            </div>
          </div>

          <aside className="campaign-poster" aria-label="Build with AI 온보딩 포스터">
            <div className="poster-grain" aria-hidden="true" />
            <div className="poster-orbit poster-orbit-blue" aria-hidden="true" />
            <div className="poster-orbit poster-orbit-green" aria-hidden="true" />
            <div className="poster-head">
              <span className="poster-sticker">Impact students</span>
              <span className="poster-year">CNU Chapter</span>
            </div>
            <div className="poster-title-block">
              <span>Build</span>
              <span>with AI</span>
            </div>
            <div className="poster-tools" aria-label="챕터 가치">
              {onboardingValueBadges.map((badge) => (
                <span
                  className={`poster-tool poster-tool-${badge.accent}`}
                  key={badge.label}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="poster-flow" aria-label="GDGoC CNU 성장 흐름">
              {onboardingPosterPipeline.map((step, index) => (
                <div className="poster-flow-step" key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="values-title"
        className="section campaign-bridge reveal-on-scroll"
        id="values"
      >
        <div className="container campaign-bridge-grid">
          <div>
            <WdsBadge tone="blue">GDGoC CNU Values</WdsBadge>
            <h2 id="values-title">함께 배우고, 프로젝트로 성장하는 방식</h2>
          </div>
          <p>
            연결은 배움의 시작이고, 실습은 성장의 속도가 됩니다. GDGoC CNU는
            함께 만든 결과를 다시 커뮤니티의 자산으로 남깁니다.
          </p>
          <div
            aria-label="GDGoC CNU의 가치와 활동 흐름"
            className="value-process-panel"
          >
            <span className="value-process-label">Our Way</span>
            <div className="value-process-steps">
              {onboardingValueProcess.map((step, index) => (
                <article
                  className={`value-process-step value-process-step-${step.accent}`}
                  key={step.label}
                >
                  <span className="value-process-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="value-process-kicker">{step.kicker}</span>
                    <h3>{step.label}</h3>
                  </div>
                  <p>{step.title}</p>
                  <small>{step.detail}</small>
                </article>
              ))}
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

      <PublicActivitySection />

      <section className="section">
        <WdsResponsiveGrid className="container" columns={3}>
          <WdsSurfaceCard as="article">
            <WdsBadge tone="blue">Connect</WdsBadge>
            <h3>함께할 사람을 만납니다</h3>
            <p>
              학교 안팎의 동료, 멘토, 파트너와 연결되어 더 넓은 개발자
              네트워크를 만듭니다.
            </p>
          </WdsSurfaceCard>
          <WdsSurfaceCard as="article">
            <WdsBadge>Learn</WdsBadge>
            <h3>실습으로 기술을 익힙니다</h3>
            <p>
              Google 기술과 AI를 직접 다루고, 서로 설명하며 배움을 공유합니다.
            </p>
          </WdsSurfaceCard>
          <WdsSurfaceCard as="article">
            <WdsBadge tone="green">Grow</WdsBadge>
            <h3>프로젝트로 경험을 쌓습니다</h3>
            <p>
              아이디어를 작은 결과물로 구현하며 협업과 문제 해결 경험을
              쌓습니다.
            </p>
          </WdsSurfaceCard>
        </WdsResponsiveGrid>
      </section>
    </main>
  );
}
