const memberHomeHref = '/member';
const loginHref = '/login';

export function getPublicOnboardingHref() {
  return getLoginHref(memberHomeHref);
}

export function getLegacyJoinRedirectHref() {
  return getPublicOnboardingHref();
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
