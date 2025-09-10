"use client";

import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconBell,
} from "@tabler/icons-react";

import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { NotificationTrigger } from "@/components/notification-trigger";
import { navigationData, NavItem } from "./sidebar-data";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import useAuthStore from "@/features/auth/store";

// Use the imported navigation data instead of redefining it inline
const data = {

  navMain: navigationData.navMain,
  navSecondary: navigationData.navSecondary,
  navClouds: navigationData.navClouds,
  documents: navigationData.documents,
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNotificationClick?: () => void;
}

export function AppSidebar({ onNotificationClick, ...props }: AppSidebarProps) {
  const { data: session } = useSession();
  const { can, hasRole, isLoading } = usePermissions();
  const userFromStore = useAuthStore((state) => state.user);

  const user = userFromStore
    ? {
        name: userFromStore.name,
        email: userFromStore.email,
        avatar: session?.user?.image || "/avatars/default.jpg", // Still get avatar from session for now
      }
    : {
        name: "Guest",
        email: "",
        avatar: "/avatars/default.jpg",
      };

  const filterByPermissionAndRole = (item: NavItem) => {
    // Check permission requirement
    const hasRequiredPermission = !item.requiredPermission || can(item.requiredPermission);
    
    // Check role requirement
    const hasRequiredRole = !item.requiredRole || hasRole(item.requiredRole);
    
    // Both conditions must be met
    return hasRequiredPermission && hasRequiredRole;
  };

  const filteredNavMain = React.useMemo(() => {
    if (isLoading) return [];
    return data.navMain.filter(filterByPermissionAndRole);
  }, [can, hasRole, isLoading]);

  const filteredNavSecondary = React.useMemo(() => {
    if (isLoading) return [];
    return data.navSecondary.filter(filterByPermissionAndRole);
  }, [can, hasRole, isLoading]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Meneja Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="Dashboard"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <a href="/dashboard">
                <IconDashboard />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
            <NotificationTrigger>
              <Button
                variant="outline"
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                onClick={onNotificationClick}
              >
                <IconBell className="h-5 w-5" />
              </Button>
            </NotificationTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {filteredNavMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.items ? (
                <>
                  <SidebarMenuButton
                    asChild
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                  >
                    <a href={item.url} target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  className="data-[slot=sidebar-menu-button]:!p-1.5"
                >
                  <a href={item.url} target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
