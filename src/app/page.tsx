import Link from 'next/link';

import { ActivityCard } from '@/components/activity-card';
import { ShowcaseCard } from '@/components/showcase-card';
import { listVisibleShowcases } from '@/domain/showcase';
import { seedActivities } from '@/features/activities/seed-activities';
import { seedShowcases } from '@/features/showcases/seed-showcases';

export default function PublicHomePage() {
  const publicActivities = seedActivities.filter(
    (activity) => activity.visibility === 'public' && activity.status === 'published',
  );
  const publicShowcases = listVisibleShowcases(seedShowcases, 'visitor').slice(
    0,
    3,
  );

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Build with AI · GDGoC CNU</p>
            <h1>AI로 만들고 커뮤니티에서 함께 성장하는 활동 허브</h1>
            <p>
              GDGoC CNU에서 진행하는 이벤트, 스터디, 프로젝트, 챌린지를 한눈에
              확인하고 참여할 수 있는 공식 홈페이지입니다. Firebase와 Gemini를
              활용한 실제 작동 데모를 중심으로 발전시키고 있습니다.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/member">
                멤버 홈 보기
              </Link>
              <Link className="button button-secondary" href="/admin">
                활동 등록 데모
              </Link>
            </div>
          </div>
          <aside className="poster-panel" aria-label="Build with AI demo">
            <span className="badge badge-blue">Saturday Demo</span>
            <strong>
              Gemini가 초안을 다듬고 Firebase가 활동을 저장합니다.
            </strong>
            <p>
              운영진이 활동을 등록하면 멤버 홈에 바로 반영되는 흐름을 첫 번째
              vertical slice로 구현합니다.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Showcase</h2>
              <p>
                GDGoC CNU가 Build with AI와 챕터 활동에서 남긴 결과와 기록입니다.
              </p>
            </div>
          </div>
          <div className="grid grid-3">
            {publicShowcases.map((showcase) => (
              <ShowcaseCard key={showcase.id} showcase={showcase} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Public Activities</h2>
              <p>외부 방문자에게 공개할 수 있는 최근 활동과 캠페인입니다.</p>
            </div>
          </div>
          <div className="grid grid-3">
            {publicActivities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <div className="card">
            <span className="badge badge-blue">Firebase</span>
            <h3>Auth와 Firestore 기반</h3>
            <p>
              로그인, 활동 등록, 멤버 홈 반영 흐름을 실제 데이터 경로로
              연결합니다.
            </p>
          </div>
          <div className="card">
            <span className="badge">Gemini</span>
            <h3>운영진 글쓰기 보조</h3>
            <p>
              거친 메모에서 카드 요약, 멤버용 문구, 공개용 문구를 제안합니다.
            </p>
          </div>
          <div className="card">
            <span className="badge badge-green">Community</span>
            <h3>활동을 한눈에</h3>
            <p>
              공지와 활동을 구조화해 멤버의 참여율과 소속감을 높입니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
