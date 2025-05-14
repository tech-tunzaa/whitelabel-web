import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { GrammarlyFix } from "../components/grammarly-fix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meneja",
  description: "Manage a marketplace or more",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <Providers session={session}>
            <Toaster
              toastOptions={{
                classNames: {
                  icon: "group-data-[type=error]:text-red-500 group-data-[type=success]:text-green-500 group-data-[type=warning]:text-amber-500 group-data-[type=info]:text-blue-500",
                },
              }}
            />
            <GrammarlyFix />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
