import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  acceptActivityProposal,
  createActivity,
  createInMemoryActivityStore,
  getVisibleActivityById,
  listPendingActivityProposals,
  listHomeActivities,
  proposeMemberActivity,
} from './activity-service.ts';
import type { Activity } from './activity.ts';

describe('activity authoring flow', () => {
  it('lets an operator create an activity that appears in the member home list', async () => {
    const store = createInMemoryActivityStore();

    const activity = await createActivity(store, {
      actorRole: 'team_member',
      title: 'Build with AI Prototype Sprint',
      summary: 'Firebase와 Gemini로 챕터 홈페이지의 핵심 흐름을 만든다.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-16T04:00:00.000Z',
      registrationMode: 'hybrid',
      externalRegistrationUrl: 'https://gdg.community.dev/events/example',
      externalRegistrationLabel: 'gdg.community.dev 등록',
      now: '2026-05-11T09:00:00.000Z',
    });

    const memberHomeActivities = await listHomeActivities(store, 'member');

    assert.equal(memberHomeActivities.length, 1);
    assert.equal(memberHomeActivities[0]?.id, activity.id);
    assert.equal(memberHomeActivities[0]?.title, 'Build with AI Prototype Sprint');
    assert.equal(memberHomeActivities[0]?.registrationMode, 'hybrid');
    assert.equal(
      memberHomeActivities[0]?.externalRegistrationUrl,
      'https://gdg.community.dev/events/example',
    );
  });

  it('lets an active member propose a study that appears in member home immediately', async () => {
    const store = createInMemoryActivityStore();

    const proposal = await proposeMemberActivity(store, {
      actorRole: 'member',
      actorUserId: 'member-1',
      title: 'Gemini API Deep Dive',
      summary: 'Weekly study for Gemini API examples.',
      type: 'study',
      now: '2026-05-12T09:00:00.000Z',
    });

    const memberHomeActivities = await listHomeActivities(store, 'member');

    assert.equal(proposal.status, 'published');
    assert.equal(proposal.visibility, 'member');
    assert.equal(proposal.proposalStatus, 'accepted');
    assert.equal(proposal.proposedByUserId, 'member-1');
    assert.equal(memberHomeActivities[0]?.id, proposal.id);
  });

  it('keeps a member project proposal in the operator review queue until approval', async () => {
    const store = createInMemoryActivityStore();

    const proposal = await proposeMemberActivity(store, {
      actorRole: 'member',
      actorUserId: 'member-1',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      now: '2026-05-12T09:00:00.000Z',
    });

    const memberHomeActivities = await listHomeActivities(store, 'member');
    const pendingProposals = await listPendingActivityProposals(store, 'team_member');

    assert.equal(proposal.status, 'draft');
    assert.equal(proposal.visibility, 'operator');
    assert.equal(proposal.proposalStatus, 'pending_review');
    assert.equal(memberHomeActivities.length, 0);
    assert.equal(pendingProposals[0]?.id, proposal.id);
  });

  it('lets an operator approve a pending project proposal for member home', async () => {
    const store = createInMemoryActivityStore();
    const proposal = await proposeMemberActivity(store, {
      actorRole: 'member',
      actorUserId: 'member-1',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      now: '2026-05-12T09:00:00.000Z',
    });

    const accepted = await acceptActivityProposal(store, {
      actorRole: 'team_member',
      actorUserId: 'operator-1',
      activityId: proposal.id,
      now: '2026-05-13T09:00:00.000Z',
    });
    const memberHomeActivities = await listHomeActivities(store, 'member');

    assert.equal(accepted.status, 'published');
    assert.equal(accepted.visibility, 'member');
    assert.equal(accepted.proposalStatus, 'accepted');
    assert.equal(accepted.proposalReviewedByUserId, 'operator-1');
    assert.equal(memberHomeActivities[0]?.id, proposal.id);
  });

  it('blocks guests and alumni from proposing member activities', async () => {
    const store = createInMemoryActivityStore();

    await assert.rejects(
      proposeMemberActivity(store, {
        actorRole: 'guest',
        actorUserId: 'guest-1',
        title: 'Guest Study',
        summary: 'This should not be created.',
        type: 'study',
        now: '2026-05-12T09:00:00.000Z',
      }),
      /Only active members can propose activities/,
    );

    await assert.rejects(
      proposeMemberActivity(store, {
        actorRole: 'alumni',
        actorUserId: 'alumni-1',
        title: 'Alumni Project',
        summary: 'This should not be created.',
        type: 'project',
        now: '2026-05-12T09:00:00.000Z',
      }),
      /Only active members can propose activities/,
    );
  });

  it('blocks non-operators from approving project proposals', async () => {
    const store = createInMemoryActivityStore();
    const proposal = await proposeMemberActivity(store, {
      actorRole: 'member',
      actorUserId: 'member-1',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      now: '2026-05-12T09:00:00.000Z',
    });

    await assert.rejects(
      acceptActivityProposal(store, {
        actorRole: 'member',
        actorUserId: 'member-2',
        activityId: proposal.id,
        now: '2026-05-13T09:00:00.000Z',
      }),
      /Only operators can approve activity proposals/,
    );
  });
});

describe('activity detail lookup', () => {
  const publishedActivity: Activity = {
    id: 'activity-public',
    title: 'Build with AI Prototype Sprint',
    summary: 'Firebase and Gemini demo activity.',
    type: 'event',
    visibility: 'public',
    status: 'published',
    startsAt: '2026-05-16T04:00:00.000Z',
    createdAt: '2026-05-11T09:00:00.000Z',
    updatedAt: '2026-05-11T09:00:00.000Z',
  };

  it('returns a visible activity detail for the current role', async () => {
    const store = createInMemoryActivityStore([publishedActivity]);

    const activity = await getVisibleActivityById(
      store,
      'activity-public',
      'visitor',
    );

    assert.equal(activity?.id, 'activity-public');
  });

  it('hides member-only activity detail from visitors', async () => {
    const store = createInMemoryActivityStore([
      {
        ...publishedActivity,
        id: 'activity-member',
        visibility: 'member',
      },
    ]);

    const activity = await getVisibleActivityById(
      store,
      'activity-member',
      'visitor',
    );

    assert.equal(activity, null);
  });

  it('does not return draft activity detail', async () => {
    const store = createInMemoryActivityStore([
      {
        ...publishedActivity,
        id: 'activity-draft',
        status: 'draft',
      },
    ]);

    const activity = await getVisibleActivityById(
      store,
      'activity-draft',
      'admin',
    );

    assert.equal(activity, null);
  });
});
