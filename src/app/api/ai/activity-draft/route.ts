import { NextResponse } from 'next/server';

import {
  createActivityDraftSuggestion,
  validateActivityDraftSuggestion,
  type OperatorActivityDraft,
} from '@/domain/ai-draft';

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function POST(request: Request) {
  const draft = (await request.json()) as OperatorActivityDraft;
  const fallback = createActivityDraftSuggestion(draft);

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      provider: 'local-fallback',
      suggestion: fallback,
    });
  }

  try {
    const suggestion = await requestGeminiSuggestion(draft);

    return NextResponse.json({
      provider: 'gemini',
      suggestion,
    });
  } catch (error) {
    return NextResponse.json(
      {
        provider: 'local-fallback',
        suggestion: fallback,
        warning:
          error instanceof Error
            ? error.message
            : 'Gemini suggestion failed; local fallback was used.',
      },
      { status: 200 },
    );
  }
}

async function requestGeminiSuggestion(draft: OperatorActivityDraft) {
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: [
                  'You help GDGoC CNU operators draft activity content.',
                  'Return only JSON with cardSummary, memberCopy, publicCopy, suggestedTags, missingInfo.',
                  'Keep Korean copy concise and operational.',
                  JSON.stringify(draft),
                ].join('\n'),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('\n');

  if (!text) {
    throw new Error('Gemini returned an empty suggestion.');
  }

  return validateActivityDraftSuggestion(JSON.parse(text));
}
