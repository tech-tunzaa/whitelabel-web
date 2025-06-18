import { ReactNode } from "react";
import type { Metadata } from "next";
import ClientLayout from "./client-layout";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Meneja - Dashboard",
  description: "Meneja Dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth();
  
  return (
    <html>
      <body>
        <div id="root">
          <ClientLayout session={session}>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  );
}
