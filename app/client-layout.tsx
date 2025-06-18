"use client"

import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { LanguageInitializer } from "@/src/i18n/language-initializer";
import { useEffect, useState } from 'react';
import { Geist } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";

// Initialize fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    document.documentElement.className = savedTheme;
    document.documentElement.style.colorScheme = savedTheme;
  }, []);

  // Initialize fonts on mount
  useEffect(() => {
    document.body.className = `${geistSans.variable} ${geistMono.variable} antialiased`;
  }, []);

  // Mark as loaded after a small delay to ensure proper initialization
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Providers session={session}>
      <Toaster
        toastOptions={{
          classNames: {
            icon: "group-data-[type=error]:text-red-500 group-data-[type=success]:text-green-500 group-data-[type=warning]:text-amber-500 group-data-[type=info]:text-blue-500",
          },
        }}
      />
      <LanguageInitializer>
        {children}
      </LanguageInitializer>
    </Providers>
  );
}
