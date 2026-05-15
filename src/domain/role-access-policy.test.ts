import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  adminUserRoles,
  assignableUserRoles,
  canApplyToActivities,
  canReadPublishedResource,
  canViewMemberContent,
  getMemberHomeContentRole,
  getReadablePublishedVisibilities,
  isActiveMemberRole,
  isAdminRole,
  isAssignableUserRole,
  isKnownUserRole,
  isOperatorRole,
  isRoleAllowed,
  operatorUserRoles,
  shouldUseUnfilteredContentRead,
  type UserRole,
  userRoles,
} from './role-access-policy.ts';

const roles = [
  'visitor',
  'guest',
  'member',
  'alumni',
  'team_member',
  'organizer',
  'admin',
] as const satisfies readonly UserRole[];

describe('role and access policy', () => {
  it('checks published resource visibility by role', () => {
    const expectedVisible = {
      visitor: ['public'],
      guest: ['public'],
      member: ['public', 'member'],
      alumni: ['public', 'member'],
      team_member: ['public', 'member', 'operator'],
      organizer: ['public', 'member', 'operator'],
      admin: ['public', 'member', 'operator'],
    } satisfies Record<UserRole, string[]>;

    for (const role of roles) {
      assert.deepEqual(
        getReadablePublishedVisibilities(role),
        expectedVisible[role],
      );

      for (const visibility of ['public', 'member', 'operator'] as const) {
        assert.equal(
          canReadPublishedResource(role, {
            status: 'published',
            visibility,
          }),
          expectedVisible[role].includes(visibility),
          `${role} visibility ${visibility}`,
        );
      }

      assert.equal(
        canReadPublishedResource(role, {
          status: 'draft',
          visibility: 'public',
        }),
        false,
      );
      assert.equal(
        canReadPublishedResource(role, {
          status: 'pending_review',
          visibility: 'member',
        }),
        false,
      );
      assert.equal(
        canReadPublishedResource(role, {
          status: 'archived',
          visibility: 'operator',
        }),
        false,
      );
    }
  });

  it('classifies active member, operator, and admin roles', () => {
    const expected = {
      visitor: {
        activeMember: false,
        admin: false,
        operator: false,
      },
      guest: {
        activeMember: false,
        admin: false,
        operator: false,
      },
      member: {
        activeMember: true,
        admin: false,
        operator: false,
      },
      alumni: {
        activeMember: false,
        admin: false,
        operator: false,
      },
      team_member: {
        activeMember: true,
        admin: false,
        operator: true,
      },
      organizer: {
        activeMember: true,
        admin: false,
        operator: true,
      },
      admin: {
        activeMember: true,
        admin: true,
        operator: true,
      },
    } satisfies Record<
      UserRole,
      {
        activeMember: boolean;
        admin: boolean;
        operator: boolean;
      }
    >;

    for (const role of roles) {
      assert.equal(isActiveMemberRole(role), expected[role].activeMember);
      assert.equal(isOperatorRole(role), expected[role].operator);
      assert.equal(isAdminRole(role), expected[role].admin);
    }
  });

  it('describes member content and activity application access by role', () => {
    for (const role of roles) {
      assert.equal(
        canViewMemberContent(role),
        ['member', 'alumni', 'team_member', 'organizer', 'admin'].includes(role),
      );
      assert.equal(
        canApplyToActivities(role),
        ['member', 'team_member', 'organizer', 'admin'].includes(role),
      );
    }
  });

  it('normalizes member home content role without exposing operator content', () => {
    assert.deepEqual(
      Object.fromEntries(roles.map((role) => [role, getMemberHomeContentRole(role)])),
      {
        visitor: 'visitor',
        guest: 'guest',
        member: 'member',
        alumni: 'member',
        team_member: 'member',
        organizer: 'member',
        admin: 'member',
      },
    );
  });

  it('checks route gate roles and unfiltered operator reads', () => {
    assert.deepEqual(operatorUserRoles, ['team_member', 'organizer', 'admin']);
    assert.deepEqual(adminUserRoles, ['admin']);
    assert.equal(isRoleAllowed('organizer', operatorUserRoles), true);
    assert.equal(isRoleAllowed('member', operatorUserRoles), false);
    assert.equal(shouldUseUnfilteredContentRead(undefined), true);
    assert.equal(shouldUseUnfilteredContentRead('team_member'), true);
    assert.equal(shouldUseUnfilteredContentRead('alumni'), false);
  });

  it('accepts only known and assignable user roles', () => {
    assert.deepEqual(userRoles, roles);
    assert.deepEqual(assignableUserRoles, [
      'guest',
      'member',
      'alumni',
      'team_member',
      'organizer',
      'admin',
    ]);
    assert.equal(isKnownUserRole('admin'), true);
    assert.equal(isKnownUserRole('owner'), false);
    assert.equal(isAssignableUserRole('admin'), true);
    assert.equal(isAssignableUserRole('visitor'), false);
  });
});
