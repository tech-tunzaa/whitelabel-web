"use client";

import { AppSidebar } from "@/components/app-sidebar";

import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NotificationSheet } from "@/components/notification-sheet";
import { useState, useEffect } from "react";
import React from "react";
import { useSession } from "next-auth/react";
import useAuthStore from "@/features/auth/store";
import { Role } from "@/features/auth/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { data: session } = useSession();
  const { setUser, fetchPermissions } = useAuthStore();

  useEffect(() => {
    if (session?.user?.id) {
      const sessionUser = session.user as any;
      const userWithRoles = {
        id: session.user.id,
        name: session.user.name ?? "Guest",
        email: session.user.email ?? "",
        // Store roles as strings for the auth store, but also keep the original structure for extractUserRoles
        roles: sessionUser.role ? [sessionUser.role] : (sessionUser.roles || []),
        // Keep the original structure for extractUserRoles function
        rolesData: sessionUser.role ? [{ role: sessionUser.role }] : (sessionUser.roles ? sessionUser.roles.map((r: any) => ({ role: r })) : []),
      };
      setUser(userWithRoles);

      const tenantId = (session.user as any)?.tenant_id;
      if (tenantId) {
        const headers = { 'X-Tenant-ID': tenantId };
        fetchPermissions(session.user.id, headers);
      }
    }
  }, [session, setUser, fetchPermissions]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        onNotificationClick={() => setIsNotificationOpen(true)} 
      />
      <SidebarInset>
        <React.Fragment key="header">
          <SiteHeader />
        </React.Fragment>
        <React.Fragment key="content">
          {children}
        </React.Fragment>
      </SidebarInset>
      <NotificationSheet 
        open={isNotificationOpen} 
        onOpenChange={setIsNotificationOpen} 
      />
    </SidebarProvider>
  );
}
