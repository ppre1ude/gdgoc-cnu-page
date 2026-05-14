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

export type ActivityDraftAssistantProvider = 'gemini' | 'local-fallback';

export type ActivityDraftAssistantResult = {
  provider: ActivityDraftAssistantProvider;
  warning?: string;
};

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

export function describeActivityDraftAssistantResult(
  result: ActivityDraftAssistantResult,
): string {
  if (result.provider === 'gemini') {
    return 'Gemini 제안을 불러왔습니다.';
  }

  if (result.warning) {
    return `Gemini 호출이 실패해 local fallback 제안을 사용했습니다. ${result.warning}`;
  }

  return 'Gemini 키가 없어 local fallback 제안을 사용했습니다.';
}

export function describeActivityDraftAssistantError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return `AI 작성 보조를 불러오지 못했습니다. ${error.message}`;
  }

  return 'AI 작성 보조를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
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
