import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  acceptActivityProposal,
  archiveActivity,
  createActivity,
  createInMemoryActivityStore,
  getVisibleActivityById,
  listPublicHomeActivities,
  listPendingActivityProposals,
  listHomeActivities,
  proposeMemberActivity,
  updateActivity,
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

  it('lets an operator update editable activity fields while preserving identity and proposal metadata', async () => {
    const originalActivity: Activity = {
      id: 'activity-existing',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      visibility: 'operator',
      status: 'draft',
      startsAt: '2026-05-12T09:00:00.000Z',
      registrationMode: 'internal',
      proposalStatus: 'pending_review',
      proposedByUserId: 'member-1',
      proposalSubmittedAt: '2026-05-12T09:00:00.000Z',
      createdAt: '2026-05-12T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    const updated = await updateActivity(store, {
      actorRole: 'team_member',
      activityId: originalActivity.id,
      title: 'Build with AI Demo Day',
      summary: 'Showcase member prototypes made with Gemini and Firebase.',
      type: 'event',
      visibility: 'public',
      status: 'published',
      startsAt: '2026-05-20T09:00:00.000Z',
      registrationMode: 'external',
      externalRegistrationUrl: 'https://gdg.community.dev/events/demo-day',
      now: '2026-05-14T09:00:00.000Z',
    });
    const activities = await store.list();

    assert.equal(updated.id, originalActivity.id);
    assert.equal(updated.createdAt, originalActivity.createdAt);
    assert.equal(updated.updatedAt, '2026-05-14T09:00:00.000Z');
    assert.equal(updated.title, 'Build with AI Demo Day');
    assert.equal(updated.summary, 'Showcase member prototypes made with Gemini and Firebase.');
    assert.equal(updated.type, 'event');
    assert.equal(updated.visibility, 'public');
    assert.equal(updated.status, 'published');
    assert.equal(updated.startsAt, '2026-05-20T09:00:00.000Z');
    assert.equal(updated.registrationMode, 'external');
    assert.equal(updated.externalRegistrationUrl, 'https://gdg.community.dev/events/demo-day');
    assert.equal(updated.externalRegistrationLabel, undefined);
    assert.equal(updated.proposalStatus, 'pending_review');
    assert.equal(updated.proposedByUserId, 'member-1');
    assert.equal(updated.proposalSubmittedAt, '2026-05-12T09:00:00.000Z');
    assert.deepEqual(activities[0], updated);
  });

  it('stores external registration URLs only for external or hybrid registration', async () => {
    const store = createInMemoryActivityStore();

    const internalActivity = await createActivity(store, {
      actorRole: 'team_member',
      title: 'Internal Seminar',
      summary: 'Registration happens inside the homepage.',
      type: 'event',
      visibility: 'member',
      status: 'published',
      registrationMode: 'internal',
      externalRegistrationUrl: 'https://gdg.community.dev/events/unused',
      now: '2026-05-14T09:00:00.000Z',
    });

    const externalActivity = await createActivity(store, {
      actorRole: 'team_member',
      title: 'GDG Korea Event',
      summary: 'Registration happens on gdg.community.dev.',
      type: 'event',
      visibility: 'public',
      status: 'published',
      registrationMode: 'external',
      externalRegistrationUrl: 'https://gdg.community.dev/events/gdg-korea',
      now: '2026-05-14T09:00:00.000Z',
    });

    assert.equal(internalActivity.externalRegistrationUrl, undefined);
    assert.equal(internalActivity.externalRegistrationLabel, undefined);
    assert.equal(
      externalActivity.externalRegistrationUrl,
      'https://gdg.community.dev/events/gdg-korea',
    );
    assert.equal(externalActivity.externalRegistrationLabel, undefined);
  });

  it('requires title and summary when creating official activities', async () => {
    const store = createInMemoryActivityStore();

    await assert.rejects(
      createActivity(store, {
        actorRole: 'team_member',
        title: '   ',
        summary: 'Registration happens inside the homepage.',
        type: 'event',
        visibility: 'member',
        status: 'published',
        registrationMode: 'internal',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /Activity title is required/,
    );

    await assert.rejects(
      createActivity(store, {
        actorRole: 'team_member',
        title: 'Internal Seminar',
        summary: '',
        type: 'event',
        visibility: 'member',
        status: 'published',
        registrationMode: 'internal',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /Activity summary is required/,
    );
  });

  it('requires an external URL for external or hybrid registration', async () => {
    const store = createInMemoryActivityStore();

    await assert.rejects(
      createActivity(store, {
        actorRole: 'team_member',
        title: 'GDG Korea Event',
        summary: 'Registration happens on gdg.community.dev.',
        type: 'event',
        visibility: 'public',
        status: 'published',
        registrationMode: 'external',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /External registration URL is required/,
    );

    await assert.rejects(
      createActivity(store, {
        actorRole: 'team_member',
        title: 'Build with AI Sprint',
        summary: 'Members apply internally and visitors register externally.',
        type: 'event',
        visibility: 'public',
        status: 'published',
        registrationMode: 'hybrid',
        externalRegistrationUrl: '   ',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /External registration URL is required/,
    );
  });

  it('preserves an existing external URL when updating other activity fields', async () => {
    const originalActivity: Activity = {
      id: 'activity-external',
      title: 'GDG Korea Event',
      summary: 'Registration happens on gdg.community.dev.',
      type: 'event',
      visibility: 'public',
      status: 'published',
      registrationMode: 'external',
      externalRegistrationUrl: 'https://gdg.community.dev/events/gdg-korea',
      createdAt: '2026-05-14T09:00:00.000Z',
      updatedAt: '2026-05-14T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    const updated = await updateActivity(store, {
      actorRole: 'team_member',
      activityId: originalActivity.id,
      title: 'GDG Korea Event Updated',
      summary: originalActivity.summary,
      type: originalActivity.type,
      visibility: originalActivity.visibility,
      status: originalActivity.status,
      registrationMode: 'external',
      now: '2026-05-14T10:00:00.000Z',
    });

    assert.equal(
      updated.externalRegistrationUrl,
      'https://gdg.community.dev/events/gdg-korea',
    );
  });

  it('clears stale external registration fields when switching to internal registration', async () => {
    const originalActivity: Activity = {
      id: 'activity-external',
      title: 'GDG Korea Event',
      summary: 'Registration happens on gdg.community.dev.',
      type: 'event',
      visibility: 'public',
      status: 'published',
      registrationMode: 'hybrid',
      externalRegistrationUrl: 'https://gdg.community.dev/events/gdg-korea',
      externalRegistrationLabel: 'gdg.community.dev 등록',
      createdAt: '2026-05-14T09:00:00.000Z',
      updatedAt: '2026-05-14T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    const updated = await updateActivity(store, {
      actorRole: 'team_member',
      activityId: originalActivity.id,
      title: originalActivity.title,
      summary: originalActivity.summary,
      type: originalActivity.type,
      visibility: originalActivity.visibility,
      status: originalActivity.status,
      registrationMode: 'none',
      externalRegistrationUrl: originalActivity.externalRegistrationUrl,
      now: '2026-05-14T10:00:00.000Z',
    });

    assert.equal(updated.registrationMode, 'none');
    assert.equal(updated.externalRegistrationUrl, undefined);
    assert.equal(updated.externalRegistrationLabel, undefined);
  });

  it('blocks non-operators from updating activities', async () => {
    const originalActivity: Activity = {
      id: 'activity-existing',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      visibility: 'operator',
      status: 'draft',
      createdAt: '2026-05-12T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    await assert.rejects(
      updateActivity(store, {
        actorRole: 'member',
        activityId: originalActivity.id,
        title: 'Build with AI Demo Day',
        summary: 'Showcase member prototypes made with Gemini and Firebase.',
        type: 'event',
        visibility: 'public',
        status: 'published',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /Only operators can update activities/,
    );

    assert.deepEqual((await store.list())[0], originalActivity);
  });

  it('throws a clear error when updating a missing activity', async () => {
    const store = createInMemoryActivityStore();

    await assert.rejects(
      updateActivity(store, {
        actorRole: 'team_member',
        activityId: 'activity-missing',
        title: 'Build with AI Demo Day',
        summary: 'Showcase member prototypes made with Gemini and Firebase.',
        type: 'event',
        visibility: 'public',
        status: 'published',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /Activity was not found: activity-missing/,
    );
  });

  it('lets an operator archive an activity while preserving activity metadata', async () => {
    const originalActivity: Activity = {
      id: 'activity-existing',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      visibility: 'member',
      status: 'published',
      startsAt: '2026-05-20T09:00:00.000Z',
      registrationMode: 'hybrid',
      externalRegistrationUrl: 'https://gdg.community.dev/events/demo-day',
      externalRegistrationLabel: 'GDG event page',
      proposalStatus: 'accepted',
      proposedByUserId: 'member-1',
      proposalSubmittedAt: '2026-05-12T09:00:00.000Z',
      proposalReviewedAt: '2026-05-13T09:00:00.000Z',
      proposalReviewedByUserId: 'operator-1',
      createdAt: '2026-05-12T09:00:00.000Z',
      updatedAt: '2026-05-13T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    const archived = await archiveActivity(store, {
      actorRole: 'organizer',
      activityId: originalActivity.id,
      now: '2026-05-14T09:00:00.000Z',
    });
    const memberHomeActivities = await listHomeActivities(store, 'member');
    const memberDetailActivity = await getVisibleActivityById(
      store,
      originalActivity.id,
      'member',
    );

    assert.equal(archived.id, originalActivity.id);
    assert.equal(archived.createdAt, originalActivity.createdAt);
    assert.equal(archived.updatedAt, '2026-05-14T09:00:00.000Z');
    assert.equal(archived.status, 'archived');
    assert.equal(archived.title, originalActivity.title);
    assert.equal(archived.summary, originalActivity.summary);
    assert.equal(archived.type, originalActivity.type);
    assert.equal(archived.visibility, originalActivity.visibility);
    assert.equal(archived.startsAt, originalActivity.startsAt);
    assert.equal(archived.registrationMode, originalActivity.registrationMode);
    assert.equal(
      archived.externalRegistrationUrl,
      originalActivity.externalRegistrationUrl,
    );
    assert.equal(
      archived.externalRegistrationLabel,
      originalActivity.externalRegistrationLabel,
    );
    assert.equal(archived.proposalStatus, originalActivity.proposalStatus);
    assert.equal(archived.proposedByUserId, originalActivity.proposedByUserId);
    assert.equal(
      archived.proposalSubmittedAt,
      originalActivity.proposalSubmittedAt,
    );
    assert.equal(
      archived.proposalReviewedAt,
      originalActivity.proposalReviewedAt,
    );
    assert.equal(
      archived.proposalReviewedByUserId,
      originalActivity.proposalReviewedByUserId,
    );
    assert.equal(memberHomeActivities.length, 0);
    assert.equal(memberDetailActivity, null);
  });

  it('blocks non-operators from archiving activities', async () => {
    const originalActivity: Activity = {
      id: 'activity-existing',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      visibility: 'member',
      status: 'published',
      createdAt: '2026-05-12T09:00:00.000Z',
      updatedAt: '2026-05-12T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    await assert.rejects(
      archiveActivity(store, {
        actorRole: 'member',
        activityId: originalActivity.id,
        now: '2026-05-14T09:00:00.000Z',
      }),
      /Only operators can archive activities/,
    );

    assert.deepEqual((await store.list())[0], originalActivity);
  });

  it('throws a clear error when archiving a missing activity', async () => {
    const store = createInMemoryActivityStore();

    await assert.rejects(
      archiveActivity(store, {
        actorRole: 'team_member',
        activityId: 'activity-missing',
        now: '2026-05-14T09:00:00.000Z',
      }),
      /Activity was not found: activity-missing/,
    );
  });

  it('archives an already archived activity idempotently', async () => {
    const originalActivity: Activity = {
      id: 'activity-existing',
      title: 'Campus Map Assistant',
      summary: 'Prototype a Gemini powered campus navigation helper.',
      type: 'project',
      visibility: 'member',
      status: 'archived',
      createdAt: '2026-05-12T09:00:00.000Z',
      updatedAt: '2026-05-13T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([originalActivity]);

    const archived = await archiveActivity(store, {
      actorRole: 'admin',
      activityId: originalActivity.id,
      now: '2026-05-14T09:00:00.000Z',
    });
    const activities = await store.list();

    assert.equal(archived.id, originalActivity.id);
    assert.equal(archived.status, 'archived');
    assert.equal(archived.updatedAt, '2026-05-14T09:00:00.000Z');
    assert.equal(activities.length, 1);
    assert.deepEqual(activities[0], archived);
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

describe('public home activity list', () => {
  it('shows newly published public activities without leaking member-only or archived content', async () => {
    const publicActivity: Activity = {
      id: 'activity-public',
      title: 'Build with AI Open Demo',
      summary: 'Visitors can see this public event.',
      type: 'event',
      visibility: 'public',
      status: 'published',
      startsAt: '2026-05-16T04:00:00.000Z',
      createdAt: '2026-05-11T09:00:00.000Z',
      updatedAt: '2026-05-11T09:00:00.000Z',
    };
    const store = createInMemoryActivityStore([
      {
        ...publicActivity,
        id: 'activity-member',
        title: 'Member-only Study',
        visibility: 'member',
      },
      {
        ...publicActivity,
        id: 'activity-archived',
        title: 'Archived Public Event',
        status: 'archived',
      },
    ]);
    await createActivity(store, {
      actorRole: 'team_member',
      title: publicActivity.title,
      summary: publicActivity.summary,
      type: publicActivity.type,
      visibility: publicActivity.visibility,
      status: publicActivity.status,
      startsAt: publicActivity.startsAt,
      now: publicActivity.createdAt,
    });

    const activities = await listPublicHomeActivities(store);

    assert.deepEqual(
      activities.map((activity) => activity.title),
      ['Build with AI Open Demo'],
    );
  });
});
