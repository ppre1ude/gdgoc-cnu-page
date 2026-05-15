export type GoogleSignInDependencies<TAuth, TProvider> = {
  auth: TAuth;
  provider: TProvider;
  signInWithPopup: (auth: TAuth, provider: TProvider) => Promise<unknown>;
  signInWithRedirect: (auth: TAuth, provider: TProvider) => Promise<unknown>;
};

export type GoogleSignInResult = 'popup' | 'redirect';

const popupBlockedAuthCode = 'auth/popup-blocked';

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

  const code = getStringProperty(error, 'code');

  if (code) {
    return code === popupBlockedAuthCode;
  }

  const message = getStringProperty(error, 'message');

  return isFirebasePopupBlockedMessage(message);
}

function getStringProperty(
  value: object,
  propertyName: 'code' | 'message',
) {
  const candidate = (value as Record<string, unknown>)[propertyName];
  return typeof candidate === 'string' ? candidate : undefined;
}

function isFirebasePopupBlockedMessage(message: string | undefined) {
  return (
    typeof message === 'string' &&
    message.startsWith('Firebase: Error') &&
    message.includes(`(${popupBlockedAuthCode})`)
  );
}
