import { WdsLinkButton } from '@/components/wds-form-controls';
import {
  onboardingPosterPipeline,
  onboardingProofPoints,
  onboardingToolBadges,
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
        <div className="onboarding-ribbon ribbon-blue" aria-hidden="true" />
        <div className="onboarding-ribbon ribbon-red" aria-hidden="true" />
        <div className="onboarding-ribbon ribbon-yellow" aria-hidden="true" />
        <div className="onboarding-ribbon ribbon-green" aria-hidden="true" />

        <div className="container onboarding-hero-grid">
          <div className="onboarding-copy">
            <div className="onboarding-kicker" aria-label="캠페인">
              <span>GDGoC CNU</span>
              <span>Build with AI</span>
            </div>
            <h1 id="public-home-title">
              <span>Build with AI를</span>
              <span>시작점으로, 지금</span>
              <span>움직이는 챕터를</span>
              <span>보여주는 홈</span>
            </h1>
            <p>
              <span>GDGoC CNU 활동을 한곳에 모읍니다.</span>
              <span>쇼케이스와 문구는 Gemini로 다듬고,</span>
              <span>Firebase에 저장해 멤버 홈까지 이어집니다.</span>
            </p>
            <div className="hero-actions">
              <WdsLinkButton href="/member" tone="primary">
                멤버 홈 보기
              </WdsLinkButton>
              <WdsLinkButton href="/admin" tone="secondary">
                활동 등록 데모
              </WdsLinkButton>
            </div>
          </div>

          <aside className="campaign-poster" aria-label="Build with AI 온보딩 포스터">
            <div className="poster-grain" aria-hidden="true" />
            <div className="poster-orbit poster-orbit-blue" aria-hidden="true" />
            <div className="poster-orbit poster-orbit-green" aria-hidden="true" />
            <div className="poster-head">
              <span className="poster-sticker">Saturday Demo</span>
              <span className="poster-year">2026</span>
            </div>
            <div className="poster-title-block">
              <span>Build</span>
              <span>with AI</span>
            </div>
            <div className="poster-tools" aria-label="사용 도구">
              {onboardingToolBadges.map((badge) => (
                <span
                  className={`poster-tool poster-tool-${badge.accent}`}
                  key={badge.label}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="poster-flow" aria-label="홈페이지 데모 흐름">
              {onboardingPosterPipeline.map((step, index) => (
                <div className="poster-flow-step" key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
            <div className="poster-terminal" aria-label="핵심 데모 결과">
              <div aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>
                operator note → Gemini draft → Firestore → member home
              </p>
              <strong>활동이 저장되면 홈의 현재성이 살아납니다.</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="section campaign-bridge">
        <div className="container campaign-bridge-grid">
          <div>
            <span className="badge badge-blue">Onboarding Layer</span>
            <h2>계절 캠페인은 강하게, 제품 흐름은 또렷하게</h2>
          </div>
          <p>
            첫 화면은 Build with AI 포스터 무드로 방문자의 기억에 남게 만들고,
            바로 아래에서는 쇼케이스와 공개 활동이 이어져 “이 챕터가 실제로
            무엇을 만들고 운영하는지” 확인할 수 있게 합니다.
          </p>
          <div className="onboarding-proof-list" role="list">
            {onboardingProofPoints.map((point) => (
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
        <div className="container grid grid-3">
          <div className="card">
            <span className="badge badge-blue">Firebase</span>
            <h3>저장되는 운영 흐름</h3>
            <p>
              로그인, 활동 등록, 멤버 홈 반영을 정적 목업이 아니라 실제 데이터
              경로로 연결합니다.
            </p>
          </div>
          <div className="card">
            <span className="badge">Gemini</span>
            <h3>운영진 글쓰기 보조</h3>
            <p>
              거친 메모에서 카드 요약, 멤버용 공지, 공개용 소개 문구를 빠르게
              정리합니다.
            </p>
          </div>
          <div className="card">
            <span className="badge badge-green">Community</span>
            <h3>활동이 보이는 챕터</h3>
            <p>
              공지와 활동을 구조화해 방문자에게는 신뢰를, 멤버에게는 다음
              참여 지점을 제공합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
