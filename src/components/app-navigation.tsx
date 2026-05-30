'use client';

import { Box, FlexBox, TopNavigation, TopNavigationButton } from '@wanteddev/wds';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

import { getPrimaryNavigationItems } from '@/domain/navigation';
import { useAuthSession } from '@/features/auth/auth-session-provider';
import { AuthPanel } from './auth-panel';

export function AppNavigation() {
  const { role } = useAuthSession();
  const pathname = usePathname();
  const navigationItems = getPrimaryNavigationItems(role);

  return (
    <Box
      as="header"
      sx={{
        borderBottom: '1px solid var(--line)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <TopNavigation
        background
        leadingContent={
          <TopNavigationButton
            as={Link}
            color="assistive"
            href="/"
            variant="text"
            sx={{
              fontWeight: 800,
              gap: '10px',
              letterSpacing: 0,
            }}
          >
            <span className="brand-mark" aria-hidden="true">
              <span style={{ background: 'var(--google-blue)' }} />
              <span style={{ background: 'var(--google-red)' }} />
              <span style={{ background: 'var(--google-yellow)' }} />
              <span style={{ background: 'var(--google-green)' }} />
            </span>
            GDGoC CNU
          </TopNavigationButton>
        }
        trailingContent={
          <Suspense fallback={null}>
            <AuthPanel />
          </Suspense>
        }
        toolbar={
          <FlexBox
            alignItems="center"
            as="nav"
            aria-label="주요 메뉴"
            flexWrap="nowrap"
            gap="10px"
            sx={{
              minWidth: 0,
              overflowX: 'auto',
              padding: '10px clamp(16px, 5vw, 56px) 14px',
              scrollbarWidth: 'thin',
              width: '100%',
            }}
          >
            {navigationItems.map((item) => {
              const isActive = isNavigationItemActive(pathname, item.href);

              return (
                <TopNavigationButton
                  aria-current={isActive ? 'page' : undefined}
                  as={Link}
                  color={isActive ? 'primary' : 'assistive'}
                  href={item.href}
                  key={item.href}
                  variant="text"
                  sx={{
                    borderRadius: 'var(--radius)',
                    flex: '0 0 auto',
                    fontWeight: 700,
                    letterSpacing: 0,
                    ...(isActive
                      ? {
                        background: 'var(--surface-muted)',
                      }
                      : {}),
                  }}
                >
                  {item.label}
                </TopNavigationButton>
              );
            })}
          </FlexBox>
        }
        sx={{
          '--wds-top-navigation-padding-x': 'clamp(16px, 5vw, 56px)',
          '--wds-top-navigation-padding-y': '14px',
          '& [data-role="top-navigation-wrapper"]': {
            minHeight: '60px',
          },
          '& [data-role="top-navigation-leading-content-wrapper"]': {
            maxWidth: 'calc(100% - 32px)',
          },
          '& [data-role="top-navigation-toolbar"]': {
            borderTop: '1px solid var(--line)',
            overflow: 'hidden',
          },
        }}
      />
    </Box>
  );
}

function isNavigationItemActive(pathname: string, href: string) {
  if (href === '/member') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
