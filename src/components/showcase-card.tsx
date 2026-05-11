import {
  getSafeShowcaseHref,
  type Showcase,
  type ShowcaseKind,
} from '@/domain/showcase';

const showcaseKindLabel: Record<ShowcaseKind, string> = {
  achievement: '성과',
  retrospective: '회고',
  project_result: '프로젝트 결과',
  gallery: '갤러리',
};

export function ShowcaseCard({ showcase }: { showcase: Showcase }) {
  const safeHref = getSafeShowcaseHref(showcase.href);
  const content = (
    <>
      <ShowcaseMedia showcase={showcase} />
      <div className="showcase-card-body">
        <div className="badge-row">
          <span className="badge badge-green">
            {showcaseKindLabel[showcase.kind]}
          </span>
          {showcase.tags.slice(0, 2).map((tag) => (
            <span className="badge" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <h3>{showcase.title}</h3>
        <p>{showcase.summary}</p>
      </div>
    </>
  );

  if (safeHref) {
    return (
      <a className="card showcase-card" href={safeHref}>
        {content}
      </a>
    );
  }

  return <article className="card showcase-card">{content}</article>;
}

function ShowcaseMedia({ showcase }: { showcase: Showcase }) {
  if (showcase.imageUrl) {
    return (
      <div className="showcase-card-media">
        <img alt="" src={showcase.imageUrl} />
      </div>
    );
  }

  return (
    <div className="showcase-card-media showcase-card-media-empty">
      <span>{showcaseKindLabel[showcase.kind]}</span>
    </div>
  );
}
