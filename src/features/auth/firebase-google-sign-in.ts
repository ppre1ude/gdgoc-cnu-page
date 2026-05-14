export type GoogleSignInDependencies<TAuth, TProvider> = {
  auth: TAuth;
  provider: TProvider;
  signInWithPopup: (auth: TAuth, provider: TProvider) => Promise<unknown>;
  signInWithRedirect: (auth: TAuth, provider: TProvider) => Promise<unknown>;
};

export type GoogleSignInResult = 'popup' | 'redirect';

export async function signInWithPopupOrRedirect<TAuth, TProvider>({
  auth,
  provider,
  signInWithPopup,
  signInWithRedirect,
}: GoogleSignInDependencies<TAuth, TProvider>): Promise<GoogleSignInResult> {
  try {
    await signInWithPopup(auth, provider);
    return 'popup';
  } catch (error) {
    if (!isPopupBlockedAuthError(error)) {
      throw error;
    }

    await signInWithRedirect(auth, provider);
    return 'redirect';
  }
}

export function isPopupBlockedAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? error.code : undefined;

  if (code === 'auth/popup-blocked') {
    return true;
  }

  const message = 'message' in error ? error.message : undefined;

  return (
    typeof message === 'string' && message.includes('auth/popup-blocked')
  );
}
