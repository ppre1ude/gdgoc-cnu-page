import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppNavigation } from '@/components/app-navigation';
import { AuthSessionProvider } from '@/features/auth/auth-session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GDGoC CNU Activity Hub',
  description: 'GDGoC CNU chapter activity hub powered by Firebase and Gemini.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>
          <div className="app-shell">
            <AppNavigation />
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
