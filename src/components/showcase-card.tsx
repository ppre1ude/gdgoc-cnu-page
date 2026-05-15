import {
  getSafeShowcaseHref,
  type Showcase,
  type ShowcaseKind,
} from '@/domain/showcase';
import { Box } from '@wanteddev/wds';
import type { ElementType } from 'react';
import { WdsBadge } from '@/components/wds-form-controls';
import {
  WdsBadgeGroup,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';

const PolymorphicBox = Box as unknown as ElementType;

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

const showcaseBodySx = {
  padding: '18px',
};

const showcaseMediaSx = {
  aspectRatio: '16 / 9',
  background:
    'linear-gradient(135deg, rgb(var(--semantic-primary-normal-rgb) / 0.14), transparent 52%), var(--surface-muted)',
  borderBottom: '1px solid var(--line)',
  overflow: 'hidden',
};

const showcaseImageSx = {
  display: 'block',
  height: '100%',
  objectFit: 'cover',
  width: '100%',
};

const showcaseEmptyMediaSx = {
  ...showcaseMediaSx,
  alignItems: 'flex-end',
  display: 'flex',
  padding: '18px',
};

const showcaseEmptyLabelSx = {
  background: 'white',
  border: '1px solid var(--line)',
  borderRadius: '999px',
  color: 'var(--text-muted)',
  fontSize: '12px',
  fontWeight: 800,
  padding: '7px 9px',
};

export function ShowcaseCard({ showcase }: { showcase: Showcase }) {
  const safeHref = getSafeShowcaseHref(showcase.href);
  const content = (
    <>
      <ShowcaseMedia showcase={showcase} />
      <Box sx={showcaseBodySx}>
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
      </Box>
    </>
  );

  if (safeHref) {
    return (
      <WdsSurfaceCard
        as="a"
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
      sx={showcaseSurfaceSx}
    >
      {content}
    </WdsSurfaceCard>
  );
}

function ShowcaseMedia({ showcase }: { showcase: Showcase }) {
  if (showcase.imageUrl) {
    return (
      <Box sx={showcaseMediaSx}>
        <PolymorphicBox
          alt=""
          as="img"
          src={showcase.imageUrl}
          sx={showcaseImageSx}
        />
      </Box>
    );
  }

  return (
    <Box sx={showcaseEmptyMediaSx}>
      <PolymorphicBox as="span" sx={showcaseEmptyLabelSx}>
        {showcaseKindLabel[showcase.kind]}
      </PolymorphicBox>
    </Box>
  );
}
