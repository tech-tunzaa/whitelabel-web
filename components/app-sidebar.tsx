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
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";

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
} from "@/components/ui/sidebar";

type UserRole = "super_owner" | "admin" | "sub_admin" | "support";

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tenants",
      url: "#",
      icon: IconUsers,
      roles: ["super_owner"],
    },
    {
      title: "Vendors",
      url: "#",
      icon: IconUsers,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Products",
      url: "#",
      icon: IconDatabase,
      roles: ["super_owner", "admin", "sub_admin"],
    },
    {
      title: "Orders",
      url: "#",
      icon: IconListDetails,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
    {
      title: "Refunds",
      url: "#",
      icon: IconCreditCard,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
    {
      title: "Delivery",
      url: "#",
      icon: IconTruck,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
    {
      title: "Support Tickets",
      url: "#",
      icon: IconHelp,
      roles: ["super_owner", "admin", "sub_admin", "support"],
    },
    {
      title: "Settings",
      url: "#",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={filteredNavMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
