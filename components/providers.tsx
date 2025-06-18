'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { NotificationProvider } from '@/lib/notification-context';

export function Providers({
  session,
  children
}: {
  session: SessionProviderProps['session'];
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <SessionProvider session={session}>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
