import { WdsLinkButton } from '@/components/wds-form-controls';
import {
  onboardingBrandPoints,
  onboardingPosterPipeline,
  onboardingValueBadges,
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
              <span>기술로 배우고</span>
              <span>연결하며</span>
              <span>커뮤니티에</span>
              <span>임팩트를 만듭니다</span>
            </h1>
            <p>
              <span>Connect, Learn, Grow를 경험하며</span>
              <span>워크숍과 프로젝트로</span>
              <span>기술을 실천하는 커뮤니티입니다.</span>
              <span>성장의 힘은 지역 커뮤니티로 이어집니다.</span>
            </p>
            <div className="hero-actions">
              <WdsLinkButton href="/member" tone="primary">
                멤버로 참여하기
              </WdsLinkButton>
              <WdsLinkButton href="#showcase" tone="secondary">
                활동 살펴보기
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

      <section className="section campaign-bridge">
        <div className="container campaign-bridge-grid">
          <div>
            <span className="badge badge-blue">GDGoC CNU Values</span>
            <h2>Connect, Learn, Grow로 만드는 커뮤니티 임팩트</h2>
          </div>
          <p>
            GDGoC CNU는 기술을 배우는 학생들이 서로 연결되고, 실제 프로젝트로
            성장하며, 그 경험을 다시 커뮤니티에 나누는 장을 만듭니다.
          </p>
          <div className="onboarding-proof-list" role="list">
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
        <div className="container grid grid-3">
          <div className="card">
            <span className="badge badge-blue">Connect</span>
            <h3>사람과 기회를 연결합니다</h3>
            <p>
              학교 안팎의 개발자, 멘토, 파트너와 만나며 더 넓은 네트워크를
              만듭니다.
            </p>
          </div>
          <div className="card">
            <span className="badge">Learn</span>
            <h3>함께 배우는 워크숍을 엽니다</h3>
            <p>
              최신 기술을 혼자 공부하는 데서 멈추지 않고, 서로 설명하고
              실습하며 익힙니다.
            </p>
          </div>
          <div className="card">
            <span className="badge badge-green">Grow</span>
            <h3>프로젝트로 성장합니다</h3>
            <p>
              배운 내용을 실제 결과물로 만들며 전문성과 커뮤니티 학습 경험을
              함께 키웁니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
