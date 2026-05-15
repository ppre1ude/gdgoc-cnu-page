import {
  getSafeShowcaseHref,
  type Showcase,
  type ShowcaseKind,
} from '@/domain/showcase';
import { WdsBadge } from '@/components/wds-form-controls';
import {
  WdsBadgeGroup,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';

const showcaseKindLabel: Record<ShowcaseKind, string> = {
  achievement: '성과',
  retrospective: '회고',
  project_result: '프로젝트 결과',
  gallery: '갤러리',
};

const showcaseSurfaceSx = {
  display: 'block',
  overflow: 'hidden',
  padding: 0,
};

export function ShowcaseCard({ showcase }: { showcase: Showcase }) {
  const safeHref = getSafeShowcaseHref(showcase.href);
  const content = (
    <>
      <ShowcaseMedia showcase={showcase} />
      <div className="showcase-card-body">
        <WdsBadgeGroup>
          <WdsBadge tone="green">
            {showcaseKindLabel[showcase.kind]}
          </WdsBadge>
          {showcase.tags.slice(0, 2).map((tag) => (
            <WdsBadge key={tag}>
              {tag}
            </WdsBadge>
          ))}
        </WdsBadgeGroup>
        <h3>{showcase.title}</h3>
        <p>{showcase.summary}</p>
      </div>
    </>
  );

  if (safeHref) {
    return (
      <WdsSurfaceCard
        as="a"
        className="showcase-card"
        href={safeHref}
        sx={showcaseSurfaceSx}
      >
        {content}
      </WdsSurfaceCard>
    );
  }

  return (
    <WdsSurfaceCard
      as="article"
      className="showcase-card"
      sx={showcaseSurfaceSx}
    >
      {content}
    </WdsSurfaceCard>
  );
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
