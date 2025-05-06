"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconTruck,
  IconUsers,
  IconCategory,
  IconPackage,
  IconMail,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
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

type ExtendedUser = {
  role: string;
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tenants",
      url: "/dashboard/tenants",
      icon: IconUsers,
      roles: ["super_owner"],
    },
    {
      title: "Vendors",
      url: "/dashboard/vendors",
      icon: IconUsers,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Delivery Partners",
      url: "/dashboard/delivery-partners",
      icon: IconTruck,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Catalog",
      url: "#",
      icon: IconPackage,
      roles: ["super_owner", "admin", "sub_admin", "support"],
      items: [
        {
          title: "Products",
          url: "/dashboard/products",
          icon: IconPackage,
        },
        {
          title: "Categories",
          url: "/dashboard/products/categories",
          icon: IconCategory,
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: IconListDetails,
      roles: ["super_owner", "admin", "sub_admin", "support"],
      items: [
        {
          title: "Delivery",
          url: "/dashboard/orders/delivery",
          icon: IconTruck,
        },
        {
          title: "Refunds",
          url: "/dashboard/orders/refunds",
          icon: IconCreditCard,
        },
      ],
    },
    // {
    //   title: "Refunds",
    //   url: "#",
    //   icon: IconCreditCard,
    //   roles: ["super_owner", "admin", "sub_admin", "support"],
    // },
    {
      title: "Support Tickets",
      url: "/dashboard/support",
      icon: IconHelp,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
    {
      title: "Marketplace Settings",
      url: "/dashboard/marketplace-settings",
      icon: IconSettings,
      roles: ["super_owner", "admin"],

    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      role: "admin",
      items: [
        {
          title: "Active Proposals",
          url: "#",
          role: "admin",
        },
        {
          title: "Archived",
          url: "#",
          role: "admin",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      role: "admin",
      items: [
        {
          title: "Active Proposals",
          url: "#",
          role: "admin",
        },
        {
          title: "Archived",
          url: "#",
          role: "admin",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      role: "admin",
      items: [
        {
          title: "Active Proposals",
          url: "#",
          role: "admin",
        },
        {
          title: "Archived",
          url: "#",
          role: "admin",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
      role: "super_owner",
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
      role: "support",
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
      role: "admin",
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
      role: "admin",
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
      role: "admin",
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
      role: "sub_admin",
    },
  ],
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
  const filteredNavMain = data.navMain.filter((item) => {
    const userRole = (session?.user as ExtendedUser)?.role;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

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
                <IconMail className="h-5 w-5" />
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
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
