import { NextResponse } from 'next/server';

import {
  executeChapterUserMutation,
  parseChapterUserMutationIntent,
} from '@/domain/chapter-user-mutation';
import { createServerChapterUserStore } from '@/features/users/server-chapter-user-store';
import { getFirebaseAdminAuth } from '@/lib/firebase/server';

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Firebase ID token is required.' },
        { status: 401 },
      );
    }

    const intent = parseChapterUserMutationIntent(await request.json());
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const store = createServerChapterUserStore();
    const actor = await store.findUser(decodedToken.uid);

    if (!actor) {
      return NextResponse.json(
        { error: 'Signed-in chapter user does not exist.' },
        { status: 403 },
      );
    }

    const result = await executeChapterUserMutation({
      actorId: actor.id,
      actorRole: actor.role,
      intent,
      now: new Date().toISOString(),
      store,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Chapter user mutation failed.',
      },
      { status: getMutationErrorStatus(error) },
    );
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  const [scheme, token] = authorization.split(' ');

  if (scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

function getMutationErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 500;
  }

  if (error.message.includes('Unsupported chapter user mutation intent')) {
    return 400;
  }

  if (
    error.message.includes('Only operators') ||
    error.message.includes('Only admins') ||
    error.message.includes('cannot') ||
    error.message.includes('last admin')
  ) {
    return 403;
  }

  if (error.message.includes('does not exist')) {
    return 404;
  }

  return 500;
}
