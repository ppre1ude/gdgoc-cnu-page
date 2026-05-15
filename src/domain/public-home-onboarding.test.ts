import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  onboardingBrandPoints,
  onboardingDetailSections,
  onboardingPosterPipeline,
  onboardingValueBadges,
  onboardingValueProcess,
} from './public-home-onboarding.ts';

const publicOnboardingCopyFiles = [
  new URL('../app/page.tsx', import.meta.url),
  new URL('./public-home-onboarding.ts', import.meta.url),
];

describe('public home onboarding content', () => {
  it('frames GDGoC CNU around the approved impact and chapter values', () => {
    assert.deepEqual(
      onboardingValueBadges.map((badge) => badge.label),
      ['Impact', 'Connect', 'Learn', 'Grow'],
    );
  });

  it('turns the poster flow into an Impact and Values story', () => {
    assert.deepEqual(onboardingPosterPipeline, [
      'Impact',
      'Connect',
      'Learn',
      'Grow',
    ]);
  });

  it('shows the goal, roles, and benefits external visitors should understand', () => {
    assert.deepEqual(
      onboardingBrandPoints.map((point) => point.label),
      ['Impact', 'Roles', 'Benefits'],
    );
  });

  it('maps the GDGoC value flow to chapter actions', () => {
    assert.deepEqual(
      onboardingValueProcess.map((step) => step.label),
      ['Connect', 'Learn', 'Grow'],
    );
    assert.deepEqual(
      onboardingValueProcess.map((step) => step.kicker),
      ['Community', 'Workshop', 'Project'],
    );
  });

  it('organizes the onboarding detail sections as a numbered value flow', () => {
    assert.deepEqual(
      onboardingDetailSections.map((section) => section.order),
      ['01.', '02.', '03.', '04.'],
    );
    assert.deepEqual(
      onboardingDetailSections.map((section) => section.targetId),
      ['goal', 'connect', 'learn', 'grow'],
    );
    assert.deepEqual(
      onboardingDetailSections.map((section) => section.title),
      ['Impact', 'Connect', 'Learn', 'Grow'],
    );
  });

  it('keeps the value flow grounded in goal, roles, and benefits', () => {
    const processCopy = [
      ...onboardingValueProcess.flatMap((step) => [step.title, step.detail]),
      ...onboardingDetailSections.flatMap((section) => [
        section.description,
        ...section.bullets,
        ...section.tools,
      ]),
      ...onboardingBrandPoints.flatMap((point) => [
        point.detail,
        point.label,
        point.value,
      ]),
    ]
      .join(' ');

    assert.match(processCopy, /Impact|Empower|임팩트|성장/);
    assert.match(processCopy, /워크숍/);
    assert.match(processCopy, /프로젝트/);
    assert.match(processCopy, /Professional|Network|Community|네트워크|커뮤니티/);
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
      ...onboardingDetailSections.flatMap((section) => [
        section.description,
        section.kicker,
        section.title,
        ...section.bullets,
        ...section.tools,
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

  it('identifies CNU as Chonnam National University, not Chungnam National University', () => {
    const publicCopy = publicOnboardingCopyFiles
      .map((fileUrl) => readFileSync(fileUrl, 'utf8'))
      .join(' ');

    assert.doesNotMatch(publicCopy, /충남대|충남대학교|Chungnam/i);
    assert.match(publicCopy, /전남대학교|Chonnam National University/);
  });

  it('keeps the hero copy focused on GDGoC identity rather than tool demos', () => {
    const pageCopy = readFileSync(
      new URL('../app/page.tsx', import.meta.url),
      'utf8',
    );

    assert.match(pageCopy, /Google Developers 생태계/);
    assert.match(pageCopy, /전남대학교 학생 개발자 커뮤니티/);
    assert.match(pageCopy, /Connect, Learn, Grow/);
    assert.doesNotMatch(
      pageCopy,
      /Gemini, Firebase, Google AI Studio 같은 도구로\s*아이디어를 빠르게 실험/u,
    );
  });

  it('uses the approved short hero identity headline', () => {
    const pageCopy = readFileSync(
      new URL('../app/page.tsx', import.meta.url),
      'utf8',
    );

    assert.match(
      pageCopy,
      /<YonseiBannerTextAnimation delaySeconds=\{0\.1\}>\s*We are\s*<\/YonseiBannerTextAnimation>/,
    );
    assert.match(pageCopy, /aria-label="GDGoC CNU"/);
    assert.match(
      pageCopy,
      /<YonseiBannerTextAnimation delaySeconds=\{0\.6\}>\s*Developers\.\s*<\/YonseiBannerTextAnimation>/,
    );
    assert.match(pageCopy, /Connect, Learn, Grow/);
    assert.match(pageCopy, /google-logo-word/);
    assert.match(pageCopy, /google-letter-blue/);
    assert.match(pageCopy, /google-letter-red/);
    assert.match(pageCopy, /google-letter-yellow/);
    assert.match(pageCopy, /google-letter-green/);
    assert.doesNotMatch(pageCopy, /onboardingPosterPipeline\.map/);
    assert.doesNotMatch(pageCopy, /className="poster-flow"/);
    assert.doesNotMatch(pageCopy, /developer-doodle-caption/);
    assert.doesNotMatch(pageCopy, /Connect, Learn, Grow 보기/);
    assert.doesNotMatch(pageCopy, /onboarding-hero-topline/);
    assert.doesNotMatch(pageCopy, /Google Developer Groups on Campus/);
    assert.doesNotMatch(pageCopy, /GDGoC CNU \/ 2026 Build with AI/);
    assert.doesNotMatch(pageCopy, /<span>Build with AI<\/span>/);
    assert.doesNotMatch(pageCopy, /aria-label="Build with AI/);
  });

  it('ports the Yonsei developer banner animation instead of reinterpreting the grid', () => {
    const pageCopy = readFileSync(
      new URL('../app/page.tsx', import.meta.url),
      'utf8',
    );
    const yonseiBannerComponent = readFileSync(
      new URL('../features/onboarding/yonsei-developer-banner.tsx', import.meta.url),
      'utf8',
    );
    const globalStyles = readFileSync(
      new URL('../app/globals.css', import.meta.url),
      'utf8',
    );
    const packageManifest = readFileSync(
      new URL('../../package.json', import.meta.url),
      'utf8',
    );

    assert.match(pageCopy, /YonseiDeveloperBannerDoodle/);
    assert.match(pageCopy, /YonseiBannerTextAnimation/);
    assert.doesNotMatch(pageCopy, /InteractiveDoodlePanel/);
    assert.match(packageManifest, /"css-doodle"/);
    assert.match(yonseiBannerComponent, /import\('css-doodle'\)/);
    assert.match(yonseiBannerComponent, /BlossomDoodle/);
    assert.match(yonseiBannerComponent, /@grid: 6x9/);
    assert.match(yonseiBannerComponent, /@size: 49\.5% 80%/);
    assert.match(yonseiBannerComponent, /:container\s*{\s*background: transparent;/);
    assert.match(yonseiBannerComponent, /shapeFrequency=\{0\.6\}/);
    assert.match(yonseiBannerComponent, /doodleRef\.current\?\.update\?\.\(\)/);
    assert.match(yonseiBannerComponent, /aria-label="GDGoC CNU 가치 그래픽 움직이기"/);
    assert.match(globalStyles, /@keyframes yonsei-banner-text-animation/);
    assert.match(globalStyles, /rotateX\(-80deg\)/);
    assert.match(globalStyles, /--yonsei-banner-scale: 1\.1/);
    assert.doesNotMatch(yonseiBannerComponent, /doodleCellAccents/);
  });
});
