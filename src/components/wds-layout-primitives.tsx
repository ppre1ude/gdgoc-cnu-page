import { Box, Card, FlexBox, SectionHeader, Typography } from '@wanteddev/wds';
import type { ComponentProps, ElementType, ReactNode } from 'react';

const PolymorphicBox = Box as unknown as ElementType;
const PolymorphicCard = Card as unknown as ElementType;

type WdsSurfaceCardProps = Omit<ComponentProps<typeof Card>, 'onSubmit'> & {
  as?: ElementType;
  className?: string;
  href?: string;
  onSubmit?: ComponentProps<'form'>['onSubmit'];
};

type WdsLayoutOffset = 'none' | 'xs' | 'sm' | 'md' | 'lg';
type WdsGridColumns = 2 | 3;

type WdsSectionHeaderProps = {
  description?: ReactNode;
  flush?: boolean;
  headingTag?: ComponentProps<typeof SectionHeader>['headingTag'];
  size?: ComponentProps<typeof SectionHeader>['size'];
  title: ReactNode;
  trailingContent?: ReactNode;
};

type WdsResponsiveGridProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  columns?: WdsGridColumns;
  dense?: boolean;
  offset?: WdsLayoutOffset;
};

type WdsDashboardLayoutProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  offset?: WdsLayoutOffset;
  sidebarWidth?: string;
};

type WdsStackProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  gap?: string;
  offset?: WdsLayoutOffset;
};

type WdsActionRowProps = {
  align?: ComponentProps<typeof FlexBox>['alignItems'];
  children: ReactNode;
  className?: string;
  justify?: ComponentProps<typeof FlexBox>['justifyContent'];
  offset?: WdsLayoutOffset;
  reserveBottom?: boolean;
};

type WdsBadgeGroupProps = {
  children: ReactNode;
  className?: string;
  offset?: WdsLayoutOffset;
};

type WdsFormActionsProps = {
  actions: ReactNode;
  helper?: ReactNode;
};

type WdsOffsetProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  offset?: WdsLayoutOffset;
};

type WdsPageHeaderProps = {
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

const layoutOffsets: Record<WdsLayoutOffset, string | undefined> = {
  none: undefined,
  xs: '8px',
  sm: '16px',
  md: '20px',
  lg: '28px',
};

const surfaceCardSx: ComponentProps<typeof Card>['sx'] = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--semantic-elevation-shadow-normal-xsmall)',
  display: 'block',
  padding: '20px',
  '& h3': {
    color: 'var(--text-strong)',
    fontSize: '20px',
    letterSpacing: 0,
    lineHeight: 1.35,
    margin: '12px 0 8px',
    wordBreak: 'keep-all',
  },
  '& p': {
    color: 'var(--text-muted)',
    lineHeight: 1.65,
    margin: 0,
    overflowWrap: 'anywhere',
  },
};

function getGridTemplateColumns(columns: WdsGridColumns) {
  return `repeat(${columns}, minmax(0, 1fr))`;
}

export function WdsSectionHeader({
  description,
  flush = false,
  headingTag = 'h2',
  size = 'large',
  title,
  trailingContent,
}: WdsSectionHeaderProps) {
  return (
    <FlexBox
      alignItems="flex-end"
      gap="18px"
      justifyContent="space-between"
      sx={{
        marginBottom: flush ? 0 : '20px',
        '@media (max-width: 900px)': {
          alignItems: 'flex-start',
          flexDirection: 'column',
        },
      }}
    >
      <FlexBox flex="1 1 auto" flexDirection="column" gap="8px" sx={{ minWidth: 0 }}>
        <SectionHeader headingTag={headingTag} size={size}>
          {title}
        </SectionHeader>
        {description ? (
          <Typography
            as="p"
            color="semantic.label.alternative"
            variant="body1"
            sx={{
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '640px',
            }}
          >
            {description}
          </Typography>
        ) : null}
      </FlexBox>
      {trailingContent}
    </FlexBox>
  );
}

export function WdsPageHeader({
  description,
  eyebrow,
  title,
}: WdsPageHeaderProps) {
  return (
    <FlexBox flexDirection="column" gap="10px">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Typography
        as="h1"
        color="semantic.label.strong"
        variant="title2"
        weight="bold"
        sx={{
          lineHeight: 1.28,
          margin: 0,
          maxWidth: '820px',
          overflowWrap: 'break-word',
          wordBreak: 'keep-all',
          '@media (max-width: 560px)': {
            fontSize: '28px',
            lineHeight: 1.25,
          },
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          as="p"
          color="semantic.label.alternative"
          variant="body1"
          sx={{
            lineHeight: 1.65,
            margin: 0,
            maxWidth: '720px',
            overflowWrap: 'break-word',
            wordBreak: 'keep-all',
          }}
        >
          {description}
        </Typography>
      ) : null}
    </FlexBox>
  );
}

export function WdsResponsiveGrid({
  as = 'div',
  children,
  className,
  columns = 3,
  dense = false,
  offset = 'none',
}: WdsResponsiveGridProps) {
  return (
    <PolymorphicBox
      as={as}
      className={className}
      sx={{
        display: 'grid',
        gap: dense ? '12px' : '16px',
        gridTemplateColumns: getGridTemplateColumns(columns),
        marginTop: layoutOffsets[offset],
        '@media (max-width: 900px)': {
          gridTemplateColumns: '1fr',
        },
      }}
    >
      {children}
    </PolymorphicBox>
  );
}

export function WdsDashboardLayout({
  as = 'div',
  children,
  className,
  offset = 'none',
  sidebarWidth = '360px',
}: WdsDashboardLayoutProps) {
  return (
    <PolymorphicBox
      as={as}
      className={className}
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: '18px',
        gridTemplateColumns: `minmax(0, 1fr) ${sidebarWidth}`,
        marginTop: layoutOffsets[offset],
        '@media (max-width: 900px)': {
          gridTemplateColumns: '1fr',
        },
      }}
    >
      {children}
    </PolymorphicBox>
  );
}

export function WdsStack({
  as,
  children,
  className,
  gap = '14px',
  offset = 'none',
}: WdsStackProps) {
  return (
    <FlexBox
      as={as}
      className={className}
      flexDirection="column"
      gap={gap}
      sx={{ marginTop: layoutOffsets[offset] }}
    >
      {children}
    </FlexBox>
  );
}

export function WdsActionRow({
  align = 'center',
  children,
  className,
  justify = 'flex-start',
  offset = 'none',
  reserveBottom = false,
}: WdsActionRowProps) {
  return (
    <FlexBox
      alignItems={align}
      className={className}
      flexWrap="wrap"
      gap="10px"
      justifyContent={justify}
      sx={{
        marginBottom: reserveBottom ? '20px' : undefined,
        marginTop: layoutOffsets[offset],
      }}
    >
      {children}
    </FlexBox>
  );
}

export function WdsBadgeGroup({
  children,
  className,
  offset = 'none',
}: WdsBadgeGroupProps) {
  return (
    <FlexBox
      alignItems="center"
      className={className}
      flexWrap="wrap"
      gap="8px"
      sx={{ marginTop: layoutOffsets[offset] }}
    >
      {children}
    </FlexBox>
  );
}

export function WdsFormActions({ actions, helper }: WdsFormActionsProps) {
  return (
    <FlexBox
      alignItems="center"
      gap="14px"
      justifyContent="space-between"
      sx={{
        '@media (max-width: 560px)': {
          alignItems: 'stretch',
          flexDirection: 'column',
        },
      }}
    >
      {helper ? <p className="helper-text">{helper}</p> : null}
      {actions}
    </FlexBox>
  );
}

export function WdsOffset({
  as = 'div',
  children,
  className,
  offset = 'sm',
}: WdsOffsetProps) {
  return (
    <PolymorphicBox
      as={as}
      className={className}
      sx={{ marginTop: layoutOffsets[offset] }}
    >
      {children}
    </PolymorphicBox>
  );
}

export function WdsSurfaceCard({
  as = 'div',
  className,
  platform = 'desktop',
  sx,
  ...props
}: WdsSurfaceCardProps) {
  return (
    <PolymorphicCard
      as={as}
      className={className}
      platform={platform}
      sx={sx ? [surfaceCardSx, sx] : surfaceCardSx}
      {...props}
    />
  );
}
