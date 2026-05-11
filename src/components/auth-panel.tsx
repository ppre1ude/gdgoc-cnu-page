'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

import { getFirebaseAuth, hasFirebaseConfig } from '@/lib/firebase/client';

export function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(hasFirebaseConfig());

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      return;
    }

    let unsubscribe = () => {};

    void import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
        setUser(nextUser);
        setIsLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  async function signIn() {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
  }

  async function signOutUser() {
    const { signOut } = await import('firebase/auth');
    await signOut(getFirebaseAuth());
  }

  if (!hasFirebaseConfig()) {
    return <span className="auth-pill">Demo mode</span>;
  }

  if (isLoading) {
    return <span className="auth-pill">Auth 확인 중</span>;
  }

  if (user) {
    return (
      <button className="auth-pill auth-button" onClick={signOutUser} type="button">
        {user.displayName ?? user.email ?? '로그아웃'}
      </button>
    );
  }

  return (
    <button className="auth-pill auth-button" onClick={signIn} type="button">
      Google 로그인
    </button>
  );
}
