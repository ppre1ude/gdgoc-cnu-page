import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isPopupBlockedAuthError,
  signInWithPopupOrRedirect,
} from './firebase-google-sign-in.ts';

describe('Firebase Google sign-in flow', () => {
  it('falls back to redirect sign-in when the browser blocks the popup', async () => {
    const calls: string[] = [];

    const result = await signInWithPopupOrRedirect({
      auth: {},
      provider: {},
      async signInWithPopup() {
        calls.push('popup');
        throw { code: 'auth/popup-blocked' };
      },
      async signInWithRedirect() {
        calls.push('redirect');
      },
    });

    assert.equal(result, 'redirect');
    assert.deepEqual(calls, ['popup', 'redirect']);
  });

  it('does not hide unrelated Firebase Auth errors', async () => {
    const originalError = { code: 'auth/operation-not-allowed' };

    await assert.rejects(
      signInWithPopupOrRedirect({
        auth: {},
        provider: {},
        async signInWithPopup() {
          throw originalError;
        },
        async signInWithRedirect() {
          throw new Error('redirect should not run');
        },
      }),
      originalError,
    );
  });

  it('recognizes popup-blocked errors from Firebase message text', () => {
    assert.equal(
      isPopupBlockedAuthError(
        new Error('Firebase: Error (auth/popup-blocked).'),
      ),
      true,
    );
  });
});
