export type UserRole =
  | 'visitor'
  | 'guest'
  | 'member'
  | 'alumni'
  | 'team_member'
  | 'organizer'
  | 'admin';

export type AccessVisibility = 'public' | 'member' | 'operator';
export type PublishableAccessStatus =
  | 'archived'
  | 'draft'
  | 'pending_review'
  | 'published';
export type PublishableAccessResource = {
  status: PublishableAccessStatus;
  visibility: AccessVisibility;
};

export type AssignableUserRole = Exclude<UserRole, 'visitor'>;

export const userRoles = [
  'visitor',
  'guest',
  'member',
  'alumni',
  'team_member',
  'organizer',
  'admin',
] as const satisfies readonly UserRole[];

export const assignableUserRoles = [
  'guest',
  'member',
  'alumni',
  'team_member',
  'organizer',
  'admin',
] as const satisfies readonly AssignableUserRole[];

export const activeMemberUserRoles = [
  'member',
  'team_member',
  'organizer',
  'admin',
] as const satisfies readonly UserRole[];

export const operatorUserRoles = [
  'team_member',
  'organizer',
  'admin',
] as const satisfies readonly UserRole[];

export const adminUserRoles = ['admin'] as const satisfies readonly UserRole[];

const userRoleSet = new Set<UserRole>(userRoles);
const assignableUserRoleSet = new Set<UserRole>(assignableUserRoles);
const activeMemberUserRoleSet = new Set<UserRole>(activeMemberUserRoles);
const operatorUserRoleSet = new Set<UserRole>(operatorUserRoles);
const adminUserRoleSet = new Set<UserRole>(adminUserRoles);

const roleVisibilityRank: Record<UserRole, number> = {
  admin: 2,
  alumni: 1,
  guest: 0,
  member: 1,
  organizer: 2,
  team_member: 2,
  visitor: 0,
};

const visibilityRank: Record<AccessVisibility, number> = {
  member: 1,
  operator: 2,
  public: 0,
};

export function isKnownUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && userRoleSet.has(value as UserRole);
}

export function isAssignableUserRole(
  value: unknown,
): value is AssignableUserRole {
  return (
    typeof value === 'string' &&
    assignableUserRoleSet.has(value as UserRole)
  );
}

export function isActiveMemberRole(role: UserRole): boolean {
  return activeMemberUserRoleSet.has(role);
}

export function isOperatorRole(role: UserRole): boolean {
  return operatorUserRoleSet.has(role);
}

export function isAdminRole(role: UserRole): boolean {
  return adminUserRoleSet.has(role);
}

export function canViewMemberContent(role: UserRole): boolean {
  return roleVisibilityRank[role] >= visibilityRank.member;
}

export function canApplyToActivities(role: UserRole): boolean {
  return isActiveMemberRole(role);
}

export function getMemberHomeContentRole(role: UserRole): UserRole {
  if (role === 'visitor' || role === 'guest') {
    return role;
  }

  return 'member';
}

export function canReadPublishedResource(
  role: UserRole,
  resource: PublishableAccessResource,
): boolean {
  return (
    resource.status === 'published' &&
    visibilityRank[resource.visibility] <= roleVisibilityRank[role]
  );
}

export function getReadablePublishedVisibilities(
  role: UserRole,
): AccessVisibility[] {
  if (isOperatorRole(role)) {
    return ['public', 'member', 'operator'];
  }

  if (canViewMemberContent(role)) {
    return ['public', 'member'];
  }

  return ['public'];
}

export function shouldUseUnfilteredContentRead(
  role: UserRole | undefined,
): boolean {
  return role === undefined || isOperatorRole(role);
}

export function isRoleAllowed(
  role: UserRole,
  allowedRoles: readonly UserRole[],
): boolean {
  return allowedRoles.includes(role);
}
