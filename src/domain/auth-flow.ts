import type { UserRole } from './activity.ts';

const memberHomeHref = '/member';
const joinHref = '/join';
const loginHref = '/login';

export type JoinFlowAuthStatus =
  | 'loading'
  | 'demo'
  | 'signed_out'
  | 'signed_in';

export type JoinFlowState =
  | 'loading'
  | 'login_required'
  | 'demo_guest_required'
  | 'profile'
  | 'already_member';

export function getPublicJoinHref() {
  return joinHref;
}

export function getLoginHref(nextPath = memberHomeHref) {
  const params = new URLSearchParams({
    next: resolveSafeNextPath(nextPath),
  });

  return `${loginHref}?${params.toString()}`;
}

export function getRouteLoginHref(
  pathname: string | null | undefined,
  searchParams?: URLSearchParams | { toString: () => string } | string | null,
) {
  return getLoginHref(getRouteNextPath(pathname, searchParams));
}

export function getRouteNextPath(
  pathname: string | null | undefined,
  searchParams?: URLSearchParams | { toString: () => string } | string | null,
) {
  const safePathname = resolveSafeNextPath(pathname);

  if (safePathname === loginHref) {
    return memberHomeHref;
  }

  const query = normalizeSearchParams(searchParams);

  return resolveSafeNextPath(`${safePathname}${query}`);
}

export function getJoinFlowState({
  isFirebaseConfigured,
  role,
  status,
}: {
  isFirebaseConfigured: boolean;
  role: UserRole;
  status: JoinFlowAuthStatus;
}): JoinFlowState {
  if (status === 'loading') {
    return 'loading';
  }

  if (!isFirebaseConfigured && status === 'demo' && role !== 'guest') {
    return 'demo_guest_required';
  }

  if ((status === 'signed_in' || status === 'demo') && role === 'guest') {
    return 'profile';
  }

  if (role === 'visitor' || status === 'signed_out') {
    return 'login_required';
  }

  return 'already_member';
}

export function resolveSafeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return memberHomeHref;
  }

  return nextPath;
}

function normalizeSearchParams(
  searchParams?: URLSearchParams | { toString: () => string } | string | null,
) {
  if (!searchParams) {
    return '';
  }

  const value =
    typeof searchParams === 'string' ? searchParams : searchParams.toString();
  const trimmedValue = value.startsWith('?') ? value.slice(1) : value;

  return trimmedValue ? `?${trimmedValue}` : '';
}
