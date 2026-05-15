import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  onboardingBrandPoints,
  onboardingPosterPipeline,
  onboardingValueBadges,
  onboardingValueProcess,
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

  it('maps Common Vow-inspired value flow to chapter actions', () => {
    assert.deepEqual(
      onboardingValueProcess.map((step) => step.label),
      ['Connect', 'Learn', 'Grow', 'Impact'],
    );
    assert.deepEqual(
      onboardingValueProcess.map((step) => step.kicker),
      ['Network', 'Workshop', 'Project', 'Community'],
    );
  });

  it('keeps the value flow grounded in workshops, projects, and community impact', () => {
    const processCopy = onboardingValueProcess
      .flatMap((step) => [step.title, step.detail])
      .join(' ');

    assert.match(processCopy, /워크숍/);
    assert.match(processCopy, /프로젝트/);
    assert.match(processCopy, /커뮤니티/);
  });

  it('does not expose internal demo or implementation copy on the public onboarding surface', () => {
    const publicCopy = [
      ...onboardingValueBadges.map((badge) => badge.label),
      ...onboardingPosterPipeline,
      ...onboardingValueProcess.flatMap((step) => [
        step.detail,
        step.kicker,
        step.label,
        step.title,
      ]),
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
