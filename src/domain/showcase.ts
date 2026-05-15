import type {
  ActivityStatus,
  ActivityVisibility,
  UserRole,
} from './activity.ts';
import { canReadPublishedResource } from './role-access-policy.ts';

export type ShowcaseKind =
  | 'achievement'
  | 'retrospective'
  | 'project_result'
  | 'gallery';

export type Showcase = {
  id: string;
  title: string;
  summary: string;
  body?: string;
  kind: ShowcaseKind;
  imageUrl?: string;
  href?: string;
  tags: string[];
  relatedActivityId?: string;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const showcaseKinds = new Set<ShowcaseKind>([
  'achievement',
  'retrospective',
  'project_result',
  'gallery',
]);
const showcaseVisibilities = new Set<ActivityVisibility>([
  'public',
  'member',
  'operator',
]);
const showcaseStatuses = new Set<ActivityStatus>([
  'draft',
  'published',
  'archived',
]);

export function listVisibleShowcases(
  showcases: Showcase[],
  role: UserRole,
): Showcase[] {
  return showcases.filter((showcase) =>
    canReadPublishedResource(role, showcase),
  );
}

export function getSafeShowcaseHref(href: unknown): string | undefined {
  if (typeof href !== 'string') {
    return undefined;
  }

  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return undefined;
  }

  if (trimmedHref.startsWith('/') && !trimmedHref.startsWith('//')) {
    return trimmedHref;
  }

  try {
    const parsedUrl = new URL(trimmedHref);

    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
      ? trimmedHref
      : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeShowcase(showcase: Showcase): Showcase {
  return {
    ...showcase,
    href: getSafeShowcaseHref(showcase.href),
    tags: normalizeTags(showcase.tags),
  };
}

export function normalizeShowcases(values: unknown): Showcase[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((value) => {
    const showcase = toShowcase(value);

    return showcase ? [showcase] : [];
  });
}

function toShowcase(value: unknown): Showcase | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isRequiredShowcaseString(value.id) ||
    !isRequiredShowcaseString(value.title) ||
    !isRequiredShowcaseString(value.summary) ||
    !isShowcaseKind(value.kind) ||
    !isShowcaseVisibility(value.visibility) ||
    !isShowcaseStatus(value.status) ||
    !isRequiredShowcaseString(value.createdAt) ||
    !isRequiredShowcaseString(value.updatedAt)
  ) {
    return null;
  }

  return normalizeShowcase({
    id: value.id,
    title: value.title,
    summary: value.summary,
    body: optionalString(value.body),
    kind: value.kind,
    imageUrl: optionalString(value.imageUrl),
    href: optionalString(value.href),
    tags: normalizeTags(value.tags),
    relatedActivityId: optionalString(value.relatedActivityId),
    visibility: value.visibility,
    status: value.status,
    publishedAt: optionalString(value.publishedAt),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRequiredShowcaseString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function isShowcaseKind(value: unknown): value is ShowcaseKind {
  return typeof value === 'string' && showcaseKinds.has(value as ShowcaseKind);
}

function isShowcaseVisibility(value: unknown): value is ActivityVisibility {
  return (
    typeof value === 'string' &&
    showcaseVisibilities.has(value as ActivityVisibility)
  );
}

function isShowcaseStatus(value: unknown): value is ActivityStatus {
  return typeof value === 'string' && showcaseStatuses.has(value as ActivityStatus);
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
