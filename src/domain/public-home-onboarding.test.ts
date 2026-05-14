import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  onboardingBrandPoints,
  onboardingPosterPipeline,
  onboardingValueBadges,
} from './public-home-onboarding.ts';

describe('public home onboarding content', () => {
  it('frames GDGoC CNU around the chapter values', () => {
    assert.deepEqual(
      onboardingValueBadges.map((badge) => badge.label),
      ['Connect', 'Learn', 'Grow'],
    );
  });

  it('turns the poster flow into an external visitor brand story', () => {
    assert.deepEqual(onboardingPosterPipeline, [
      'Connect',
      'Learn',
      'Grow',
      'Impact',
    ]);
  });

  it('shows the goal, roles, and benefits external visitors should understand', () => {
    assert.deepEqual(
      onboardingBrandPoints.map((point) => point.label),
      ['Goal', 'Roles', 'Benefits'],
    );
  });

  it('does not expose internal demo or implementation copy on the public onboarding surface', () => {
    const publicCopy = [
      ...onboardingValueBadges.map((badge) => badge.label),
      ...onboardingPosterPipeline,
      ...onboardingBrandPoints.flatMap((point) => [
        point.detail,
        point.label,
        point.value,
      ]),
    ].join(' ');

    assert.doesNotMatch(
      publicCopy,
      /Saturday Demo|operator note|Firestore|Real CRUD|AI-assisted copy|Member reflection|현재성/,
    );
  });
});
