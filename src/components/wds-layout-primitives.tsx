import { Card, SectionHeader } from '@wanteddev/wds';
import type { ComponentProps, ElementType, ReactNode } from 'react';

const PolymorphicCard = Card as unknown as ElementType;

type WdsSurfaceCardProps = Omit<ComponentProps<typeof Card>, 'onSubmit'> & {
  as?: ElementType;
  className?: string;
  href?: string;
  onSubmit?: ComponentProps<'form'>['onSubmit'];
};

type WdsSectionHeaderProps = {
  className?: string;
  description?: ReactNode;
  flush?: boolean;
  headingTag?: ComponentProps<typeof SectionHeader>['headingTag'];
  size?: ComponentProps<typeof SectionHeader>['size'];
  title: ReactNode;
  trailingContent?: ReactNode;
};

export function WdsSectionHeader({
  className,
  description,
  flush = false,
  headingTag = 'h2',
  size = 'large',
  title,
  trailingContent,
}: WdsSectionHeaderProps) {
  const sectionHeaderClassName = [
    'section-header',
    flush ? 'section-header-flush' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sectionHeaderClassName}>
      <div className="section-header-content">
        <SectionHeader headingTag={headingTag} size={size}>
          {title}
        </SectionHeader>
        {description ? <p>{description}</p> : null}
      </div>
      {trailingContent}
    </div>
  );
}

export function WdsSurfaceCard({
  as = 'div',
  className,
  platform = 'desktop',
  ...props
}: WdsSurfaceCardProps) {
  const surfaceClassName = ['card', className].filter(Boolean).join(' ');

  return (
    <PolymorphicCard
      as={as}
      className={surfaceClassName}
      platform={platform}
      {...props}
    />
  );
}
