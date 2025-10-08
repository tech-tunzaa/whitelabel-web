import { AuthSiteHeader } from "@/components/auth-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Manage a marketplace or more",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthSiteHeader />
      {/* page main content */}
      {children}
      {/* page main content ends */}
    </>
  );
}
