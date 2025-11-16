// src/app/layout.tsx
'use client';

import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 h-full w-full">
                {children}
              </main>
            </div>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
