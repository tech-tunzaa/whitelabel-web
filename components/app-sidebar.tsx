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
import navigationData from "./sidebar-data";

type ExtendedUser = {
  role: string;
};

// Use the imported navigation data instead of redefining it inline
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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

  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "/avatars/default.jpg",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "/avatars/default.jpg",
      };

  // Filter navigation items based on user role
  const userRole = (session?.user as ExtendedUser)?.role;

  // Consistent filtering logic for both main and secondary navigation
  const filterByRole = (item: any) => {
    if (!userRole) return false;
    // Check if roles is a string (for single role) or an array
    if (typeof item.roles === "string") {
      return item.roles === userRole;
    }
    // Check if the item has a roles array and if it includes the user's role
    return Array.isArray(item.roles) && item.roles.includes(userRole);
  };

  const filteredNavMain = data.navMain.filter(filterByRole);
  const filteredNavSecondary = data.navSecondary.filter(filterByRole);

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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <subItem.icon />
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
                  <a href={item.url}>
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
