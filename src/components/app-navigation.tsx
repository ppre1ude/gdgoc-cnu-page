'use client';

import Link from 'next/link';
import { Suspense } from 'react';

import { getPrimaryNavigationItems } from '@/domain/navigation';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { AuthPanel } from './auth-panel';

export function AppNavigation() {
  const { role } = useAuthSession();
  const navigationItems = getPrimaryNavigationItems(role);

  return (
    <header className="top-nav">
      <Link className="brand-lockup" href="/">
        <span className="brand-mark" aria-hidden="true">
          <span style={{ background: 'var(--google-blue)' }} />
          <span style={{ background: 'var(--google-red)' }} />
          <span style={{ background: 'var(--google-yellow)' }} />
          <span style={{ background: 'var(--google-green)' }} />
        </span>
        GDGoC CNU
      </Link>
      <nav className="nav-links" aria-label="주요 메뉴">
        {navigationItems.map((item) => (
          <Link className="nav-link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        <Suspense fallback={null}>
          <AuthPanel />
        </Suspense>
      </nav>
    </header>
  );
}
