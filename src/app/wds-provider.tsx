'use client';

import { ThemeProvider } from '@wanteddev/wds';
import { AppRouterCacheProvider } from '@wanteddev/wds-nextjs';
import type { ReactNode } from 'react';

export function WdsProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
    </ThemeProvider>
  );
}
