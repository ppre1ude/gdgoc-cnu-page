import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { seedActivities } from './seed-activities.ts';

const officialBuildWithAiEventUrl =
  'https://gdg.community.dev/events/details/google-gdg-on-campus-chonnam-national-university-gwangju-south-korea-presents-build-with-ai-prompt-to-product/';

describe('seed activities', () => {
  it('points the Build with AI CTA to the official GDG event page', () => {
    const buildWithAiActivity = seedActivities.find(({ id }) => id === 'seed-bwai');

    assert.ok(buildWithAiActivity);
    assert.equal(buildWithAiActivity.registrationMode, 'hybrid');
    assert.equal(
      buildWithAiActivity.externalRegistrationUrl,
      officialBuildWithAiEventUrl,
    );
  });
});
