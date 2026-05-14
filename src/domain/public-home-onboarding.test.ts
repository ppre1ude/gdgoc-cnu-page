import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  onboardingPosterPipeline,
  onboardingProofPoints,
  onboardingToolBadges,
} from './public-home-onboarding.ts';

describe('public home onboarding content', () => {
  it('keeps Build with AI anchored to concrete Google tools', () => {
    assert.deepEqual(
      onboardingToolBadges.map((badge) => badge.label),
      ['Gemini', 'Firebase', 'Stitch', 'AI Studio'],
    );
  });

  it('frames the poster pipeline as a real homepage product loop', () => {
    assert.deepEqual(onboardingPosterPipeline, [
      '아이디어',
      'Gemini 초안',
      'Firebase 저장',
      '멤버 홈 반영',
    ]);
  });

  it('shows the three proof points needed for the Saturday demo narrative', () => {
    assert.deepEqual(
      onboardingProofPoints.map((point) => point.label),
      ['Real CRUD', 'AI-assisted copy', 'Member reflection'],
    );
  });
});
