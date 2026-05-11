import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyActivityDraftSuggestion,
  createActivityDraftSuggestion,
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
});
