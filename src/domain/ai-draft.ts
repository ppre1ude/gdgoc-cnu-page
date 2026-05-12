import type { ActivityType, ActivityVisibility } from './activity.ts';

export type OperatorActivityDraft = {
  title?: string;
  body?: string;
  type?: ActivityType;
  visibility?: ActivityVisibility;
  cardSummary?: string;
  memberCopy?: string;
  publicCopy?: string;
  tags?: string[];
};

export type ActivityDraftSuggestion = {
  cardSummary: string;
  memberCopy: string;
  publicCopy: string;
  suggestedTags: string[];
  missingInfo: string[];
};

export type ActivityDraftSuggestionSelection = Partial<
  Record<'cardSummary' | 'memberCopy' | 'publicCopy' | 'suggestedTags', boolean>
>;

export function createActivityDraftSuggestion(
  draft: OperatorActivityDraft,
): ActivityDraftSuggestion {
  const title = draft.title?.trim() ?? 'Untitled activity';
  const body = draft.body?.trim() ?? '';
  const summary = body ? `${title}: ${body}` : title;
  const missingInfo = collectMissingInfo(draft);
  const suggestedTags = [draft.type, draft.visibility].filter(Boolean) as string[];

  return {
    cardSummary: summary,
    memberCopy: body,
    publicCopy: summary,
    suggestedTags,
    missingInfo,
  };
}

export function validateActivityDraftSuggestion(
  value: unknown,
): ActivityDraftSuggestion {
  if (!isRecord(value)) {
    throw new Error('Activity draft suggestion must be an object.');
  }

  return {
    cardSummary: readString(value, 'cardSummary'),
    memberCopy: readString(value, 'memberCopy'),
    publicCopy: readString(value, 'publicCopy'),
    suggestedTags: readStringArray(value, 'suggestedTags'),
    missingInfo: readStringArray(value, 'missingInfo'),
  };
}

export function applyActivityDraftSuggestion(
  draft: OperatorActivityDraft,
  suggestion: ActivityDraftSuggestion,
  selection: ActivityDraftSuggestionSelection,
): OperatorActivityDraft {
  const nextDraft = { ...draft };

  if (draft.tags) {
    nextDraft.tags = [...draft.tags];
  }

  if (selection.cardSummary) {
    nextDraft.cardSummary = suggestion.cardSummary;
  }

  if (selection.memberCopy) {
    nextDraft.memberCopy = suggestion.memberCopy;
  }

  if (selection.publicCopy) {
    nextDraft.publicCopy = suggestion.publicCopy;
  }

  if (selection.suggestedTags) {
    nextDraft.tags = [...suggestion.suggestedTags];
  }

  return nextDraft;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: Record<string, unknown>, key: string): string {
  const field = value[key];

  if (typeof field !== 'string') {
    throw new Error(`${key} must be a string.`);
  }

  return field;
}

function readStringArray(value: Record<string, unknown>, key: string): string[] {
  const field = value[key];

  if (!Array.isArray(field) || field.some((item) => typeof item !== 'string')) {
    throw new Error(`${key} must be an array of strings.`);
  }

  return field;
}

function collectMissingInfo(draft: OperatorActivityDraft): string[] {
  const missingInfo: string[] = [];

  if (!draft.title?.trim()) {
    missingInfo.push('title');
  }

  if (!draft.body?.trim()) {
    missingInfo.push('body');
  }

  if (!draft.type) {
    missingInfo.push('type');
  }

  if (!draft.visibility) {
    missingInfo.push('visibility');
  }

  return missingInfo;
}
