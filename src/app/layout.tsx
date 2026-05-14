import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppNavigation } from '@/components/app-navigation';
import { AuthSessionProvider } from '@/features/auth/auth-session-provider';
import { WdsProvider } from './wds-provider';
import '@wanteddev/wds/global.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'GDGoC CNU Activity Hub',
  description: 'GDGoC CNU chapter activity hub powered by Firebase and Gemini.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-jp-dynamic-subset.min.css"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <WdsProvider>
          <AuthSessionProvider>
            <div className="app-shell">
              <AppNavigation />
              {children}
            </div>
          </AuthSessionProvider>
        </WdsProvider>
      </body>
    </html>
  );
}
