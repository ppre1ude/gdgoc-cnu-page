import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyActivityDraftSuggestion,
  createActivityDraftSuggestion,
  describeActivityDraftAssistantError,
  describeActivityDraftAssistantResult,
  validateActivityDraftSuggestion,
} from './ai-draft.ts';

describe('AI-assisted activity draft suggestions', () => {
  it('creates a structured suggestion from rough operator draft fields', () => {
    const suggestion = createActivityDraftSuggestion({
      title: 'Build with AI Prototype Sprint',
      body: 'Firebase Auth, Firestore CRUD, and Gemini writing support demo.',
      type: 'event',
      visibility: 'public',
    });

    assert.deepEqual(Object.keys(suggestion).sort(), [
      'cardSummary',
      'memberCopy',
      'missingInfo',
      'publicCopy',
      'suggestedTags',
    ]);
    assert.equal(
      suggestion.cardSummary,
      'Build with AI Prototype Sprint: Firebase Auth, Firestore CRUD, and Gemini writing support demo.',
    );
    assert.match(suggestion.memberCopy, /Firebase Auth/);
    assert.match(suggestion.publicCopy, /Build with AI Prototype Sprint/);
    assert.deepEqual(suggestion.suggestedTags, ['event', 'public']);
    assert.deepEqual(suggestion.missingInfo, []);
  });

  it('reports missing core draft fields that the operator should fill before publishing', () => {
    const suggestion = createActivityDraftSuggestion({
      title: 'Build with AI Prototype Sprint',
    });

    assert.equal(suggestion.cardSummary, 'Build with AI Prototype Sprint');
    assert.deepEqual(suggestion.missingInfo, ['body', 'type', 'visibility']);
  });

  it('validates an unknown AI response before treating it as a suggestion', () => {
    const suggestion = validateActivityDraftSuggestion({
      cardSummary: 'Prototype sprint with Firebase and Gemini.',
      memberCopy: 'Join the sprint and bring a rough product idea.',
      publicCopy: 'GDGoC CNU is running a Build with AI prototype sprint.',
      suggestedTags: ['firebase', 'gemini'],
      missingInfo: ['capacity'],
    });

    assert.equal(
      suggestion.publicCopy,
      'GDGoC CNU is running a Build with AI prototype sprint.',
    );
    assert.deepEqual(suggestion.suggestedTags, ['firebase', 'gemini']);

    assert.throws(
      () =>
        validateActivityDraftSuggestion({
          cardSummary: 'Missing array field',
          memberCopy: 'Member copy',
          publicCopy: 'Public copy',
          suggestedTags: ['firebase'],
          missingInfo: 'capacity',
        }),
      /missingInfo must be an array of strings/,
    );
  });

  it('applies only selected suggestion fields to an existing draft', () => {
    const updatedDraft = applyActivityDraftSuggestion(
      {
        title: 'Build with AI Prototype Sprint',
        body: 'Original operator notes stay editable.',
        type: 'event',
        visibility: 'member',
        cardSummary: 'Existing card summary',
        memberCopy: 'Existing member-facing copy',
        publicCopy: 'Existing public-facing copy',
        tags: ['existing'],
      },
      {
        cardSummary: 'AI-generated card summary',
        memberCopy: 'AI-generated member copy',
        publicCopy: 'AI-generated public copy',
        suggestedTags: ['firebase', 'gemini'],
        missingInfo: [],
      },
      {
        cardSummary: true,
        publicCopy: true,
      },
    );

    assert.equal(updatedDraft.cardSummary, 'AI-generated card summary');
    assert.equal(updatedDraft.publicCopy, 'AI-generated public copy');
    assert.equal(updatedDraft.memberCopy, 'Existing member-facing copy');
    assert.deepEqual(updatedDraft.tags, ['existing']);
    assert.equal(updatedDraft.body, 'Original operator notes stay editable.');
  });

  it('describes Gemini, fallback, and failed fallback outcomes for operators', () => {
    assert.equal(
      describeActivityDraftAssistantResult({ provider: 'gemini' }),
      'Gemini 제안을 불러왔습니다.',
    );
    assert.equal(
      describeActivityDraftAssistantResult({ provider: 'local-fallback' }),
      'Gemini 키가 없어 local fallback 제안을 사용했습니다.',
    );
    assert.equal(
      describeActivityDraftAssistantResult({
        provider: 'local-fallback',
        warning: 'Gemini request failed with 429.',
      }),
      'Gemini 호출이 실패해 local fallback 제안을 사용했습니다. Gemini request failed with 429.',
    );
  });

  it('normalizes unrecoverable assistant request errors for the UI', () => {
    assert.equal(
      describeActivityDraftAssistantError(new Error('Network offline')),
      'AI 작성 보조를 불러오지 못했습니다. Network offline',
    );
    assert.equal(
      describeActivityDraftAssistantError('unknown'),
      'AI 작성 보조를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
  });
});
