import { SectionHeader } from '@wanteddev/wds';
import type { ComponentProps, ReactNode } from 'react';

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
