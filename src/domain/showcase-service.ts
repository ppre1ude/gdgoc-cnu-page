import type {
  ActivityStatus,
  ActivityVisibility,
  UserRole,
} from './activity.ts';
import {
  type Showcase,
  type ShowcaseKind,
  getSafeShowcaseHref,
  listVisibleShowcases,
  normalizeShowcase,
  normalizeShowcases,
} from './showcase.ts';
import { isOperatorRole } from './role-access-policy.ts';

export type ShowcaseStore = {
  create(showcase: Showcase): Promise<Showcase>;
  list(role?: UserRole): Promise<Showcase[]>;
};

export type CreateShowcaseInput = {
  actorRole: UserRole;
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
  now: string;
};

export function createInMemoryShowcaseStore(
  initialShowcases: Showcase[] = [],
): ShowcaseStore {
  const showcases = [...initialShowcases];

  return {
    async create(showcase) {
      showcases.push(showcase);
      return showcase;
    },
    async list() {
      return [...showcases];
    },
  };
}

export async function createShowcase(
  store: ShowcaseStore,
  input: CreateShowcaseInput,
): Promise<Showcase> {
  if (!isOperatorRole(input.actorRole)) {
    throw new Error('Only operators can create showcases.');
  }

  return store.create(
    normalizeShowcase({
      id: `showcase-${crypto.randomUUID()}`,
      title: input.title,
      summary: input.summary,
      body: input.body,
      kind: input.kind,
      imageUrl: input.imageUrl,
      href: getSafeShowcaseHref(input.href),
      tags: input.tags,
      relatedActivityId: input.relatedActivityId,
      visibility: input.visibility,
      status: input.status,
      publishedAt: input.publishedAt,
      createdAt: input.now,
      updatedAt: input.now,
    }),
  );
}

export async function listHomeShowcases(
  store: ShowcaseStore,
  role: UserRole,
): Promise<Showcase[]> {
  const showcases = await store.list(role);

  return listVisibleShowcases(normalizeShowcases(showcases), role).sort((a, b) => {
    const bTimestamp = b.publishedAt ?? b.updatedAt;
    const aTimestamp = a.publishedAt ?? a.updatedAt;

    return bTimestamp.localeCompare(aTimestamp);
  });
}
