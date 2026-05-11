import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { AuthPanel } from '@/components/auth-panel';
import './globals.css';

export const metadata: Metadata = {
  title: 'GDGoC CNU Activity Hub',
  description: 'GDGoC CNU chapter activity hub powered by Firebase and Gemini.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
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
              <Link className="nav-link" href="/">
                Public
              </Link>
              <Link className="nav-link" href="/member">
                Member Home
              </Link>
              <Link className="nav-link" href="/admin/activities">
                Activity Admin
              </Link>
              <AuthPanel />
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
