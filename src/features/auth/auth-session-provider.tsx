'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from 'firebase/auth';

import type { UserRole } from '@/domain/activity';
import { ensureGoogleGuestAccount } from '@/domain/chapter-user-service';
import { getFirebaseAuth, hasFirebaseConfig } from '@/lib/firebase/client';
import { createBrowserChapterUserStore } from '../users/browser-chapter-user-store';
import { signInWithPopupOrRedirect } from './firebase-google-sign-in';

export type AuthSessionStatus =
  | 'loading'
  | 'demo'
  | 'signed_out'
  | 'signed_in';

export type AuthSession = {
  displayName?: string;
  email?: string;
  errorMessage?: string;
  isFirebaseConfigured: boolean;
  role: UserRole;
  setDemoRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signOutCurrentUser: () => Promise<void>;
  status: AuthSessionStatus;
  userId: string;
};

export const demoRoleStorageKey = 'gdgoc-cnu.demoRole';
export const demoRoleOptions: UserRole[] = [
  'visitor',
  'guest',
  'member',
  'alumni',
  'team_member',
  'organizer',
  'admin',
];

const defaultDemoRole: UserRole = 'team_member';
const visitorUserId = 'visitor';

const AuthSessionContext = createContext<AuthSession | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const userStore = useMemo(() => createBrowserChapterUserStore(), []);
  const isFirebaseConfigured = hasFirebaseConfig();
  const [sessionState, setSessionState] = useState<
    Pick<
      AuthSession,
      'displayName' | 'email' | 'errorMessage' | 'role' | 'status' | 'userId'
    >
  >({
    role: 'visitor',
    status: isFirebaseConfigured ? 'loading' : 'demo',
    userId: visitorUserId,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const savedRole =
        typeof window === 'undefined'
          ? null
          : window.localStorage.getItem(demoRoleStorageKey);
      const initialRole = isUserRole(savedRole) ? savedRole : defaultDemoRole;
      setSessionState(createDemoSessionState(initialRole));
      return;
    }

    let isCancelled = false;
    let unsubscribe: (() => void) | undefined;

    void import('firebase/auth')
      .then(({ onAuthStateChanged }) => {
        if (isCancelled) {
          return;
        }

        unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
          void syncFirebaseUser(user);
        });
      })
      .catch((error: unknown) => {
        setSessionState({
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Firebase Auth를 초기화하지 못했습니다.',
          role: 'visitor',
          status: 'signed_out',
          userId: visitorUserId,
        });
      });

    return () => {
      isCancelled = true;
      unsubscribe?.();
    };
  }, [isFirebaseConfigured, userStore]);

  async function syncFirebaseUser(user: User | null) {
    if (!user) {
      setSessionState({
        role: 'visitor',
        status: 'signed_out',
        userId: visitorUserId,
      });
      return;
    }

    try {
      const existingChapterUser = await userStore.findUser(user.uid);
      const chapterUser =
        existingChapterUser ??
        (await ensureGoogleGuestAccount(userStore, {
          displayName: user.displayName ?? user.email ?? 'Google User',
          email: user.email ?? '',
          id: user.uid,
          now: new Date().toISOString(),
        }));

      setSessionState({
        displayName: chapterUser.displayName,
        email: chapterUser.email,
        role: chapterUser.role,
        status: 'signed_in',
        userId: chapterUser.id,
      });
    } catch (error) {
      setSessionState({
        errorMessage:
          error instanceof Error
            ? error.message
            : '사용자 역할 정보를 불러오지 못했습니다.',
        role: 'visitor',
        status: 'signed_out',
        userId: visitorUserId,
      });
    }
  }

  function setDemoRole(role: UserRole) {
    if (isFirebaseConfigured) {
      return;
    }

    window.localStorage.setItem(demoRoleStorageKey, role);
    setSessionState(createDemoSessionState(role));
  }

  async function signInWithGoogle() {
    if (!isFirebaseConfigured) {
      return;
    }

    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } =
      await import('firebase/auth');
    await signInWithPopupOrRedirect({
      auth: getFirebaseAuth(),
      provider: new GoogleAuthProvider(),
      signInWithPopup,
      signInWithRedirect,
    });
  }

  async function signOutCurrentUser() {
    if (!isFirebaseConfigured) {
      return;
    }

    const { signOut } = await import('firebase/auth');
    await signOut(getFirebaseAuth());
  }

  return (
    <AuthSessionContext.Provider
      value={{
        ...sessionState,
        isFirebaseConfigured,
        setDemoRole,
        signInWithGoogle,
        signOutCurrentUser,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const session = useContext(AuthSessionContext);

  if (!session) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider.');
  }

  return session;
}

export function isUserRole(value: string | null): value is UserRole {
  return demoRoleOptions.includes(value as UserRole);
}

function createDemoSessionState(role: UserRole) {
  return {
    displayName: getDemoDisplayName(role),
    email: `${role}.demo@example.com`,
    role,
    status: 'demo' as const,
    userId: getDemoUserId(role),
  };
}

function getDemoUserId(role: UserRole) {
  if (role === 'guest') {
    return 'demo-guest';
  }

  if (role === 'team_member' || role === 'organizer') {
    return 'seed-user-team-1';
  }

  if (role === 'admin') {
    return 'seed-user-admin-1';
  }

  if (role === 'visitor') {
    return visitorUserId;
  }

  return 'demo-member';
}

function getDemoDisplayName(role: UserRole) {
  if (role === 'visitor') {
    return 'Visitor';
  }

  return `Demo ${role}`;
}
